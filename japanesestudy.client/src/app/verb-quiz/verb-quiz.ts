import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextToSpeech } from '../service/text-to-speech';
import { VerbService, VerbQuizQuestion } from '../service/verb'; 

@Component({
  selector: 'app-verb-quiz',
  standalone: false,
  templateUrl: './verb-quiz.html',
  styleUrl: './verb-quiz.css',
})
export class VerbQuiz implements OnInit {
  questions: VerbQuizQuestion[] = [];
  currentIndex: number = 0;
  score: number = 0;

  selectedOption: string | null = null;
  isSubmitted: boolean = false;
  isFinished: boolean = false;

  public reviewIndex: number = 0; // 專門給最後「回顧模式」用的索引

  constructor(private verbQuizService: VerbService,
    private cdr: ChangeDetectorRef,
    private ttsService: TextToSpeech) { }

  ngOnInit(): void {
    this.restartGame();
  }

  // 取得當前題目
  get currentQuestion(): VerbQuizQuestion {
    return this.questions[this.currentIndex];
  }

  // 重新開始遊戲 (抽 10 題)
  restartGame(): void {
    this.reviewIndex = 0;
    this.currentIndex = 0;
    this.score = 0;
    this.isFinished = false;
    this.resetQuestionState();

    this.verbQuizService.getRandomQuizQuestions(5).subscribe({
      next: (data) => {
        this.questions = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('載入題目失敗：', err)
    });
  }

  // 選擇答案
  selectOption(option: string): void {
    if (this.isSubmitted) return; // 答完後不能重選
    this.selectedOption = option;
    this.isSubmitted = true;

    // ★ 1. 記錄玩家揀嘅答案落當前題目（供最後結算對照）
    if (this.currentQuestion) {
      this.currentQuestion.userAnswer = option;
    }

    // ★ 2. 計算分數
    if (this.selectedOption === this.currentQuestion.correctAnswer) {
      this.score++;
    }
    this.cdr.detectChanges();
  }

  // 下一題 / 結算
  nextQuestion(): void {
    if (!this.selectedOption) return;

    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.resetQuestionState();
    } else {
      this.isFinished = true;
      this.reviewIndex = 0; // 完成時預設由第 1 題開始睇
    }
    this.cdr.detectChanges();
  }

  // 取得動態按鈕 CSS Class
  getOptionClass(option: string): string {
    if (!this.isSubmitted) {
      return this.selectedOption === option ? 'btn-outline-custom active' : 'btn-outline-custom';
    }

    if (option === this.currentQuestion.correctAnswer) {
      return 'btn-success-custom';
    }

    if (this.selectedOption === option && option !== this.currentQuestion.correctAnswer) {
      return 'btn-danger-custom';
    }

    return 'btn-disabled-custom';
  }

  // 答案標號 (0 -> A, 1 -> B, ...)
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // 重置每題狀態
  private resetQuestionState(): void {
    this.selectedOption = null;
    this.isSubmitted = false;
  }

  playAudio(text: string): void {
    if (text) {
      this.ttsService.speak(text);
    }
  }

}
