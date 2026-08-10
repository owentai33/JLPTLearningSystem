import { Service } from '@angular/core';

@Service()
export class TextToSpeech {
  private synth = window.speechSynthesis;

  speak(text: string, lang: string = 'ja-JP', rate: number = 0.9): void {
    if (!this.synth) {
      console.warn('此瀏覽器不支援語音朗讀功能');
      return;
    }

    // 如果正在播放，先取消前面的朗讀
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // 日語語系
    utterance.rate = rate; // 語速（0.9 稍微慢一點點更清晰）

    this.synth.speak(utterance);
  }

}
