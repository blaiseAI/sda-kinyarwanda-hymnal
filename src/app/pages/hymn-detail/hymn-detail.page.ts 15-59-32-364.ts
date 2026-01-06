import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, PopoverController, ModalController } from '@ionic/angular';
import { HymnService } from '../../services/hymn.service';
import { Hymn } from '../../models/hymn';
import { HymnOptionsSheetComponent } from '../../components/hymn-options-sheet/hymn-options-sheet.component';
import { FavouriteModalPage } from '../favourite-modal/favourite-modal.page';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-hymn-detail',
  templateUrl: './hymn-detail.page.html',
  styleUrls: ['./hymn-detail.page.scss'],
})
export class HymnDetailPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  
  hymn: Hymn | null = null;
  isLoading = true;
  error: string | null = null;
  totalHymns = 500;
  showPreviousButton = true;
  showNextButton = true;
  
  private hymnSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hymnService: HymnService,
    private popoverController: PopoverController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    console.log('HymnDetailPage initialized');
    // Subscribe to route params
    this.route.paramMap.subscribe(params => {
      const number = params.get('number');
      console.log('Route param number:', number);
      if (number) {
        this.loadHymn(number);
      } else {
        console.warn('No hymn number provided');
        this.error = 'No hymn number provided';
        this.isLoading = false;
        // Optionally redirect back to the list
        this.goBack();
      }
    });
  }

  ngOnDestroy() {
    if (this.hymnSubscription) {
      this.hymnSubscription.unsubscribe();
    }
  }

  private async loadHymn(hymnNumber: string) {
    console.log('Starting to load hymn:', hymnNumber);
    this.isLoading = true;
    this.error = null;
    
    try {
      this.hymnSubscription?.unsubscribe(); // Cleanup any existing subscription
      this.hymnSubscription = this.hymnService.getHymn(hymnNumber)
        .subscribe({
          next: (hymn) => {
            console.log('Hymn data received:', hymn);
            if (hymn) {
              this.hymn = hymn;
              this.hymnService.addToRecentlyViewed(hymn);
              this.updateNavigationButtons(hymnNumber);
            } else {
              console.warn('No hymn found for number:', hymnNumber);
              this.error = 'Hymn not found';
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error in hymn subscription:', err);
            this.error = 'Failed to load hymn';
            this.isLoading = false;
          },
          complete: () => {
            console.log('Hymn subscription completed');
          }
        });
    } catch (err) {
      console.error('Error in loadHymn:', err);
      this.error = 'Failed to load hymn';
      this.isLoading = false;
    }
  }

  private updateNavigationButtons(currentNumber: string) {
    const num = parseInt(currentNumber, 10);
    this.showPreviousButton = num > 1;
    this.showNextButton = num < this.totalHymns;
  }

  async navigateToHymn(direction: 'next' | 'previous') {
    if (!this.hymn) return;
    
    const currentNum = parseInt(this.hymn.number, 10);
    const newNum = direction === 'next' ? currentNum + 1 : currentNum - 1;
    
    if (newNum < 1 || newNum > this.totalHymns) return;
    
    await this.loadHymn(newNum.toString());
    this.content.scrollToTop(300);
  }

  async presentOptions(event: Event) {
    if (!this.hymn) return;
    
    await this.playHapticFeedback();
    const popover = await this.popoverController.create({
      component: HymnOptionsSheetComponent,
      event,
      componentProps: { hymn: this.hymn },
      translucent: true
    });
    return await popover.present();
  }

  async playHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  goBack() {
    this.playHapticFeedback();
    // Change this to use Router for more control
    this.router.navigate(['/tabs/hymns']);
  }
}