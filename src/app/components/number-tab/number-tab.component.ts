import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HymnService } from '../../services/hymn.service';

@Component({
  selector: 'app-number-tab',
  templateUrl: './number-tab.component.html',
  styleUrls: ['./number-tab.component.scss']
})
export class NumberTabComponent {
  hymnNumber: number | null = null;
  hymnTitle: string | null = null;
  words: string[] = [];

  constructor(
    private router: Router,
    private hymnService: HymnService
  ) {}

  onHymnNumberChange() {
    if (this.hymnNumber && this.hymnNumber > 0 && this.hymnNumber <= 500) {
      this.hymnService.getHymn(this.hymnNumber.toString()).subscribe(hymn => {
        if (hymn) {
          this.hymnTitle = hymn.title.kinyarwanda;
          this.words = this.hymnTitle.split(' ');
        } else {
          this.hymnTitle = null;
          this.words = [];
        }
      });
    } else {
      this.hymnTitle = null;
      this.words = [];
    }
  }

  appendNumber(num: number) {
    if (!this.hymnNumber) {
      this.hymnNumber = num;
    } else {
      const newNumber = parseInt(this.hymnNumber.toString() + num.toString());
      if (newNumber <= 500) {
        this.hymnNumber = newNumber;
      }
    }
    this.onHymnNumberChange();
  }

  clearNumber() {
    if (this.hymnNumber) {
      const numStr = this.hymnNumber.toString();
      if (numStr.length > 1) {
        this.hymnNumber = parseInt(numStr.slice(0, -1));
      } else {
        this.hymnNumber = null;
      }
      this.onHymnNumberChange();
    }
  }

  openHymn() {
    if (this.hymnNumber && this.hymnNumber > 0 && this.hymnNumber <= 500) {
      this.router.navigate(['/tabs/hymns', this.hymnNumber]);
    }
  }
}
