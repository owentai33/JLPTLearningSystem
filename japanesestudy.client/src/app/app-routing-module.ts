import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';               // 引入主頁
import { McQuiz } from './mc-quiz/mc-quiz';       // 引入測驗頁
import { VocabList } from './vocab-list/vocab-list';
import { SentencePractice } from './sentence-practice/sentence-practice';   

const routes: Routes = [
  { path: '', component: Home },                 // 預設主頁顯示 Home
  { path: 'mc-quiz', component: McQuiz },        // 去 /mc-quiz 顯示測驗
  { path: 'vocab-list', component: VocabList },  // 去 /vocab-list 顯示單字列表
  { path: 'sentence-practice', component: SentencePractice },  // 去 /sentence-practice 顯示句子練習
  { path: 'home', component: Home }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
