import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Hymn } from 'src/app/models/hymn';

export interface HymnOptionsProps {
  shareHymn: () => void;
  addToFavorites: () => void;
  openFeedbackModal: () => void;
}

@Component({
  selector: 'app-hymn-options',
  templateUrl: './hymn-options.component.html',
  styleUrls: ['./hymn-options.component.scss'],
})
export class HymnOptionsComponent implements OnInit {
  @Input() hymn!: Hymn;
  @Input() options!: HymnOptionsProps;

  constructor(private popoverController: PopoverController) {}

  shareHymn() {
    this.popoverController.dismiss();
    this.options.shareHymn();
  }

  addToFavorites() {
    this.popoverController.dismiss();
    this.options.addToFavorites();
  }

  openFeedbackModal() {
    this.popoverController.dismiss();
    this.options.openFeedbackModal();
  }

  ngOnInit() {}
}
