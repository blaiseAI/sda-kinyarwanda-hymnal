import { Injectable } from '@angular/core';
import { Observable, from, of, timer } from 'rxjs';
import { Hymn } from '../models/hymn';
import { hymnData } from '../../data/hymnData';

@Injectable({
  providedIn: 'root',
})
export class HymnService {
  hymns$: Observable<Hymn[]>;
  cache: Hymn[][] = [];

  constructor() {
    this.hymns$ = from([]);
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
}
