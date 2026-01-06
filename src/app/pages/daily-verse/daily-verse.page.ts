import { Component, OnInit } from '@angular/core';
import { BibleVerseService, BibleVerse } from 'src/app/services/bible-verse.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-daily-verse',
  templateUrl: './daily-verse.page.html',
  styleUrls: ['./daily-verse.page.scss'],
})
export class DailyVersePage implements OnInit {
  verse: BibleVerse | null = null;
  error: string | null = null;

  constructor(
    private bibleVerseService: BibleVerseService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadDailyVerse();
  }

  async loadDailyVerse() {
    const loading = await this.loadingController.create({
      message: 'Loading daily verse...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.verse = await this.bibleVerseService.getDailyVerse();
      this.error = null;
    } catch (err) {
      console.error('Error loading daily verse:', err);
      this.error = 'Failed to load daily verse. Please try again later.';
    } finally {
      await loading.dismiss();
    }
  }

  async refresh(event: any) {
    try {
      this.verse = await this.bibleVerseService.getDailyVerse();
      this.error = null;
    } catch (err) {
      console.error('Error refreshing daily verse:', err);
      this.error = 'Failed to refresh daily verse. Please try again later.';
    } finally {
      event.target.complete();
    }
  }
}
