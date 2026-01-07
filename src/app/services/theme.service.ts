import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly DARK_MODE_KEY = 'darkMode';
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  private storageInitialized = false;

  // Observable that components can subscribe to
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  constructor(private storage: Storage) {
    this.initializeTheme();
  }

  /**
   * Initialize storage and load theme preference
   */
  private async initializeTheme(): Promise<void> {
    try {
      await this.storage.create();
      this.storageInitialized = true;
      
      // Check for saved theme preference
      const savedTheme = await this.storage.get(this.DARK_MODE_KEY);
      
      // Check system theme preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Use saved preference if available, otherwise use system preference
      const isDarkMode = savedTheme !== null ? savedTheme : systemDark.matches;
      
      // Set initial theme
      await this.setTheme(isDarkMode, false); // Don't save again on init
      
      // Listen for system theme changes
      systemDark.addEventListener('change', async (e) => {
        // Only update if user hasn't manually set a preference
        const savedPref = await this.storage.get(this.DARK_MODE_KEY);
        if (savedPref === null) {
          await this.setTheme(e.matches, false);
  }
      });
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }

  /**
   * Get the current theme preference value
   */
  public getCurrentTheme(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Toggle the theme preference
   */
  public async toggleTheme(): Promise<void> {
    const newValue = !this.isDarkModeSubject.value;
    await this.setTheme(newValue, true);
  }

  /**
   * Set the theme to a specific value
   * @param isDark Whether to enable dark mode
   * @param saveToStorage Whether to save the preference to storage
   */
  public async setTheme(isDark: boolean, saveToStorage: boolean = true): Promise<void> {
    try {
      // Save to storage if requested and storage is initialized
      if (saveToStorage && this.storageInitialized) {
        await this.storage.set(this.DARK_MODE_KEY, isDark);
      }
      
      // Update the BehaviorSubject to notify all subscribers
      this.isDarkModeSubject.next(isDark);
      
      // Apply theme to document
      document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }
}
