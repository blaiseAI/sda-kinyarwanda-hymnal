import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyVersePage } from './daily-verse.page';

describe('DailyVersePage', () => {
  let component: DailyVersePage;
  let fixture: ComponentFixture<DailyVersePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DailyVersePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
