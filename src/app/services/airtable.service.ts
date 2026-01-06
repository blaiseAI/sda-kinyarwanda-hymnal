import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Feedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class AirtableService {
  private readonly baseUrl = 'https://api.airtable.com/v0';
  private readonly apiKey = environment.airtable.apiKey;
  private readonly baseId = environment.airtable.baseId;
  private readonly feedbackTable = environment.airtable.feedbackTable;

  constructor(private http: HttpClient) {}

  addFeedback(feedback: Feedback): Observable<Feedback> {
    const url = `${this.baseUrl}/${this.baseId}/${this.feedbackTable}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    });
    const payload = {
      records: [
        {
          fields: {
            'Hymn Number': parseInt(feedback.hymnNumber || '0', 10),
            'Hymn Title': feedback.hymnTitle,
            'Feedback Type': (feedback.feedbackType || '').toLowerCase(),
            'Feedback Message': feedback.feedbackMessage,
            'Email Address': feedback.email,
            'Date Submitted': new Date().toISOString(),
          },
        },
      ],
    };
    return this.http.post<any>(url, payload, { headers }).pipe(
      catchError((error) => {
        console.error(error);
        return throwError('An error occurred while adding feedback.');
      })
    );
  }
}
