import { Preferences } from '@capacitor/preferences';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Hymn } from '../models/hymn';
import { hymnData } from '../../data/hymnData';

@Injectable({
  providedIn: 'root',
})
export class HymnService {
  private readonly RECENTLY_VIEWED_KEY = 'recently_viewed_hymns';

  private _recentlyViewedHymns = new BehaviorSubject<Hymn[]>([]);
  recentlyViewedHymns = this._recentlyViewedHymns.asObservable();

  constructor() {
    // Load initial state
    this.loadRecentlyViewedHymns();
  }

  getHymns() {
    return of(hymnData);
  }

  getHymn(hymnId: number) {
    return new Observable<Hymn>((subscriber) => {
      setTimeout(() => {
        const hymn = hymnData.find((x) => x.hymnNumber === hymnId);
        subscriber.next(hymn);
        subscriber.complete();
      }, 0);
    });
  }

  addToRecentlyViewed(hymn: Hymn): void {
    this.getRecentlyViewedHymns().then((recentlyViewedHymns: Hymn[]) => {
      // check first if hymn is already in the list, if so, don't add it again
      const hymnIndex = recentlyViewedHymns.findIndex(
        (h) => h.hymnNumber === hymn.hymnNumber
      );
      if (hymnIndex > -1) {
        return;
      }
      // Ensure the list does not exceed the maximum number of items
      if (recentlyViewedHymns.length > 2) {
        recentlyViewedHymns.pop();
      }

      hymn.viewedAt = new Date(); // Add this line

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
        (h) => h.hymnNumber !== hymn.hymnNumber
      );
      this.saveRecentlyViewedHymns(updatedList);
    });
  }

  private saveRecentlyViewedHymns(hymns: Hymn[]): void {
    Preferences.set({
      key: this.RECENTLY_VIEWED_KEY,
      value: JSON.stringify(hymns),
    }).then(() => this.loadRecentlyViewedHymns()); // Reload after saving
  }

  // in HymnService
  clearAllRecentlyViewedHymns(): Promise<void> {
    return Preferences.remove({ key: this.RECENTLY_VIEWED_KEY });
  }
}
