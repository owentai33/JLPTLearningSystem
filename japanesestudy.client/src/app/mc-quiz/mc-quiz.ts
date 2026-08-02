import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { VocabService, VocabItem } from '../service/vocab'; // 引入 Service
import { Subscription } from 'rxjs';

// 1. 單一選項的結構
export interface Option {
  text: string;        // 選項顯示的文字（例如中文意思：「人口」、「決定」）
  isCorrect: boolean;  // 係咪正確答案
}

// 2. 一題目（Question）的完整結構
export interface Question {
  id: number;          // 題目編號 (例如：1, 2, 3...)
  targetVocab: any;    // 正確單字的完整資料 (包含 expression, reading 等，方便顯示題目)
  options: Option[];   // ABCD 4 個選項 (已經打亂順序)
  selectedOption?: Option; // 使用者選咗邊個 (用嚟紀錄答案與算分)
  isAnswered?: boolean;    // 使用者係咪已經答咗呢題
}


@Component({
  selector: 'app-mc-quiz',
  standalone: false,
  templateUrl: './mc-quiz.html',
  styleUrl: './mc-quiz.css',
})

export class McQuiz implements OnInit, OnDestroy {
  constructor(private vocabService: VocabService, private cdr: ChangeDetectorRef) {}


  public questions: Question[] =[];
  public currentIndex: number = 0;
  public vocabList: VocabItem[] = [];
  private vocabSub!: Subscription; // ★ 2. 用嚟記錄 RxJS 訂閱

  public isFinished: boolean = false; // 是否完成測驗
  public score: number = 0;            // 答對題數

  ngOnInit(): void {
    // ★ 3. 訂閱並存入 this.vocabSub
    this.vocabSub = this.vocabService.getIsLoaded().subscribe(isLoaded => {
      if (isLoaded) {
        // 拎取 Service 裡面載入好嘅單字
        this.vocabList = this.vocabService.allVocabList;

        // 開始生成 4 選 1 題目...
        this.generateQuestions(3);

        // 強制更新畫面 (防止 ChangeDetection 問題)
        this.cdr.detectChanges();
      }
    });
  }

  // 1. 生成 N 題 MC 題目的主 Function
  generateQuestions(totalQuestions: number = 10): void {
    if (!this.vocabList || this.vocabList.length < 4) return;

    const shuffledVocab = [...this.vocabList].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffledVocab.slice(0, totalQuestions);

    // ★ 2. 喺呢度生成並賦值俾 this.questions
    this.questions = selectedTargets.map((target, index) => {
      return this.buildSingleQuestion(index + 1, target);
    });

    // （可選）重置題目 Index 歸零
    this.currentIndex = 0;

    this.cdr.detectChanges();
  }

  // 2. 輔助 Function：專門負責「組裝單一題目」
  private buildSingleQuestion(id: number, target: VocabItem): Question {

    // ① 正確答案（Option）
    const correctAnswer: Option = {
      text: target.chi_meaning, // 選項顯示中文意思 (想顯示英文可改 target.eng_meaning)
      isCorrect: true
    };

    // ② 從 vocabList 中過濾掉「正確答案本身」，防止出現重複選項！
    const wrongCandidates = this.vocabList.filter(
      item => item.expression !== target.expression
    );

    // ③ 將剩餘嘅錯誤單字洗牌，並抽 3 個做干擾項
    const shuffledWrong = wrongCandidates.sort(() => 0.5 - Math.random());
    const wrongAnswers: Option[] = shuffledWrong.slice(0, 3).map(item => ({
      text: item.chi_meaning,
      isCorrect: false
    }));

    // ④ 將正解 (1個) + 錯解 (3個) 合併，並再次打亂 ABCD 順序！
    const mixedOptions: Option[] = [correctAnswer, ...wrongAnswers].sort(
      () => 0.5 - Math.random()
    );

    // ⑤ 回傳封裝好的 Question
    return {
      id: id,
      targetVocab: target,
      options: mixedOptions,
      isAnswered: false
    };
  }

  // 1. 產生 A, B, C, D 前綴標籤
  getPrefix(index: number): string {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, 2 -> C...
  }

  // 作答時紀錄分數
  onSelectOption(opt: Option): void {
    const currentQ = this.questions[this.currentIndex];
    if (currentQ.isAnswered) return;

    currentQ.selectedOption = opt;
    currentQ.isAnswered = true;

    if (opt.isCorrect) {
      this.score++;
    }
  }


  // 3. 切換選項按鈕樣式（答對變綠色、答錯變紅色）
  getOptionClass(opt: Option): string {
    const currentQ = this.questions[this.currentIndex];

    // 還沒作答時：一般按鈕樣式
    if (!currentQ.isAnswered) {
      return 'btn-outline-custom';
    }

    // 作答後：如果是正確答案 -> 變綠色
    if (opt.isCorrect) {
      return 'btn-success-custom';
    }

    // 作答後：如果這是我選錯的選項 -> 變紅色
    if (currentQ.selectedOption === opt && !opt.isCorrect) {
      return 'btn-danger-custom';
    }

    // 作答後：其他的干擾選項 -> 變淡灰色
    return 'btn-disabled-custom';
  }

  // 下一題 / 完成測驗
  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      // 最後一題按下，切換為完成狀態
      this.isFinished = true;
    }
  }

  // 重新測驗
  restartQuiz(): void {
    this.score = 0;
    this.currentIndex = 0;
    this.isFinished = false;
    this.generateQuestions(10); // 重新生成 10 題新題目
  }


  ngOnDestroy(): void {
    if (this.vocabSub) {
      this.vocabSub.unsubscribe();
    }
  }
}
