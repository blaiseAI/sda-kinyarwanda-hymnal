import { Component, OnInit } from '@angular/core';
import { BibleVerseService, BibleVerse } from 'src/app/services/bible-verse.service';
import { LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    private loadingController: LoadingController,
    private router: Router,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.loadDailyVerse();
  }

  goBack() {
    this.navCtrl.back();
  }

  getTodayDate(): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options).toUpperCase();
  }

  getBackgroundImageUrl(): string {
    // Random background image for daily verse
    const images = [];
    for (let i = 1; i <= 21; i++) {
      images.push(`assets/images/image${i}.jpg`);
    }
    const randomIndex = Math.floor(Math.random() * images.length);
    return `url('${images[randomIndex]}')`;
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
      if (event && event.target) {
        event.target.complete();
      }
    }
  }
}
