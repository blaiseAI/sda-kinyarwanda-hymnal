import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Hymn } from '../../models/hymn';
import { HymnService } from '../../services/hymn.service';
import { Observable, BehaviorSubject, combineLatest, of, Subscription } from 'rxjs';
import { tap, throttleTime, mergeMap, scan, map } from 'rxjs/operators';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AlertController, IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-hymn-list',
  templateUrl: './hymn-list.page.html',
  styleUrls: ['./hymn-list.page.scss'],
})
export class HymnListPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  
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
  totalHymns = 0;
  private languageSubscription?: Subscription;

  constructor(
    private hymnService: HymnService,
    private alertController: AlertController,
    private router: Router,
    private languageService: LanguageService
  ) {}

  // Helper function to normalize text by removing special characters and spaces
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
  }

  async toggleLanguage() {
    await this.languageService.toggleLanguage();
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
    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );

    this.hymns$ = this.hymnService.getHymns();
    this.hymns$.subscribe({
      next: (hymns) => {
        this.hymns = hymns;
        this.totalHymns = hymns.length;
        this.filterHymns();
      },
      error: (error) => {
        console.error('Error loading hymns:', error);
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
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

  async showJumpToHymnAlert() {
    const alert = await this.alertController.create({
      header: this.showEnglishTitles ? 'Jump to Hymn' : 'Simbukira ku ndirimbo',
      message: this.showEnglishTitles ? 'Enter hymn number (1-500)' : 'Andika numero y\'indirimbo (1-500)',
      cssClass: 'jump-to-hymn-alert',
      inputs: [
        {
          name: 'hymnNumber',
          type: 'number',
          placeholder: this.showEnglishTitles ? 'Hymn number' : 'Numero y\'indirimbo',
          min: 1,
          max: 500,
          attributes: {
            inputmode: 'numeric'
          }
        }
      ],
      buttons: [
        {
          text: this.showEnglishTitles ? 'Cancel' : 'Kureka',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: this.showEnglishTitles ? 'Go' : 'Genda',
          cssClass: 'alert-button-confirm',
          handler: async (data) => {
            const hymnNum = parseInt(data.hymnNumber);
            if (hymnNum >= 1 && hymnNum <= 500) {
              await this.playHapticFeedback();
              this.router.navigate(['/tabs/hymns', hymnNum]);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getVerseCount(hymn: Hymn): number {
    return hymn.verses?.count || hymn.verses?.text?.length || 0;
  }
}

