import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Hymn } from 'src/app/models/hymn';
import { HymnService } from 'src/app/services/hymn.service';
import { DUMMY_FEATURED_LISTINGS } from 'src/app/dummy_data';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-recently-viewed-list',
  templateUrl: './recently-viewed-list.component.html',
  styleUrls: ['./recently-viewed-list.component.scss'],
})
export class RecentlyViewedListComponent implements OnInit {
  @ViewChild('slides') slides!: IonSlides;
  featuredListings = DUMMY_FEATURED_LISTINGS;
  autoSlide = false;
  recentlyViewedHymns: Hymn[] = [];
  recentlyViewedHymnsSubscription!: Subscription;
  imageLoading = true; // Add a new state variable to track when the image is loading

  constructor(
    private hymnService: HymnService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {}

  public options = {
    slidesPerView: 1.3,
    spaceBetween: 16,
    centeredSlides: false,
    loop: false, // enabling loop can improve performance
    freeMode: false, // allows slides to freely move instead of snapping to slides
    grabCursor: true, // changes the cursor to a "grab" style for better UX
    preloadImages: false, // don't preload all images
    lazy: true, // enable lazy loading of images
    watchSlidesVisibility: true, // needed for lazy loading to work
    watchSlidesProgress: true, // needed for lazy loading to work
    speed: 400, // speed of transition in ms.
  };
  imageLoaded() {
    this.imageLoading = false;
  }

  ngOnInit() {
    this.recentlyViewedHymnsSubscription =
      this.hymnService.recentlyViewedHymns.subscribe((hymns) => {
        this.recentlyViewedHymns = hymns;
        this.imageLoading = true; // reset imageLoading to true here
      });
  }
  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.recentlyViewedHymnsSubscription.unsubscribe();
  }

  navigateToHymnDetail(hymnId: number) {
    this.router.navigate(['/hymn-detail', hymnId]);
  }

  loadRecentlyViewedHymns() {
    this.hymnService.getRecentlyViewedHymns().then((hymns) => {
      this.recentlyViewedHymns = hymns;

      this.changeDetectorRef.detectChanges(); // manually trigger change detection
    });
  }

  removeHymnFromList(hymn: Hymn) {
    this.hymnService.removeHymnFromRecentlyViewed(hymn);
    this.loadRecentlyViewedHymns();
  }

  clearAllRecentlyViewedHymns(): void {
    this.hymnService.clearAllRecentlyViewedHymns().then(() => {
      this.loadRecentlyViewedHymns();
    });
  }
  useFallbackImage(event: any) {
    event.target.src = '/assets/fallback_placeholder.jpg'; // path to your fallback image
  }
  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }
  
}
