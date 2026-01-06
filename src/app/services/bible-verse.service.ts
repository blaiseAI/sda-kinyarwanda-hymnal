import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';

export interface BibleVerse {
  translation: {
    identifier: string;
    name: string;
    language: string;
    language_code: string;
    license: string;
  };
  random_verse: {
    book_id: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BibleVerseService {
  private readonly VERSE_STORAGE_KEY = 'daily_verse';
  private readonly LAST_FETCH_DATE_KEY = 'last_verse_fetch_date';
  private readonly API_URL = 'https://bible-api.com/data/kjv/random';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  // For displaying in the app - uses cached verse
  async getDailyVerse(): Promise<BibleVerse> {
    const lastFetchDate = await this.storage.get(this.LAST_FETCH_DATE_KEY);
    const today = new Date().toDateString();

    if (lastFetchDate !== today) {
      // Fetch new verse if it's a new day
      const verse = await this.fetchNewVerse();
      await this.storage.set(this.VERSE_STORAGE_KEY, verse);
      await this.storage.set(this.LAST_FETCH_DATE_KEY, today);
      return verse;
    }

    // Return stored verse if it's the same day
    const storedVerse = await this.storage.get(this.VERSE_STORAGE_KEY);
    if (storedVerse) {
      return storedVerse as BibleVerse;
    }
    
    // If no stored verse, fetch a new one
    return this.fetchNewVerse();
  }

  // For notifications - always fetches a new verse
  async getNewVerse(): Promise<BibleVerse> {
    const verse = await this.fetchNewVerse();
    // Store it as today's verse
    await this.storage.set(this.VERSE_STORAGE_KEY, verse);
    await this.storage.set(this.LAST_FETCH_DATE_KEY, new Date().toDateString());
    return verse;
  }

  private async fetchNewVerse(): Promise<BibleVerse> {
    try {
      return await firstValueFrom(this.http.get<BibleVerse>(this.API_URL));
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }
} 