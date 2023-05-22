import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Hymn } from '../../models/hymn';
import { HymnService } from '../../services/hymn.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { tap, throttleTime, mergeMap, scan, map } from 'rxjs/operators';

@Component({
  selector: 'app-hymn-list',
  templateUrl: './hymn-list.page.html',
  styleUrls: ['./hymn-list.page.scss'],
})
export class HymnListPage implements OnInit {
  hymns$!: Observable<Hymn[]>;
  filteredHymns: Hymn[] = [];
  hymns: Hymn[] = [];
  page = 0;
  showLoading = false;
  showScrollButton = false;
  pager$ = new BehaviorSubject<number | null>(null);
  currentSearchQuery: string = '';

  constructor(private hymnService: HymnService) {}
  handleSearchChange(event: Event) {
    this.currentSearchQuery = (event.target as HTMLInputElement).value;
    this.filterHymns();
  }

  filterHymns() {
    this.filteredHymns = this.hymns.filter((hymn) => {
      const query = this.currentSearchQuery?.trim().toLowerCase();
      if (!query) {
        return true;
      }
      return (
        hymn.hymnNumber.toString().toLowerCase().includes(query) ||
        hymn.hymnTitle.toLowerCase().includes(query)
      );
    });
  }
  ngOnInit() {
    this.hymns$ = this.hymnService.getHymns();
    this.hymns$.subscribe((hymns) => {
      this.hymns = hymns;
      this.filterHymns();
    });
  }

  trackByFn(_: any, item: { hymnNumber: any }) {
    return item.hymnNumber;
  }
}
