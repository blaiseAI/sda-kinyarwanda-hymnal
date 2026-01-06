import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_PREF_KEY = 'show_english_titles';
  private showEnglishTitlesSubject = new BehaviorSubject<boolean>(false);
  
  // Observable that components can subscribe to
  public showEnglishTitles$: Observable<boolean> = this.showEnglishTitlesSubject.asObservable();

  constructor() {
    this.loadLanguagePreference();
  }

  /**
   * Load the language preference from storage
   */
  private async loadLanguagePreference(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.LANGUAGE_PREF_KEY });
      const showEnglish = value === 'true';
      this.showEnglishTitlesSubject.next(showEnglish);
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }

  /**
   * Get the current language preference value
   */
  public getCurrentLanguage(): boolean {
    return this.showEnglishTitlesSubject.value;
  }

  /**
   * Toggle the language preference
   */
  public async toggleLanguage(): Promise<void> {
    const newValue = !this.showEnglishTitlesSubject.value;
    await this.setLanguage(newValue);
  }

  /**
   * Set the language preference to a specific value
   */
  public async setLanguage(showEnglish: boolean): Promise<void> {
    try {
      await Preferences.set({
        key: this.LANGUAGE_PREF_KEY,
        value: showEnglish.toString()
      });
      this.showEnglishTitlesSubject.next(showEnglish);
    } catch (error) {
      console.error('Error setting language preference:', error);
    }
  }
}

