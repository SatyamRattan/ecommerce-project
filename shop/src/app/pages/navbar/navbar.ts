import { Component, OnInit } from '@angular/core';
// Component decorator and OnInit lifecycle hook from Angular

import { CommonModule } from '@angular/common';
// CommonModule provides common directives like ngIf, ngFor

import { RouterLink, RouterLinkActive, Router } from '@angular/router';
// RouterLink and RouterLinkActive are for navigation in templates
// Router is used for programmatic navigation

import { Auth } from '../../services/auth';
// Auth service for authentication and user session management

import { Cart as CartService } from '../../services/cart';
// Cart service to manage cart items and state

@Component({
  selector: 'app-navbar', // HTML tag to use this component
  standalone: true, // Standalone component (no NgModule required)
  imports: [CommonModule, RouterLink, RouterLinkActive], // Modules used inside template
  templateUrl: './navbar.html', // Path to template
  styleUrl: './navbar.css', // Path to CSS file
})
export class Navbar implements OnInit {
  // Variable to hold current cart item count, displayed in navbar
  cartCount = 0;

  // Variable to store the logged-in user's ID for the profile icon
  userId: string | number | null = null;

  constructor(
    // Public so template can directly use auth methods (like isLoggedIn)
    public auth: Auth,

    // Private as only used internally in component
    private cartService: CartService,

    // Used for navigating programmatically after logout
    private router: Router
  ) { }

  ngOnInit() {
    // Called when component is initialized

    // Subscribe to cart observable to update cartCount in real-time whenever items change
    this.cartService.cartItems$.subscribe(items => {
      // Update local cartCount whenever items array changes
      this.cartCount = items.length;
    });

    // Listen to authentication state changes
    this.auth.authState$.subscribe(isAuth => {
      // Refresh cart if user becomes authenticated
      if (isAuth) {
        // Fetch latest cart from server
        this.cartService.refreshCart();
        // Fetch and store the user ID for the profile icon
        this.fetchUserId();
      } else {
        // Reset user ID if user logs out
        this.userId = null;
      }
    });

    // Initial fetch of user ID if already authenticated on load
    if (this.auth.isAuthenticated()) {
      // Fetch latest cart from server
      this.cartService.refreshCart();
      // Fetch and store the user ID for the profile icon
      this.fetchUserId();
    }
  }

  // Method to fetch and store user ID from Auth service
  fetchUserId() {
    // Get currently cached user from auth service
    const user = this.auth.getCurrentUser();
    // If user exists in cache, extract ID
    if (user) {
      // Extract ID using service's utility method
      this.userId = this.auth.getUserId(user);
    } else {
      // If not in cache, fetch profile from backend
      this.auth.getProfile().subscribe(profile => {
        // Extract and store ID from freshly fetched profile
        this.userId = this.auth.getUserId(profile);
      });
    }
  }

  // Wrapper method for template to check if user is logged in
  isLoggedIn(): boolean {
    // Delegate check to auth service
    return this.auth.isAuthenticated();
  }

  // Method to handle user logout
  logout() {
    // Clear auth state via service
    this.auth.logout();
    // Navigate back to login page
    this.router.navigate(['/login']);
  }
}
