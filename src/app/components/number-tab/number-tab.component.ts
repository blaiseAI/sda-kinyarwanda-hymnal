import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HymnService } from '../../services/hymn.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-number-tab',
  templateUrl: './number-tab.component.html',
  styleUrls: ['./number-tab.component.scss']
})
export class NumberTabComponent implements OnInit, OnDestroy {
  hymnNumber: number | null = null;
  hymnTitle: string | null = null;
  hymnTitleEnglish: string | null = null;
  showEnglishTitles = false;
  private languageSubscription?: Subscription;

  constructor(
    private router: Router,
    private hymnService: HymnService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    // Subscribe to language preference changes
    this.languageSubscription = this.languageService.showEnglishTitles$.subscribe(
      (showEnglish) => {
        this.showEnglishTitles = showEnglish;
      }
    );
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  async toggleLanguage() {
    await this.languageService.toggleLanguage();
    await this.playHapticFeedback();
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  onHymnNumberChange(event?: any) {
    // Get the input value from the event
    let inputValue = event?.target?.value ?? this.hymnNumber;
    
    // If null or undefined, clear everything
    if (inputValue === null || inputValue === undefined || inputValue === '') {
      this.hymnNumber = null;
      this.hymnTitle = null;
      this.hymnTitleEnglish = null;
      return;
    }

    // Convert to string and remove non-numeric characters
    const numStr = inputValue.toString().replace(/[^0-9]/g, '');
    
    // If empty after cleaning, clear
    if (!numStr) {
      this.hymnNumber = null;
      this.hymnTitle = null;
      this.hymnTitleEnglish = null;
      return;
    }

    // Parse to number
    let num = parseInt(numStr);
    
    // Enforce strict limits: truncate if more than 3 digits or > 500
    if (numStr.length > 3) {
      num = parseInt(numStr.substring(0, 3));
    }
    
    if (num > 500) {
      num = 500;
    }

    // Update the model
    this.hymnNumber = num;

    // Fetch hymn if valid
    if (this.hymnNumber > 0 && this.hymnNumber <= 500) {
      this.hymnService.getHymn(this.hymnNumber.toString()).subscribe(hymn => {
        if (hymn) {
          this.hymnTitle = hymn.title.kinyarwanda;
          this.hymnTitleEnglish = hymn.title.english || null;
          this.playHapticFeedback();
        } else {
          this.hymnTitle = null;
          this.hymnTitleEnglish = null;
        }
      });
    } else {
      this.hymnTitle = null;
      this.hymnTitleEnglish = null;
    }
  }

  isValidNumber(): boolean {
    return this.hymnNumber !== null && 
           this.hymnNumber > 0 && 
           this.hymnNumber <= 500;
  }

  async openHymn() {
    if (this.isValidNumber()) {
      await this.playHapticFeedback();
      this.router.navigate(['/tabs/hymns', this.hymnNumber]);
    }
  }
}
