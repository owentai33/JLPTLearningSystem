import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { VocabService, VocabItem } from '../service/vocab'; // 引入 Service
import { TextToSpeech } from '../service/text-to-speech'; 
//import * as Papa from 'papaparse';

// interface VocabItem {
//   expression: string; // 漢字（對應 CSV 的 expression）
//   reading: string;    // 假名讀音
//   eng_meaning: string;    // 英文意思
//   chi_meaning: string;    // 中文意思
//   level?: string;      // 程度標籤
//   guid?: string;
// }


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public vocabList: VocabItem[] = [];
  currentIndex: number = 0;       // 追蹤目前顯示哪一個單字的 index (0 到 9)

  daysLeft: number = 0;
  progressPercent: number = 0;

  private startX: number = 0;
  private isDragging: boolean = false;

  // 2. 喺建構子注入 ChangeDetectorRef (cdr)
  constructor(
    public vocabService: VocabService,
    public ttsService: TextToSpeech,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    //this.getForecasts();
    //this.loadLocalCsv();
    this.calculateJlptCountdown();

    this.vocabService.getIsLoaded().subscribe(isLoaded => {
      if (isLoaded) {
        this.getRandomTen();
      }
    });
  }

  playAudio(text: string | undefined): void {
    if (!text) return; // 做基本防錯，如果沒有文字就不處理

    // 你可以在這裡加額外邏輯，例如 console.log 或播放動畫狀態
    this.ttsService.speak(text);
  }

  // loadLocalCsv(): void {
  //   // 讀取 local assets 路徑，必須設定 responseType 為 'text'
  //   this.http.get('/n4_updated.csv', { responseType: 'text' })
  //     .subscribe({
  //       next: (csvData) => {
  //         this.parseCsv(csvData);
  //       },
  //       error: (err) => {
  //         console.error('讀取本地 CSV 檔案失敗:', err);
  //       }
  //     });
  // }

  // parseCsv(csvText: string): void {
  //   Papa.parse(csvText, {
  //     header: true,
  //     skipEmptyLines: true,
  //     complete: (result) => {
  //       this.allVocabList = result.data as VocabItem[];
  //       this.getRandomTen();
  //     }
  //   });
  // }


  getRandomTen() {
    this.vocabList = this.vocabService.getRandomVocab(10);
    this.cdr.detectChanges();
  }

  // getRandomTen(): void {
  //   if (this.allVocabList.length === 0) return;

  //   const shuffled = [...this.allVocabList];
  //   for (let i = shuffled.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  //   }

  //   this.vocabList = shuffled.slice(0, 10);
  //   this.currentIndex = 0; // 每次重新抽籤都重置回第 1 個單字
  //   this.cdr.detectChanges();
  // }

  // 按右鍵：去下一個單字
  nextVocab(): void {
    if (this.currentIndex < this.vocabList.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // 如果去到最後一題，再按就返回第一題 (循環效果，可自由拔除)
    }
    this.cdr.detectChanges();
  }

  // 按左鍵：去上一個單字
  prevVocab(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.vocabList.length - 1; // 如果在第一題按左，就去到最後一題 (循環效果)
    }
    this.cdr.detectChanges();
  }

  calculateJlptCountdown() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // 1. 設定 targetDate (下一次 JLPT 考試：12月6日)
    // JS 月份由 0 開始計算：11 代表 12月
    let targetDate = new Date(currentYear, 11, 6);

    // 2. 設定 startDate (上一次 JLPT 結束：7月5日)
    // 6 代表 7月
    let startDate = new Date(currentYear, 6, 5);

    // 防呆處理：如果今日已經過了 12月6日，代表要計算「下一年的 7月 -> 12月 循環」
    if (today > targetDate) {
      startDate = new Date(currentYear + 1, 6, 5);
      targetDate = new Date(currentYear + 1, 11, 6);
    }

    // 3. 計算距離考試仲有幾多日 (daysLeft)
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.daysLeft = diffDays > 0 ? diffDays : 0;

    // 4. 【全年度 7月->12月 循環進度邏輯】
    const totalDuration = targetDate.getTime() - startDate.getTime(); // 7月5日 到 12月6日 總毫秒數
    const elapsedTime = today.getTime() - startDate.getTime();     // 由 7月5日 到 今日 已經過了的毫秒數

    // 計算百分比
    let percent = (elapsedTime / totalDuration) * 100;

    // 邊界控制：如果今日係 7月5日之前，% 會低於 0，鎖死在 0% ~ 100%
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    this.progressPercent = Math.round(percent);
    this.cdr.detectChanges();
  }

  // 1. 觸控開始 (手機)
  onTouchStart(event: TouchEvent): void {
    this.startX = event.changedTouches[0].screenX;
  }

  // 2. 觸控結束 (手機)
  onTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0].screenX;
    this.handleSwipe(this.startX, endX);
  }

  // ★ 3. 滑鼠按下 (電腦測試用)
  onMouseDown(event: MouseEvent): void {
    this.startX = event.screenX;
    this.isDragging = true;
  }

  // ★ 4. 滑鼠放開 (電腦測試用)
  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const endX = event.screenX;
    this.handleSwipe(this.startX, endX);
  }

  // 統一處理滑動方向判定
  private handleSwipe(startX: number, endX: number): void {
    const swipeThreshold = 40; // 降低門檻，更容易觸發
    const diffX = endX - startX;

    if (diffX < -swipeThreshold) {
      this.nextVocab(); // 向左滑 ➔ 下一個
    } else if (diffX > swipeThreshold) {
      this.prevVocab(); // 向右滑 ➔ 上一個
    }
  }

  protected readonly title = signal('japanesestudy.client');
}
