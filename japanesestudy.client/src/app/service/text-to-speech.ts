import { Service } from '@angular/core';

@Service()
export class TextToSpeech {
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
  }

  // 1. 預先載入語音包（解決 Safari/iOS 初始載入拿不到 Voice 的問題）
  private initVoices(): void {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth.getVoices();
    };

    load();

    // Chrome 與 Safari 的 voices 是非同步載入的，必須監聽 onvoiceschanged
    if ('onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = load;
    }
  }

  speak(text: string, targetLang: string = 'ja-JP', rate: number = 0.9): void {
    if (!this.synth) {
      console.warn('此瀏覽器不支援 Web Speech API');
      return;
    }

    // 防護：如果陣列仍為空，再強制抓一次
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    // 中斷上一句
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    // ★ 關鍵修復 1：精準搜尋「日文語音包」實例
    const japaneseVoice = this.voices.find(voice =>
      voice.lang === 'ja-JP' ||
      voice.lang === 'ja_JP' ||
      voice.lang.toLowerCase().startsWith('ja')
    );

    // ★ 關鍵修復 2：直接把 Voice 物件 assign 給 utterance（解決 Chrome 讀中文問題）
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
      utterance.lang = japaneseVoice.lang;
    } else {
      // 萬一裝置真的完全沒有日文 Voice，才 Fallback 回字串設定
      utterance.lang = targetLang;
    }

    // iOS Safari 修正：針對 Safari 有時在 cancel() 後立刻 speak() 會失效的 Bug
    setTimeout(() => {
      this.synth.speak(utterance);
    }, 10);
  }
}
