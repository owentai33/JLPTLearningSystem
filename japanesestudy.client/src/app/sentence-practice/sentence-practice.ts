import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentenceService, SentenceQuestion } from '../service/sentence';

export interface QuizRecord {
  question: SentenceQuestion;
  userAnswer: string[];
  isCorrect: boolean;
}

// 定義單字選項狀態
export interface ChoiceItem {
  id: number;        // 原本陣列中的位置 index
  text: string;      // 詞語文字
  selected: boolean; // 是否已被選取
}

@Component({
  selector: 'app-sentence-practice',
  standalone: false,
  templateUrl: './sentence-practice.html',
  styleUrl: './sentence-practice.css',
})
export class SentencePractice implements OnInit {
  totalQuestionsCount = 5;
  quizQuestions: SentenceQuestion[] = [];
  currentIndex = 0;
  score = 0;

  currentQuestion!: SentenceQuestion;


  // 核心改動：將 choices 包裝成帶有 selected 狀態的物件陣列
  choicesList: ChoiceItem[] = [];       // 固定保持原本順序的選項
  userAnswerList: ChoiceItem[] = [];    // 玩家選取的答案順序

  isSubmitted = false;
  isCorrect = false;
  isQuizCompleted = false;

  quizHistory: QuizRecord[] = [];

  constructor(
    private sentenceService: SentenceService,
    private cdr: ChangeDetectorRef // 👈 2. 注入 ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.startNewQuiz();
  }

  startNewQuiz(): void {
    this.sentenceService.getRandomFiveQuestions(this.totalQuestionsCount).subscribe({
      next: (questions) => {
        this.quizQuestions = questions;
        this.currentIndex = 0;
        this.score = 0;
        this.quizHistory = [];
        this.isQuizCompleted = false;
        this.loadQuestion(0);
      },
      error: (err) => {
        console.error('無法讀取 JSON 題庫：', err);
      }
    });
  }

  loadQuestion(index: number): void {
    this.currentQuestion = this.quizQuestions[index];
    this.userAnswerList = [];

    // 初始化選項，記錄原始 index 並設 selected 為 false
    this.choicesList = this.currentQuestion.choices.map((text, i) => ({
      id: i,
      text: text,
      selected: false
    }));

    this.isSubmitted = false;
    this.isCorrect = false;
    this.cdr.detectChanges();
  }

  // 點擊下方選項
  selectWord(item: ChoiceItem): void {
    if (this.isSubmitted || item.selected) return;
    item.selected = true; // 標記為已選擇（下方隱藏）
    this.userAnswerList.push(item); // 加入上方組合槽
  }

  // 點擊上方組合槽取消選擇
  removeWord(item: ChoiceItem, indexInAnswer: number): void {
    if (this.isSubmitted) return;
    item.selected = false; // 標記為未選擇（自動出現在原本順序的位置）
    this.userAnswerList.splice(indexInAnswer, 1); // 從上方組合槽移除
  }

  // 取得字串陣列答案（供 checkAnswer 使用）
  get userAnswer(): string[] {
    return this.userAnswerList.map(item => item.text);
  }

  submitAnswer(): void {
    if (this.userAnswer.length === 0 || this.isSubmitted) return;
    this.isSubmitted = true;

    this.isCorrect = this.sentenceService.checkAnswer(
      this.userAnswer,
      this.currentQuestion.answer
    );

    if (this.isCorrect) {
      this.score++;
    }

    this.quizHistory.push({
      question: this.currentQuestion,
      userAnswer: [...this.userAnswer],
      isCorrect: this.isCorrect
    });
  }

  nextQuestion(): void {
    if (this.currentIndex < this.quizQuestions.length - 1) {
      this.currentIndex++;
      this.loadQuestion(this.currentIndex);
    } else {
      this.isQuizCompleted = true;
    }
  }

}
