import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Hymn } from '../../models/hymn';
import { HymnService } from '../../services/hymn.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { tap, throttleTime, mergeMap, scan, map } from 'rxjs/operators';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

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
  showEnglishTitles = false;
  private readonly LANGUAGE_PREF_KEY = 'show_english_titles';

  constructor(private hymnService: HymnService) {
    this.loadLanguagePreference();
  }

  // Helper function to normalize text by removing special characters and spaces
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
  }

  async loadLanguagePreference() {
    const { value } = await Preferences.get({ key: this.LANGUAGE_PREF_KEY });
    this.showEnglishTitles = value === 'true';
  }

  async toggleLanguage() {
    this.showEnglishTitles = !this.showEnglishTitles;
    await Preferences.set({
      key: this.LANGUAGE_PREF_KEY,
      value: this.showEnglishTitles.toString(),
    });
    await this.playHapticFeedback();
  }

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

      // If searching for a number, only match numbers
      if (/^\d+$/.test(query)) {
        return hymn.number.toLowerCase().includes(query);
      }

      // Normalize the search query and hymn titles
      const normalizedQuery = this.normalizeText(query);
      const normalizedKinyarwanda = this.normalizeText(hymn.title.kinyarwanda);
      const normalizedEnglish = hymn.title.english ? 
        this.normalizeText(hymn.title.english) : '';

      return normalizedKinyarwanda.includes(normalizedQuery) ||
             normalizedEnglish.includes(normalizedQuery);
    });

    // Sort results: exact number matches first, then title matches
    this.filteredHymns.sort((a, b) => {
      const query = this.currentSearchQuery?.trim().toLowerCase();
      const aExactMatch = a.number === query;
      const bExactMatch = b.number === query;

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      return parseInt(a.number) - parseInt(b.number);
    });
  }

  ngOnInit() {
    this.hymns$ = this.hymnService.getHymns();
    this.hymns$.subscribe({
      next: (hymns) => {
        this.hymns = hymns;
        this.filterHymns();
      },
      error: (error) => {
        console.error('Error loading hymns:', error);
      }
    });
  }

  trackByFn(_: any, item: Hymn) {
    return item.number;
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  loadMoreHymns(event: any) {
    event.target.complete();
  }

  getDisplayTitle(hymn: Hymn): string {
    if (this.showEnglishTitles && hymn.title.english) {
      return `${hymn.number} - ${hymn.title.english}`;
    }
    return `${hymn.number} - ${hymn.title.kinyarwanda}`;
  }
}

