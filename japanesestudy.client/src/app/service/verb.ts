import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// ==========================================
// 1. Interfaces & Types
// ==========================================
export interface VerbForms {
  masu: string;
  te: string;
  nai: string;
  ta: string;
  potential: string;
  volitional: string;
  imperative: string;
  passive: string;
  causative: string;
  causativePassive: string;
}

export interface VerbItem {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  level: string;
  group: number;
  forms: VerbForms;
}

export type FormKey = keyof VerbForms;

export interface VerbQuizQuestion {
  questionId: string;      // 題目 ID
  verbId: string;          // 動詞 ID
  kanji: string;           // 漢字
  reading: string;         // 假名
  meaning: string;         // 中文意思
  targetForm: FormKey;     // 目標變化 key
  targetFormLabel: string; // 目標變化中文名稱
  correctAnswer: string;   // 正確答案
  level: string;
  options: string[];       // 洗牌後的 4 個選項
  userAnswer?: string; // 👈 記錄玩家揀咗咩答案
}

// ==========================================
// 2. 常量定義 (Form 中文對照表)
// ==========================================
const FORM_LABELS: Record<FormKey, string> = {
  masu: 'ます形',
  te: 'て形',
  nai: 'ない形',
  ta: 'た形',
  potential: '可能形',
  volitional: '意向形',
  imperative: '命令形',
  passive: '受身形',
  causative: '使役形',
  causativePassive: '使役受身形'
};

const ALL_FORMS: FormKey[] = Object.keys(FORM_LABELS) as FormKey[];

// ==========================================
// 3. Service 本體
// ==========================================
@Injectable({
  providedIn: 'root'
})
export class VerbService {
  private jsonUrl = 'n4_verb.json';

  constructor(private http: HttpClient) { }

  /**
   * 隨機抽取 count 條動詞配對題目
   */
  getRandomQuizQuestions(count: number = 5): Observable<VerbQuizQuestion[]> {
    return this.http.get<VerbItem[]>(this.jsonUrl).pipe(
      map(allVerbs => {
        // 1. 洗牌並抽 count 個動詞
        const shuffledVerbs = this.shuffle(allVerbs).slice(0, count);

        // 2. 為每個動詞生成題目
        return shuffledVerbs.map(verb => this.createQuestion(verb));
      })
    );
  }

  /**
   * 生成單條題目（選項全部來自「同一個動詞」的不同變化）
   */
  private createQuestion(targetVerb: VerbItem): VerbQuizQuestion {
    // 1. 隨機挑選一種變化做「目標正解」
    const targetForm = ALL_FORMS[Math.floor(Math.random() * ALL_FORMS.length)];
    const correctAnswer = targetVerb.forms[targetForm];

    // 2. 收集同一個動詞「其他變化」作為干擾項
    const wrongOptionsSet = new Set<string>();

    // 把其他 key 洗牌，確保每次抽到的干擾形狀唔同
    const otherForms = this.shuffle(ALL_FORMS.filter(f => f !== targetForm));

    for (const formKey of otherForms) {
      const wrongAnswer = targetVerb.forms[formKey];

      // 確保存在，而且字串內容同正確答案唔重疊（防止某些特殊變化寫法一模一樣）
      if (wrongAnswer && wrongAnswer !== correctAnswer) {
        wrongOptionsSet.add(wrongAnswer);
      }

      if (wrongOptionsSet.size >= 3) break;
    }

    // 3. 將 1 個正確答案 + 3 個同動詞的錯答案組合，再洗牌
    const rawOptions = [correctAnswer, ...Array.from(wrongOptionsSet)];
    const options = this.shuffle(rawOptions);

    return {
      questionId: `q_${targetVerb.id}_${targetForm}`,
      verbId: targetVerb.id,
      kanji: targetVerb.kanji,
      reading: targetVerb.reading,
      meaning: targetVerb.meaning,
      targetForm: targetForm,
      targetFormLabel: FORM_LABELS[targetForm],
      correctAnswer: correctAnswer,
      level: targetVerb.level,
      options: options
    };
  }

  /**
   * Fisher-Yates 洗牌演算法
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
