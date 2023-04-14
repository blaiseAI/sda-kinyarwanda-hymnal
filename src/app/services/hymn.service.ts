import { Injectable } from '@angular/core';
import { Observable, from, of, timer } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

  private getData(page: number, pageSize: number) {
    if (pageSize === -1) {
      return hymnData;
    }
    return hymnData.slice(page * pageSize, page * pageSize + pageSize);
  }

  getHymns(page = 0, pageSize = 100) {
    if (pageSize === -1) {
      return of(hymnData);
    } else {
      return timer(this.cache.length === 0 ? 0 : 1000).pipe(
        tap((_) => (this.cache[page] = this.getData(page, pageSize))),
        map((_) => {
          return this.cache.reduce((acc, current) => {
            return acc.concat(current);
          }, []);
        })
      );
    }
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
