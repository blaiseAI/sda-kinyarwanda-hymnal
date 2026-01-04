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
  private hymnsData = allHymns as { hymns: { hymn: Hymn }[] };

  constructor(private http: HttpClient) {
    this.loadRecentlyViewedHymns();
  }

  getHymns(): Observable<Hymn[]> {
    return of(this.hymnsData.hymns.map(item => item.hymn));
  }

  getHymn(hymnNumber: string): Observable<Hymn | null> {
    console.log('HymnService.getHymn called with:', hymnNumber);
    return this.getHymns().pipe(
      map(hymns => {
        console.log('All hymns loaded, searching for:', hymnNumber);
        const hymn = hymns.find(h => h.number === hymnNumber);
        console.log('Found hymn:', hymn);
        if (hymn) {
          return {
            ...hymn,
            verses: {
              ...hymn.verses,
              text: hymn.verses.text.map(v => ({
                verse: v.verse,
                text: v.text
              }))
            }
          };
        }
        return null;
      })
    );
  }

  addToRecentlyViewed(hymn: Hymn): void {
    this.getRecentlyViewedHymns().then((recentlyViewedHymns: Hymn[]) => {
      const hymnIndex = recentlyViewedHymns.findIndex(h => h.number === hymn.number);
      if (hymnIndex > -1) return;

      if (recentlyViewedHymns.length > 2) {
        recentlyViewedHymns.pop();
      }

      const hymnToSave = {
        ...hymn,
        viewedAt: new Date(),
        image: hymn.image || `/assets/images/image${Math.floor(Math.random() * 21) + 1}.jpg`
      };

      const updatedList = [hymnToSave, ...recentlyViewedHymns.slice(0, 9)];
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
