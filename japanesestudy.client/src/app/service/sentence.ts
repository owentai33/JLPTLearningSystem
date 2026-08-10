import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SentenceQuestion {
  id: number;
  level: string;
  category: string;
  difficulty: number;
  english: string;
  chinese: string;
  sentence: string;
  reading: string;
  answer: string[];
  choices: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SentenceService {
  // 如果放在 public/questions.json，路徑直接寫 'questions.json' 即可
  private jsonUrl = 'SentenceQuestions.json';

  constructor(private http: HttpClient) { }

  /**
   * 從 public/ 讀取 JSON 並隨機抽取 count 題不重複題目
   */
  getRandomFiveQuestions(count: number = 5): Observable<SentenceQuestion[]> {
    return this.http.get<SentenceQuestion[]>(this.jsonUrl).pipe(
      map(questions => {
        // 1. 複製一份完整題庫並洗牌
        const shuffledPool = [...questions];
        for (let i = shuffledPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
        }

        // 2. 截取前 count 題
        const selected = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

        // 3. 對每一題的 choices 洗牌
        return selected.map(q => {
          const choices = [...q.choices];
          for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
          }
          return {
            ...q,
            choices
          };
        });
      })
    );
  }

  // 檢查答案是否正確 (保持同步)
  checkAnswer(userAnswer: string[], correctAnswer: string[]): boolean {
    if (userAnswer.length !== correctAnswer.length) return false;
    return userAnswer.every((val, index) => val === correctAnswer[index]);
  }
}
