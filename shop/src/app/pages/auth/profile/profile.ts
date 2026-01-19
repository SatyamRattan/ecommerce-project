import { Component, OnInit } from '@angular/core';
import { Auth, User } from '../../../services/auth'; // Import Auth service to interact with backend for user profile and logout
import { CommonModule } from '@angular/common'; // Provides common directives like *ngIf, *ngFor
import { Router } from '@angular/router'; // Router to navigate programmatically

@Component({
  selector: 'app-profile', // Component selector used in HTML
  standalone: true, // Standalone component, no NgModule needed
  imports: [CommonModule], // Import CommonModule for template directives
  templateUrl: './profile.html', // HTML template file
  styleUrl: './profile.css', // CSS for styling
})
export class Profile implements OnInit {
  user: User | null = null; // Stores the logged-in user's profile data. Initially null.
  loading: boolean = true; // Indicates whether profile data is currently being fetched
  error: string = ''; // Stores any error messages to display in the template

  constructor(private auth: Auth, private router: Router) { }
  // Inject Auth service for API calls and Router for navigation

  ngOnInit() {
    this.fetchProfile(); // Fetch the profile when the component initializes
  }

  fetchProfile() {
    this.loading = true; // Show loading state while fetching profile
    console.log('Fetching profile data...');

    // Call Auth service to get user profile
    this.auth.getProfile().subscribe({
      next: (data: any) => {
        console.log('Profile data received:', data);

        // Handle cases where API returns an array instead of single object
        this.user = Array.isArray(data) ? data[0] : data;

        this.loading = false; // Hide loading once data is fetched
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error = 'Failed to load profile'; // Set generic error message for UI
        this.loading = false; // Hide loading state

        // Handle unauthorized access
        if (err.status === 401) {
          console.log('Unauthorized access, redirecting to login...');
          // Redirect to login page and pass the current URL as returnUrl
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  logout() {
    this.auth.logout(); // Call Auth service to remove token/session
    this.router.navigate(['/login']); // Redirect user to login page
  }
}

// Key Points in These Comments:

// Every property is explained: user, loading, error.

// Every method (fetchProfile, logout) has step-by-step explanation of its purpose.

// Angular subscribe logic is broken down: next for success, error for failure.

// Special cases like array responses or 401 unauthorized are explicitly mentioned.

// Makes it easy for a new developer to understand flow, error handling, and routing.