import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Feedback } from 'src/app/models/feedback.model';
import { AirtableService } from 'src/app/services/airtable.service';

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.page.html',
  styleUrls: ['./feedback-modal.page.scss'],
})
export class FeedbackModalPage {
  @Input() hymnNumber: string = '';
  @Input() hymnTitle: string = '';

  feedbackForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController,
    private airtableService: AirtableService
  ) {
    this.feedbackForm = this.formBuilder.group({
      hymnNumber: ['', Validators.required],
      hymnTitle: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      feedbackType: ['', Validators.required],
      feedbackMessage: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.feedbackForm.patchValue({
      hymnNumber: this.hymnNumber,
      hymnTitle: this.hymnTitle,
    });
  }

  async submitForm() {
    const toast = await this.toastController.create({
      duration: 3000,
    });

    const feedback: Feedback = {
      hymnNumber: this.feedbackForm.value.hymnNumber,
      hymnTitle: this.feedbackForm.value.hymnTitle,
      email: this.feedbackForm.value.email,
      feedbackType: this.feedbackForm.value.feedbackType,
      feedbackMessage: this.feedbackForm.value.feedbackMessage,
      dateSubmitted: new Date().toISOString(),
    };

    this.airtableService.addFeedback(feedback).subscribe(
      (res) => {
        console.log('Feedback submitted successfully:', res);
        this.feedbackForm.reset();
        this.modalController.dismiss();
        toast.message = 'Feedback submitted successfully';
        toast.present();
      },
      (err) => {
        console.error('Error submitting feedback:', err);
        toast.message = 'Error submitting feedback';
        toast.present();
      }
    );
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
