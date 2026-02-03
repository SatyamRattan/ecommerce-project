// Marks this class as an injectable Angular service
import { Injectable } from '@angular/core';

// HttpClient is used to send HTTP requests to the backend
import { HttpClient, HttpParams } from '@angular/common/http';

// Observable represents asynchronous data streams from HTTP calls
import { Observable } from 'rxjs';

@Injectable({
  // Makes this service available application-wide as a singleton
  providedIn: 'root',
})
export class ContactUs {

  /**
   * Base URL for Contact API
   * Example backend endpoint:
   * http://127.0.0.1:8000/api/contact/contact/
   */
  private BASE_URL = 'http://127.0.0.1:8000/api/contact';

  /**
   * Inject HttpClient to communicate with backend APIs
   */
  constructor(private http: HttpClient) { }

  /**
   * Sends a contact message to the backend
   *
   * @param data - Object containing:
   *  - name
   *  - email
   *  - subject
   *  - message
   *
   * Returns:
   * - Observable representing the POST request
   * - Success or error handled by component
   */
  sendMessage(data: any): Observable<any> {

    // POST request to submit contact form data
    return this.http.post(
      `${this.BASE_URL}/contact/`,
      data
    );
  }

  /**
   * Admin: Fetch filtered contact messages
   */
  getMessages(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.BASE_URL}/contact/`, { params });
  }

  /**
   * Admin: Update message status (READ, RESOLVED, etc.)
   */
  updateMessageStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.BASE_URL}/contact/${id}/`, { status });
  }

}




// Key Things You Should Learn From This File
// ✅ Why this service is VERY clean

// Single responsibility → only contact logic

// No auth logic here → interceptor handles token automatically

// Easy to test and reuse

// ✅ Why sendMessage() returns Observable

// HttpClient is async

// Component decides:

// when to subscribe

// how to show success/error messages

// ✅ Why BASE_URL is kept private

// Prevents accidental modification

// Central place to update API path

// ⚠️ Small improvement (optional later)

// When your project grows, you can:

// Create a shared ApiConfig file

// Move all base URLs there