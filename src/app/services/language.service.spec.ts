import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language preference as false', () => {
    expect(service.getCurrentLanguage()).toBeFalse();
  });

  it('should toggle language preference', async () => {
    const initialValue = service.getCurrentLanguage();
    await service.toggleLanguage();
    expect(service.getCurrentLanguage()).toBe(!initialValue);
  });

  it('should set language preference to specific value', async () => {
    await service.setLanguage(true);
    expect(service.getCurrentLanguage()).toBeTrue();
    
    await service.setLanguage(false);
    expect(service.getCurrentLanguage()).toBeFalse();
  });

  it('should emit changes through observable', (done) => {
    service.showEnglishTitles$.subscribe((value) => {
      if (value) {
        expect(value).toBeTrue();
        done();
      }
    });
    
    service.setLanguage(true);
  });
});

