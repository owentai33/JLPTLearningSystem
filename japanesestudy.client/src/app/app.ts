import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import * as Papa from 'papaparse';

interface VocabItem {
  expression: string; // 漢字（對應 CSV 的 expression）
  reading: string;    // 假名讀音
  meaning: string;    // 中文/英文意思
  tags?: string;      // 程度標籤
  guid?: string;
}

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  public forecasts: WeatherForecast[] = [];
  public allVocabList: VocabItem[] = [];
  public vocabList: VocabItem[] = [];
  currentIndex: number = 0;       // 追蹤目前顯示哪一個單字的 index (0 到 9)

  // 2. 喺建構子注入 ChangeDetectorRef (cdr)
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    //this.getForecasts();
    //this.loadLocalCsv();
  }

  // getForecasts() {
  //   this.http.get<WeatherForecast[]>('/weatherforecast').subscribe(
  //     (result) => {
  //       this.forecasts = result;
  //     },
  //     (error) => {
  //       console.error(error);
  //     }
  //   );
  // }

  // loadLocalCsv(): void {
  //   // 讀取 local assets 路徑，必須設定 responseType 為 'text'
  //   this.http.get('/n4.csv', { responseType: 'text' })
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

  // // 按右鍵：去下一個單字
  // nextVocab(): void {
  //   if (this.currentIndex < this.vocabList.length - 1) {
  //     this.currentIndex++;
  //   } else {
  //     this.currentIndex = 0; // 如果去到最後一題，再按就返回第一題 (循環效果，可自由拔除)
  //   }
  //   this.cdr.detectChanges(); 
  // }

  // // 按左鍵：去上一個單字
  // prevVocab(): void {
  //   if (this.currentIndex > 0) {
  //     this.currentIndex--;
  //   } else {
  //     this.currentIndex = this.vocabList.length - 1; // 如果在第一題按左，就去到最後一題 (循環效果)
  //   }
  //   this.cdr.detectChanges(); 
  // }


  protected readonly title = signal('japanesestudy.client');
}
