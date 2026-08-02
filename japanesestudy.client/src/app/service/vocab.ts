import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import * as Papa from 'papaparse';

export interface VocabItem {
  expression: string; // 漢字
  reading: string;    // 假名讀音
  eng_meaning: string;    // 英文意思
  chi_meaning: string;    // 中文意思
  level?: string;      // 程度標籤
  guid?: string;
}

@Injectable({
  providedIn: 'root' // 代表這是一個全域單例 (Singleton) Service
})
export class VocabService {
  // 1. 全域儲存單字清單的地方
  public allVocabList: VocabItem[] = [];

  // 2. 用 BehaviorSubject 追蹤資料是否載入完成（解決非同步讀取問題）
  private isLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Service 初始化時自動讀取 CSV
    this.loadLocalCsv();
  }

  private loadLocalCsv(): void {
    // 使用 forkJoin 同時發起兩個 HTTP 請求
    forkJoin({
      n3: this.http.get('/n3_updated.csv', { responseType: 'text' }),
      n4: this.http.get('/n4_updated.csv', { responseType: 'text' })
    }).subscribe({
        next: (csvData) => {
        //this.parseCsv(csvData);
        const n3Data = this.parseCsv(csvData.n3);
        const n4Data = this.parseCsv(csvData.n4);

        // 合併兩個陣列
        this.allVocabList = [...n3Data, ...n4Data];

        // 發送通知：資料已完全載入
        this.isLoaded$.next(true);
        },
        error: (err) => {
          console.error('讀取本地 CSV 檔案失敗:', err);
        }
      });
  }

  private parseCsv(csvText: string): VocabItem[] {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    // 自動忽略 Header（第一行），並為每筆資料補上 level 屬性
    return (result.data as any[]).map(item => ({
      ...item
    })) as VocabItem[];
  }

  // 提供 Observable 讓外部頁面監聽載入狀態
  public getIsLoaded(): Observable<boolean> {
    return this.isLoaded$.asObservable();
  }

  // 共用 Function：隨機抽取 N 個單字
  public getRandomVocab(count: number = 10): VocabItem[] {
    if (this.allVocabList.length === 0) return [];

    // 使用你原本優秀嘅 Fisher-Yates (Knuth) 洗牌演算法
    const shuffled = [...this.allVocabList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }
}
