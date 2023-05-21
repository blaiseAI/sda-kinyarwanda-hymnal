import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-privay-policy',
  templateUrl: './privay-policy.page.html',
  styleUrls: ['./privay-policy.page.scss'],
})
export class PrivayPolicyPage implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}
  dismissModal() {
    this.modalController.dismiss();
  }
}
