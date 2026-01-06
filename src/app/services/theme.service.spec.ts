import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { Storage } from '@ionic/storage-angular';

describe('ThemeService', () => {
  let service: ThemeService;
  let storageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['create', 'get', 'set']);
    
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: Storage, useValue: spy }
      ]
    });
    
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
    storageSpy.create.and.returnValue(Promise.resolve({} as Storage));
    storageSpy.get.and.returnValue(Promise.resolve(null));
    storageSpy.set.and.returnValue(Promise.resolve());
    
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with system preference when no saved preference exists', (done) => {
    service.isDarkMode$.subscribe((isDark) => {
      // The value will depend on system preference
      expect(typeof isDark).toBe('boolean');
      done();
    });
  });

  it('should toggle theme', async () => {
    const initialValue = service.getCurrentTheme();
    await service.toggleTheme();
    expect(service.getCurrentTheme()).toBe(!initialValue);
  });

  it('should set theme to specific value', async () => {
    await service.setTheme(true);
    expect(service.getCurrentTheme()).toBeTrue();
    
    await service.setTheme(false);
    expect(service.getCurrentTheme()).toBeFalse();
  });

  it('should emit changes through observable', (done) => {
    let emissionCount = 0;
    service.isDarkMode$.subscribe((value) => {
      emissionCount++;
      if (emissionCount > 1 && value === true) {
        expect(value).toBeTrue();
        done();
      }
    });
    
    service.setTheme(true);
  });

  it('should apply theme to document body', async () => {
    await service.setTheme(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    
    await service.setTheme(false);
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });
});
