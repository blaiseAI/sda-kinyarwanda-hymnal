import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AirtableService } from './airtable.service';
import { Feedback } from '../models/feedback.model';

describe('AirtableService', () => {
  let service: AirtableService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AirtableService],
    });
    service = TestBed.inject(AirtableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add feedback', () => {
    const feedback: Feedback = {
      hymnNumber: '123',
      hymnTitle: 'Test Hymn',
      feedbackType: 'Bug Report',
      feedbackMessage: 'This is a test feedback message',
      email: 'test@example.com',
    };
    const mockResponse = {
      records: [
        {
          id: 'rec123',
          fields: {
            'Hymn Number': feedback.hymnNumber,
            'Hymn Title': feedback.hymnTitle,
            'Feedback Type': feedback.feedbackType,
            'Feedback Message': feedback.feedbackMessage,
            'Email Address': feedback.email,
            'Date Submitted': new Date(),
          },
        },
      ],
    };
    
    service.addFeedback(feedback).subscribe((result) => {
      expect(result).toEqual(feedback);
    });
    const request = httpMock.expectOne(
      `${service['baseUrl']}/${service['baseId']}/${service['feedbackTable']}`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toEqual(
      `Bearer ${service['apiKey']}`
    );
    expect(request.request.headers.get('Content-Type')).toEqual(
      'application/json'
    );
    request.flush(mockResponse);
  });

  it('should handle errors while adding feedback', () => {
    const feedback: Feedback = {
      hymnNumber: '123',
      hymnTitle: 'Test Hymn',
      feedbackType: 'Bug Report',
      feedbackMessage: 'This is a test feedback message',
      email: 'test@example.com',
    };
    const mockError = 'An error occurred while adding feedback.';
    service.addFeedback(feedback).subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(mockError);
      }
    );
    const request = httpMock.expectOne(
      `${service['baseUrl']}/${service['baseId']}/${service['feedbackTable']}`
    );
    expect(request.request.method).toBe('POST');
    request.error(new ErrorEvent('network error'));
  });
});
