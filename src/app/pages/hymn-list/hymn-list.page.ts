import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Hymn } from '../../models/hymn';
import { HymnService } from '../../services/hymn.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { tap, throttleTime, mergeMap, scan, map } from 'rxjs/operators';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
  isSearching = false;

  constructor(private hymnService: HymnService) {}
  handleSearchChange(event: any) {
    this.currentSearchQuery = event.detail.value.toLowerCase();
    this.isSearching = this.currentSearchQuery.length > 0;
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
  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }
}

