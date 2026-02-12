// Injectable allows this service to be injected anywhere via Angular DI
import { Injectable, inject } from '@angular/core';

// HttpClient is used to communicate with backend APIs
import { HttpClient } from '@angular/common/http';

// RxJS utilities for async flows, state management, and side effects
import { Observable, tap, map, BehaviorSubject } from 'rxjs';

// Router is used for navigation (e.g. redirecting to login)
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

/**
 * User interface defining expected user fields
 * Matches (or loosely matches) backend user model
 */
export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string | null;
  gender: string;
  dob?: string | null;
  address?: string | null;
}

@Injectable({
  // Service is available application-wide as a singleton
  providedIn: 'root',
})
export class Auth {

  /**
   * Base backend URL for all authentication-related APIs
   */
  private BASE_URL = `${environment.apiUrl}/v1/users`;

  /**
   * Keys used to store auth data in localStorage
   */
  private TOKEN_KEY = 'auth_token';
  private REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private TOKEN_PREFIX_KEY = 'auth_token_prefix';

  /**
   * Cached logged-in user object
   * Prevents repeated profile API calls
   */
  private currentUser: any = null;

  /**
   * Email of last logged-in user
   * Used to match correct user when backend returns a list
   */
  private lastLoggedInEmail: string | null = null;

  /**
   * BehaviorSubject tracks authentication state globally
   * Initial value depends on whether token already exists
   */
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());

  /**
   * Public observable that components/services can subscribe to
   * Emits true/false on login/logout
   */
  public authState$ = this.authState.asObservable();

  /**
   * BehaviorSubject tracks the current user object
   */
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  /**
   * Tracks whether initial authentication check is complete
   * Prevents UI flicker by ensuring we don't render auth-dependent UI until we know for sure
   */
  private authLoadedSubject = new BehaviorSubject<boolean>(false);
  public authLoaded$ = this.authLoadedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {

    // Restore last logged-in email from localStorage (browser-safe)
    if (typeof localStorage !== 'undefined') {
      this.lastLoggedInEmail = localStorage.getItem('last_user_email');
    }

    // Initialize auth state
    this.initAuth();
  }

  /**
   * Initializes authentication state
   * Checks for token and fetches profile if needed
   */
  private initAuth() {
    if (!this.isAuthenticated()) {
      // No token -> Not logged in -> Auth is loaded
      this.authLoadedSubject.next(true);
      return;
    }

    // Token exists -> Fetch profile to confirm validity and get user data
    this.getProfile().subscribe({
      next: () => {
        // success
        this.authLoadedSubject.next(true);
      },
      error: () => {
        // If profile fetch fails (e.g. token expired), we might want to logout or just mark loaded
        // For now, mark loaded so UI renders (likely in unauthenticated state if getProfile handles validation)
        this.authLoadedSubject.next(true);
      }
    });
  }

  /**
   * Logs user in using credentials
   * Stores token(s) and pre-fetches profile on success
   */
  login(credentials: any): Observable<any> {

    // Store email locally to identify correct user later
    this.lastLoggedInEmail = credentials.email;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('last_user_email', credentials.email);
    }

    // Call backend login endpoint
    return this.http.post(`${this.BASE_URL}/token/`, credentials).pipe(
      tap((response: any) => {

        // Supports both DRF TokenAuth and JWT
        if (response.token || response.access) {

          // Decide Authorization header prefix
          const prefix = response.access ? 'Bearer' : 'Token';

          // Persist tokens
          this.setToken(
            response.token || response.access,
            prefix,
            response.refresh
          );

          // Pre-fetch profile so user data is cached immediately
          this.getProfile().subscribe();
        }
      })
    );
  }

  /**
   * Registers a new user
   */
  register(userData: User): Observable<any> {
    return this.http.post(`${this.BASE_URL}/user/`, userData);
  }

  /**
   * Updates user profile data
   * @param userId - ID of the user to update
   * @param userData - Partial user data to update
   */
  updateProfile(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.BASE_URL}/user/${userId}/`, userData).pipe(
      tap((updatedUser: User) => {
        // Update cached user and subject
        this.currentUser = { ...this.currentUser, ...updatedUser };
        this.userSubject.next(this.currentUser);
        console.log('[Auth] Profile updated and synced to BehaviorSubject:', updatedUser);
      })
    );
  }

  /**
   * Fetches logged-in user's profile from backend
   * Handles multiple backend response shapes safely
   */
  getProfile(): Observable<any> {
    console.log('[Auth] Fetching profile from:', `${this.BASE_URL}/user/`);

    return this.http.get<any>(`${this.BASE_URL}/user/`).pipe(
      map(data => {

        console.log('[Auth] RAW PROFILE DATA:', JSON.stringify(data, null, 2));
        console.log('[Auth] Profile response type:', typeof data);

        /**
         * Normalize backend response into a user list
         * Supports:
         * - DRF paginated responses
         * - Plain arrays
         * - Single-object responses
         */
        let list: any[] = [];

        if (data && data.results && Array.isArray(data.results)) {
          list = data.results;
          console.log('[Auth] Pagination detected. results count:', list.length);
        } else if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === 'object') {
          list = [data];
        }

        console.log('[Auth] Candidate list count:', list.length);

        // No user returned → authentication inconsistency
        if (list.length === 0) {
          console.error('[Auth] Received empty user list from backend!');
          this.currentUser = null;
          return null;
        }

        /**
         * Identify correct user:
         * - Prefer matching email
         * - Fallback to first user
         */
        let me = list[0];
        let matched = false;

        if (this.lastLoggedInEmail && list.length > 0) {
          const match = list.find(
            (u: any) => u.email === this.lastLoggedInEmail
          );
          if (match) {
            me = match;
            matched = true;
            console.log('[Auth] Found match by email:', this.lastLoggedInEmail);
          }
        }

        if (!matched && list.length > 0) {
          console.log(
            '[Auth] NO MATCH for email:',
            this.lastLoggedInEmail,
            '. Falling back to first user in list.'
          );
        }

        // Cache user in memory
        this.currentUser = me;
        this.userSubject.next(me);

        // Attempt to extract user ID
        const possibleId = this.getUserId(me);

        console.log('[Auth] User object keys:', Object.keys(me || {}));
        console.log('[Auth] Determined User ID:', possibleId || 'NOT FOUND');
        console.log('[Auth] Full User Object cached:', me);

        // Warn loudly if ID is missing (critical for cart/orders)
        if (!possibleId && me) {
          const rawPreview = JSON.stringify(me).substring(0, 200);
          console.warn(
            `CRITICAL IDENTITY ERROR: Could not find ID in profile.\n\nRaw data sample: ${rawPreview}`
          );
        }

        return me;
      })
    );
  }

  /**
   * Extracts user ID using ultra-defensive logic
   * Supports many backend naming conventions
   */
  public getUserId(user: any): any {
    if (!user) return null;

    return (
      user.id ||
      user.pk ||
      user.user_id ||
      user.uid ||
      user.sub ||
      user.uuid ||
      user.email ||
      user.username
    );
  }

  /**
   * Returns cached user object
   */
  getCurrentUser(): any {
    console.log('[Auth] Getting current user from cache:', this.currentUser);
    return this.currentUser;
  }

  /**
   * Checks if user is authenticated
   * Authentication = token exists
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Helper method for semantic check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Redirects user to login page
   * Preserves return URL for post-login redirect
   */
  redirectToLogin(returnUrl?: string): void {
    const queryParams: any = {};

    if (returnUrl) {
      queryParams.returnUrl = returnUrl;
    } else if (typeof window !== 'undefined') {
      queryParams.returnUrl = window.location.pathname;
    }

    this.router.navigate(['/login'], { queryParams });
  }

  /**
   * Returns stored access token
   */
  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Returns stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Returns token prefix (Bearer / Token)
   */
  getTokenPrefix(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_PREFIX_KEY) || 'Bearer';
    }
    return 'Bearer';
  }

  /**
   * Stores access token, refresh token, and prefix
   * Also updates authentication state
   */
  setToken(
    token: string,
    prefix: string = 'Bearer',
    refreshToken: string | null = null
  ): void {

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_PREFIX_KEY, prefix);

      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    }

    // Notify app that user is now authenticated
    this.authState.next(true);
  }

  /**
   * Refreshes access token using refresh token
   * Called automatically by HTTP interceptor
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post(`${this.BASE_URL}/token/refresh/`, { refresh: refreshToken })
      .pipe(
        tap((response: any) => {
          if (response.access) {
            this.setToken(
              response.access,
              'Bearer',
              response.refresh || refreshToken
            );
          }
        })
      );
  }

  /**
   * Sends a password reset link to the user's email
   */
  forgotPassword(email: string): Observable<any> {
    // Note: Using special auth endpoint, not user endpoint
    return this.http.post(`${environment.apiUrl}/users/auth/forgot-password/`, { email });
  }

  /**
   * Resets the user's password using the token from the email
   */
  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/auth/reset-password/`, {
      token,
      password
    });
  }

  /**
   * Logs user out
   * Clears all auth-related data and updates auth state
   */
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_PREFIX_KEY);
      localStorage.removeItem('last_user_email');
    }

    this.lastLoggedInEmail = null;
    this.currentUser = null;
    this.userSubject.next(null);

    // Notify app that user is logged out
    this.authState.next(false);
  }
}
