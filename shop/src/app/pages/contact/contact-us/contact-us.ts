import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
// FormsModule allows use of [(ngModel)] for two-way binding
import { Router } from '@angular/router';
import { ContactUs as ContactUsService } from '../../../services/contact-us'; 
// Importing the ContactUs service to send messages to backend

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule], 
  // Standalone component using CommonModule and FormsModule
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs {

  constructor(private contactUs: ContactUsService, private router: Router) { }
  // Injecting ContactUs service and Angular Router

  // Object to store form data
  form = {
    name: '',
    email: '',
    message: ''
  };

  // Flag to show if form has been submitted successfully
  submitted = false;

  // Function triggered on form submission
  submit() {
    // Validate that all fields are filled
    if (!this.form.name || !this.form.email || !this.form.message) {
      if (typeof alert !== 'undefined') alert('All fields required');
      return; // Stop submission if validation fails
    }

    // Call the service to send the form data
    this.contactUs.sendMessage(this.form).subscribe({
      next: (response) => {
        // Success callback
        console.log('Message sent successfully', response);
        this.submitted = true; // mark form as submitted
        this.form = { name: '', email: '', message: '' }; 
        // Reset form fields
        if (typeof alert !== 'undefined') alert('Message sent successfully!');
      },
      error: (error) => {
        // Error callback
        console.error('Error sending message', error);
        let errorMsg = 'Failed to send message.';

        // Handling specific HTTP errors for better feedback
        if (error.status === 0) {
          // Network or server down
          errorMsg = 'Cannot connect to server. Please check if the backend is running at http://127.0.0.1:8000';
        } else if (error.status === 404) {
          // Endpoint not found
          errorMsg = 'Contact endpoint not found (404). The backend API endpoint /api/contact/contact/ does not exist.';
        } else if (error.status === 405) {
          // Method not allowed
          errorMsg = 'Method not allowed (405). The endpoint does not accept POST requests.';
        } else if (error.status) {
          // Other HTTP errors
          errorMsg = `Server error (${error.status}): ${error.statusText || 'Unknown error'}`;
          if (error.error && typeof error.error === 'object') {
            const detail = error.error.detail || error.error.message || 'Error details in console';
            errorMsg += '\nDetails: ' + detail;
          } else if (error.error) {
            errorMsg += '\nDetails: ' + error.error;
          }
        } else if (error.message) {
          // Fallback error message
          errorMsg = error.message;
        }

        // Show error to the user
        if (typeof alert !== 'undefined') alert(errorMsg);
      }
    });
  }
}






// Highlights:

// Two-way binding handled by FormsModule.

// Robust error handling covering server, network, and HTTP issues.

// Resets form after successful submission.

// Uses Angular service (ContactUsService) to communicate with backend.