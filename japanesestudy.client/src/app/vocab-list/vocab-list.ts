import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { VocabService, VocabItem } from '../service/vocab'; // 引入 Service
import { TextToSpeech } from '../service/text-to-speech';

@Component({
  selector: 'app-vocab-list',
  standalone: false,
  templateUrl: './vocab-list.html',
  styleUrl: './vocab-list.css',
})

export class VocabList implements OnInit, OnDestroy {
  public allVocabList: VocabItem[] = [];
  public filteredVocabList: VocabItem[] = [];

  public n3Count: number = 0;
  public n4Count: number = 0;
  public n5Count: number = 0;

  // 當前選擇的 Level 篩選條件：'ALL' | 'N3' | 'N4'
  public selectedLevel: string = 'ALL';

  private vocabSub!: Subscription;

  constructor(
    private vocabService: VocabService,
    private ttsService: TextToSpeech,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.vocabSub = this.vocabService.getIsLoaded().subscribe(isLoaded => {
      if (isLoaded) {
        // 從 Service 取得所有單字 (包含 N3 同 N4)
        this.allVocabList = this.vocabService.allVocabList;

        this.n3Count = this.allVocabList.filter(item => item.level === 'N3').length;
        this.n4Count = this.allVocabList.filter(item => item.level === 'N4').length;
        this.n5Count = this.allVocabList.filter(item => item.level === 'N5').length;

        // 預設顯示所有單字
        this.filterByLevel(this.selectedLevel);
      }
    });
  }

  // 根據點擊的 Badge 切換過濾單字
  filterByLevel(level: string): void {
    this.selectedLevel = level;

    if (level === 'ALL') {
      this.filteredVocabList = [...this.allVocabList];
    } else {
      this.filteredVocabList = this.allVocabList.filter(
        item => item.level && item.level.toUpperCase() === level.toUpperCase()
      );
    }

    this.cdr.detectChanges();
  }

  playAudio(text: string): void {
    if (text) {
      this.ttsService.speak(text);
    }
  }

  ngOnDestroy(): void {
    if (this.vocabSub) {
      this.vocabSub.unsubscribe();
    }
  }
}
