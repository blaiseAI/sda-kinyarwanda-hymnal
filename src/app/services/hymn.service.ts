import { Preferences } from '@capacitor/preferences';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { Hymn } from '../models/hymn';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import allHymns from '../../data/all_hymns.json';

@Injectable({
  providedIn: 'root',
})
export class HymnService {
  private readonly RECENTLY_VIEWED_KEY = 'recently_viewed_hymns';
  private _recentlyViewedHymns = new BehaviorSubject<Hymn[]>([]);
  recentlyViewedHymns = this._recentlyViewedHymns.asObservable();
  readonly baseUrl = 'https://bibiliya.com/bibiliya-media/hymns-audio/guhimbaza/';
  private hymnsData: { hymns: { hymn: Hymn }[] } = allHymns;

  constructor(private http: HttpClient) {
    // Load initial state
    this.loadRecentlyViewedHymns();
    console.log('Loaded hymns:', this.hymnsData); // Debug log
  }

  getHymns(): Observable<Hymn[]> {
    return of(this.hymnsData.hymns.map(item => item.hymn));
  }

  getHymn(hymnId: string): Observable<Hymn | undefined> {
    console.log('Looking for hymn:', hymnId);
    
    // Convert Promise to Observable and use switchMap for proper chaining
    return from(this.getRecentlyViewedHymns()).pipe(
      switchMap(recentlyViewed => {
        const recentHymn = recentlyViewed.find(h => h.number === hymnId);
        const hymn = this.hymnsData.hymns.find(item => item.hymn.number === hymnId)?.hymn;
        
        // If found in recently viewed, use that image
        if (recentHymn?.image && hymn) {
          hymn.image = recentHymn.image;
        }
        
        console.log('Found hymn:', hymn);
        return of(hymn);
      })
    );
  }

  addToRecentlyViewed(hymn: Hymn): void {
    this.getRecentlyViewedHymns().then((recentlyViewedHymns: Hymn[]) => {
      // check first if hymn is already in the list, if so, don't add it again
      const hymnIndex = recentlyViewedHymns.findIndex(
        (h) => h.number === hymn.number
      );
      if (hymnIndex > -1) {
        return;
      }
      // Ensure the list does not exceed the maximum number of items
      if (recentlyViewedHymns.length > 2) {
        recentlyViewedHymns.pop();
      }

      hymn.viewedAt = new Date();

      // Generate random image if not already set
      if (!hymn.image) {
        const availableImagesCount = 21;
        const randomImageIndex = Math.floor(Math.random() * availableImagesCount) + 1;
        hymn.image = `/assets/images/image${randomImageIndex}.jpg`;
      }

      const updatedList = [hymn, ...recentlyViewedHymns.slice(0, 9)];
      this.saveRecentlyViewedHymns(updatedList);
    });
  }

  private loadRecentlyViewedHymns(): void {
    Preferences.get({ key: this.RECENTLY_VIEWED_KEY })
      .then((data) => {
        const value = data.value;
        if (value) {
          this._recentlyViewedHymns.next(JSON.parse(value));
        } else {
          this._recentlyViewedHymns.next([]);
        }
      })
      .catch(() => this._recentlyViewedHymns.next([]));
  }

  getRecentlyViewedHymns(): Promise<Hymn[]> {
    return Preferences.get({ key: this.RECENTLY_VIEWED_KEY })
      .then((data) => {
        const value = data.value;
        if (value) {
          return JSON.parse(value) as Hymn[];
        } else {
          return [];
        }
      })
      .catch(() => []);
  }

  removeHymnFromRecentlyViewed(hymn: Hymn): void {
    this.getRecentlyViewedHymns().then((recentlyViewedHymns: Hymn[]) => {
      const updatedList = recentlyViewedHymns.filter(
        (h) => h.number !== hymn.number
      );
      this.saveRecentlyViewedHymns(updatedList);
    });
  }

  private saveRecentlyViewedHymns(hymns: Hymn[]): void {
    Preferences.set({
      key: this.RECENTLY_VIEWED_KEY,
      value: JSON.stringify(hymns),
    }).then(() => this.loadRecentlyViewedHymns());
  }

  clearAllRecentlyViewedHymns(): Promise<void> {
    return Preferences.remove({ key: this.RECENTLY_VIEWED_KEY });
  }

  checkAudioAvailability(hymnNumber: string): Observable<boolean> {
    const url = `${this.baseUrl}${hymnNumber.padStart(3, '0')}.mp3`;

    return this.http.head(url, { responseType: 'text' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getAudioUrl(hymnNumber: string): Observable<string | null> {
    const url = `${this.baseUrl}${hymnNumber.padStart(3, '0')}.mp3`;

    return this.http.head(url, { responseType: 'text' }).pipe(
      map(() => url),
      catchError(() => of(null))
    );
  }
}
