import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Hymn } from 'src/app/models/hymn';
import { HymnService } from 'src/app/services/hymn.service';

@Component({
  selector: 'app-number-tab',
  templateUrl: './number-tab.component.html',
  styleUrls: ['./number-tab.component.scss'],
})
export class NumberTabComponent {
  hymnTitle: string | null = null;
  hymnNumber!: number | any;
  // Set the expiry date to one month from now
  badgeExpiryDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  currentDate = new Date();


  hymn: Hymn = {
    hymnNumber: 0,
    hymnTitle: '',
    verses: [],
  };
  // Assume hymnTitle is a string containing the title.
words: string[] = [];



  constructor(private router: Router, private hymnService: HymnService,private toastController: ToastController) {}
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Hymn number must be between 1 and 350.',
      duration: 2000,
      position: 'top',
      color: 'primary'
    });
    toast.present();
  }
  fetchHymnDetails() {
  if (this.hymnNumber && this.hymnNumber > 0) {
    this.hymnService.getHymn(this.hymnNumber).subscribe(
      hymnData => {
        if (hymnData) { // Check if hymnData is not null or undefined
          this.hymn = hymnData; // Populate the hymn object with the fetched data
          this.hymnTitle = this.hymn.hymnTitle; // Set the title for display
          this.updateWords(); // Update the words array
        } else {
          // Handle the case when the hymn is not found
          this.hymn = {
            hymnNumber: this.hymnNumber,
            hymnTitle: 'Hymn not found',
            verses: [],
          }; // Reset the hymn object with the current hymn number and a not found message
          this.hymnTitle = 'Hymn not found'; // Reflect the not found state in the title
        }
      },
      error => {
        // Handle other errors, such as network errors
        this.hymn = {
            hymnNumber: this.hymnNumber,
            hymnTitle: 'Error loading hymn',
            verses: [],
        };
        this.hymnTitle = 'Error loading hymn'; // Reflect the error state in the title
      }
    );
  } else {
    // Clear the title and reset hymn if the number is not valid
    this.hymn = {
      hymnNumber: 0,
      hymnTitle: '',
      verses: [],
    };
    this.hymnTitle = null;
  }
}
onHymnNumberChange(newValue: string) {
  // Attempt to parse the newValue to an integer, or default to null if not possible
  const numericValue = newValue ? parseInt(newValue, 10) : null;

  // Check if numericValue is not null and perform further operations
  if (numericValue !== null) {
    if (numericValue > 350) {
      this.presentToast();
      this.resetState();
    } else {
      this.hymnNumber = numericValue;
      this.fetchHymnDetails(); // Proceed to fetch hymn details
    }
  } else {
    // Handle the case where numericValue is null, which could mean the input was cleared or invalid
    this.resetState();
    // Optionally clear the hymn details or handle this scenario as needed
  }
}


  
  openHymn() {
    if (this.hymnNumber && this.hymnNumber > 0) {
      this.router.navigate(['/tabs/hymns', this.hymnNumber]).then(() => {
        this.resetState(); // Call a method to reset the state
      });
    } else {
      // Optionally show an error message or alert if the hymn number is invalid
    }
  }

  updateWords() {
    // Directly set the words array to contain the entire message if it's a special case
    if (this.hymnTitle === 'Hymn not found' || this.hymnTitle === 'Error loading hymn') {
      this.words = [this.hymnTitle];
    } else {
      this.words = this.hymnTitle ? this.hymnTitle.split(' ') : [];
    }
  }

  resetState() {
    this.hymnNumber = null;
    this.hymnTitle = null; // Ensure hymnTitle is also cleared
    this.words = []; // Clear words array to remove any remaining title words
  }
  

  // Function to check if the badge should be displayed
  shouldDisplayBadge(): boolean {
    return this.currentDate <= this.badgeExpiryDate;
  }
  
  
}
