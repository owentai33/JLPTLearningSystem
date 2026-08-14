import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { McQuiz } from './mc-quiz/mc-quiz';
import { Home } from './home/home';
import { VocabList } from './vocab-list/vocab-list';
import { SentencePractice } from './sentence-practice/sentence-practice';
import { VerbQuiz } from './verb-quiz/verb-quiz';

@NgModule({
  declarations: [App, McQuiz, Home, VocabList, SentencePractice, VerbQuiz],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
