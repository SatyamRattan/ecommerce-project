import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
// Component decorator and OnInit lifecycle hook from Angular

import { CommonModule, isPlatformBrowser } from '@angular/common';
// CommonModule provides common directives like ngIf, ngFor

import { FormsModule } from '@angular/forms';
// FormsModule enables two-way data binding with [(ngModel)]

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
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive], // Added FormsModule for ngModel
  templateUrl: './navbar.html', // Path to template
  styleUrl: './navbar.css', // Path to CSS file
})

export class Navbar implements OnInit, AfterViewInit {
  // Stable source of truth for auth state
  isLoggedIn: boolean = false;

  // Property for stable template binding
  userName: string | null = null;

  // Store full user object for initial generation
  user: any = null;

  // Variable to hold current cart item count, displayed in navbar
  cartCount = 0;

  // Variable to store the logged-in user's ID for the profile icon
  userId: string | number | null = null;

  // Search query entered by user in the search input field
  // Bound to input using [(ngModel)] for two-way data binding
  searchQuery: string = '';

  constructor(
    // Public so template can directly use auth variables
    public auth: Auth,

    // Private as only used internally in component
    private cartService: CartService,

    // Used for navigating programmatically after logout
    private router: Router,

    // Inject ChangeDetectorRef to manually trigger change detection
    private cdr: ChangeDetectorRef,

    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    // Called when component is initialized

    /**
     * Hydration & Expression Stability Fix:
     * Only subscribe to user data in the browser to avoid mismatched 
     * server/client values during hydration and prevent NG0100 error.
     */
    if (isPlatformBrowser(this.platformId)) {
      this.auth.user$.subscribe(user => {
        this.user = user;
        this.userName = user?.name || null;
        this.cdr.detectChanges();
      });
    }

    // Set initial login state
    this.isLoggedIn = this.auth.isAuthenticated();

    // Subscribe to cart observable to update cartCount in real-time whenever items change
    this.cartService.cartItems$.subscribe(items => {
      // Update local cartCount whenever items array changes
      this.cartCount = items.length;
    });

    // Listen to authentication state changes
    this.auth.authState$.subscribe(isAuth => {
      // Update local login state property
      this.isLoggedIn = isAuth;

      // Force change detection to ensure UI reflects auth state immediately
      // This prevents "Login" button appearing alongside authenticated links on reload
      this.cdr.detectChanges();

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
    if (this.isLoggedIn) {
      // Fetch latest cart from server
      this.cartService.refreshCart();
      // Fetch and store the user ID for the profile icon
      this.fetchUserId();
    }
  }

  // Lifecycle hook called after the view has been fully initialized
  ngAfterViewInit() {
    // Manually trigger change detection to ensure the layout is stable
    // This helps resolve issues where elements might be misaligned on initial render
    this.cdr.detectChanges();
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

  /**
   * Handle search submission (triggered by Enter key or search button click)
   * 
   * Flow:
   * 1. Validate that search query is not empty/whitespace
   * 2. Navigate to /products route
   * 3. Append search query as URL parameter (?search=<query>)
   * 4. Products component reads this param and calls backend
   */
  onSearch() {
    // Trim whitespace from search query
    const trimmedQuery = this.searchQuery.trim();

    // Ignore empty searches - do nothing if query is blank
    if (!trimmedQuery) {
      return;
    }

    // Navigate to products page with search query parameter
    // Example: /products?search=iphone
    // The products component will read this param and fetch from backend
    this.router.navigate(['/products'], {
      queryParams: { search: trimmedQuery }
    });

    // Optionally clear the search input after navigation
    // this.searchQuery = '';
  }

  // Method to handle user logout
  logout() {
    // Clear auth state via service
    this.auth.logout();
    // Navigate back to login page
    this.router.navigate(['/login']);
  }

  get userInitial(): string {
    if (!this.user) return '';

    // If name exists → show first letter
    if (this.user.name && this.user.name.length > 0) {
      return this.user.name.trim().charAt(0).toUpperCase();
    }

    // Fallback → use email first letter
    if (this.user.email) {
      return this.user.email.trim().charAt(0).toUpperCase();
    }

    return 'U'; // default fallback
  }
}
