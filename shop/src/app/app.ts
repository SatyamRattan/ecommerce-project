// Import core Angular decorators and utilities
import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';

// Utility to check whether code is running in browser or server (SSR-safe)
import { isPlatformBrowser } from '@angular/common';

// RouterOutlet is required to render routed components (<router-outlet>)
import { RouterOutlet } from '@angular/router';

// Import standalone UI components used globally
import { Navbar } from './pages/navbar/navbar';
import { Footer } from './pages/footer/footer';

// Authentication service to manage login state, tokens, and user profile
import { Auth } from './services/auth';

/**
 * Root component of the entire Angular application.
 * This component is loaded FIRST when the app starts.
 */
@Component({
  // Custom HTML tag used in index.html -> <app-root></app-root>
  selector: 'app-root',

  // Standalone component (no NgModule required)
  standalone: true,

  // Components/directives/pipes this component depends on
  imports: [
    RouterOutlet, // Enables routing
    Navbar,       // Top navigation bar
    Footer        // Footer section
  ],

  // HTML template for this component
  templateUrl: './app.html',

  // Multiple stylesheets applied globally to this component
  styleUrls: ['./app.css', './background-blobs.css']
})
export class App implements OnInit {

  /**
   * Angular Signal (reactive primitive)
   * Holds the application title
   * `protected` → accessible inside class & template, not outside
   * signal() provides reactivity without RxJS
   */
  protected readonly title = signal('shop');

  /**
   * Constructor runs when the App component is created (dependency injection phase)
   *
   * @param auth        Auth service for authentication logic
   * @param platformId  Angular token that tells whether we are in browser or server
   */
  constructor(
    private auth: Auth,

    // PLATFORM_ID is injected to safely detect SSR vs browser
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * ngOnInit runs AFTER component is initialized
   * Best place for startup logic, API calls, and side effects
   */
  ngOnInit() {

    // Check if code is running in the browser (not on server during SSR/build)
    if (isPlatformBrowser(this.platformId)) {

      // Read auth token directly from localStorage (browser-only API)
      const token = localStorage.getItem('auth_token');

      // Debug log for development
      console.log('[App] Initializing in browser. Token:', token);

      // Check if user is already authenticated
      if (this.auth.isAuthenticated()) {
        console.log('[App] Authenticated, fetching profile...');

        /**
         * Auto-fetch user profile on app startup
         * This ensures:
         * - Navbar shows correct user state
         * - Cart & wishlist can use user ID
         * - App state is hydrated after refresh
         */
        this.auth.getProfile().subscribe({
          next: (u) => console.log('[App] Profile auto-fetched:', u),
          error: (e) => console.error('[App] Profile fetch error:', e)
        });
      }

    } else {
      /**
       * This branch runs during:
       * - Server Side Rendering (SSR)
       * - Build-time pre-rendering
       *
       * Important because:
       * - localStorage is NOT available
       * - window/document do not exist
       */
      console.log('[App] Initializing on server/build.');
    }
  }
}
