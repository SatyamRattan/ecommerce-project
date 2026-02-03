// Marks this class as injectable via Angular Dependency Injection
import { Injectable } from '@angular/core';

// HttpClient is used for all backend API communication
import { HttpClient } from '@angular/common/http';

// RxJS utilities for async streams, state management, and API chaining
import {
  Observable,
  switchMap,
  of,
  BehaviorSubject,
  tap,
  forkJoin
} from 'rxjs';

// Auth service is used to check login state and get user identity
import { Auth } from './auth';

@Injectable({
  // Service is a singleton available across the entire app
  providedIn: 'root',
})
export class Cart {

  /**
   * Base backend URL for cart-related APIs
   */
  private BASE_URL = 'http://127.0.0.1:8000/api/cart';

  /**
   * Key used to store guest cart data in localStorage
   * This allows cart persistence before login
   */
  private GUEST_CART_KEY = 'guest_cart';
  private CART_KEY = 'cart_items'; // persist cart across pages & refresh

  /**
   * BehaviorSubject stores the current cart items in memory
   * - Holds latest value
   * - Allows components to subscribe and react automatically
   */
  private cartItems = new BehaviorSubject<any[]>([]);

  /**
   * Public observable exposed to components
   * Components subscribe to this instead of touching internal state
   */
  public cartItems$ = this.cartItems.asObservable();

  constructor(private http: HttpClient, private auth: Auth) {
    // Initialize cart state immediately when service is created
    this.initCart();
  }

  /**
   * Initializes cart depending on authentication state
   * - Authenticated → load cart from backend
   * - Guest → load cart from localStorage
   * - Also listens for login to merge guest cart
   */
  private initCart() {

    // If user is logged in, load cart from server
    if (this.isAuthenticated()) {
      this.refreshCart();
    }
    // Otherwise, restore guest cart from localStorage
    else if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.GUEST_CART_KEY);
      if (saved) {
        this.cartItems.next(JSON.parse(saved));
      }
    }

    /**
     * Listen to authentication state changes
     * When user logs in → merge guest cart into server cart
     */
    this.auth.authState$.subscribe(isAuth => {
      if (isAuth) {
        this.mergeCart().subscribe();
      }
    });
  }

  /**
   * Safely builds backend URLs
   * Prevents issues with missing or double slashes
   */
  private buildUrl(path: string): string {
    const baseUrl = this.BASE_URL.endsWith('/')
      ? this.BASE_URL.slice(0, -1)
      : this.BASE_URL;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Reloads cart data from backend
   * Normalizes different backend response shapes
   */
  refreshCart() {
    this.getCart().subscribe({
      next: (data) => {
        let items = [];

        // Handle DRF paginated response
        if (data && data.results && Array.isArray(data.results)) {
          items = data.results;
        }
        // Handle plain array response
        else if (Array.isArray(data)) {
          items = data;
        }
        // Handle custom response shape
        else if (data && data.items && Array.isArray(data.items)) {
          items = data.items;
        }

        // Update in-memory cart state
        this.cartItems.next(items);
        this.saveCart(items); // keep cart synced with storage
      },
      error: (err) =>
        console.error('[Cart Service] Failed to refresh cart:', err)
    });
  }

  /**
   * Fetches cart data from backend
   */
  getCart(): Observable<any> {
    return this.http.get(this.buildUrl('/cart/'));
  }

  /**
   * Wrapper around auth service
   */
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  /**
   * Redirects unauthenticated users to login
   */
  redirectToLogin(returnUrl?: string): void {
    this.auth.redirectToLogin(returnUrl);
  }

  /**
   * Adds a product to cart
   *
   * Supports:
   * - Guest users (localStorage-based cart)
   * - Authenticated users (backend cart)
   *
   * @param productOrId - Full product object or product ID
   * @param quantity - Number of items to add
   * @param variant_id - ID of the selected variant (required if product has variants)
   */
  addToCart(productOrId: any, quantity: number = 1, variant_id: number | null = null): Observable<any> {
    const isObject = typeof productOrId === 'object' && productOrId !== null;
    const productId = isObject ? productOrId.id : productOrId;

    /**
     * -------- GUEST CART FLOW --------
     */
    if (!this.isAuthenticated()) {
      const items = this.cartItems.value;

      // Find existing product in guest cart (matching both product and variant)
      const existing = items.find(
        i => (i.product?.id || i.product) === productId && i.variant_id === variant_id
      );

      // Increase quantity if product with same variant already exists
      if (existing) {
        existing.quantity += quantity;
      } else {
        // Store product info for guest cart
        items.push({
          product: isObject ? productOrId : { id: productId },
          variant_id: variant_id,
          quantity,
          is_guest: true
        });
      }

      // Persist guest cart
      this.saveGuestCart(items);

      // Return mock observable to maintain API consistency
      return of({ message: 'Added to guest cart' });
    }

    /**
     * -------- AUTHENTICATED CART FLOW --------
     */
    const user = this.auth.getCurrentUser();
    const userId = this.auth.getUserId(user);

    // If user ID is already cached
    if (userId) {
      const payload: any = {
        product_id: productId,
        quantity,
        variant_id: variant_id
      };


      return this.http.post(this.buildUrl('/cart/'), payload).pipe(
        // Refresh cart after successful addition
        tap(() => this.refreshCart())
      );
    }

    /**
     * Fallback: Fetch profile to get user ID
     */
    return this.auth.getProfile().pipe(
      switchMap(profile => {
        const freshUserId = this.auth.getUserId(profile);
        if (!freshUserId) {
          throw new Error('Could not identify user');
        }

        const payload: any = {
          product_id: productId,
          quantity,
          variant_id: variant_id
        };


        return this.http.post(this.buildUrl('/cart/'), payload).pipe(
          tap(() => this.refreshCart())
        );
      })
    );
  }

  /**
   * Saves guest cart to memory and localStorage
   */
  private saveGuestCart(items: any[]) {
    this.cartItems.next([...items]);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        this.GUEST_CART_KEY,
        JSON.stringify(items)
      );
    }
  }

  /**
   * Merges guest cart into authenticated user's cart
   * Triggered automatically on login
   */
  mergeCart(): Observable<any> {
    if (typeof localStorage === 'undefined') return of(null);

    const saved = localStorage.getItem(this.GUEST_CART_KEY);
    if (!saved) return of(null);

    const guestItems = JSON.parse(saved);
    if (guestItems.length === 0) return of(null);

    console.log('[Cart] Merging guest cart to server:', guestItems);

    /**
     * Convert each guest item into an add-to-cart API call
     * forkJoin executes all requests in parallel
     */
    const requests = guestItems.map((item: any) =>
      this.addToCart(item.product.id, item.quantity, item.variant_id)
    );

    // Execute migration and cleanup
    forkJoin(requests).subscribe({
      next: () => {
        localStorage.removeItem(this.GUEST_CART_KEY);
        console.log('[Cart] Migration complete.');
      },
      error: (err) =>
        console.error('[Cart] Migration failed:', err)
    });

    return of({ message: 'Migration started' });
  }

  /**
   * Updates quantity of a cart item
   */
  /**
   * Updates quantity of a cart item
   * Accepts itemId (for auth) or productId (for guest)
   */
  updateCartItem(id: number, quantity: number, variantId: number | null = null): Observable<any> {
    // Check if user is NOT authenticated (Guest mode)
    if (!this.isAuthenticated()) {
      // Get current items from BehaviorSubject
      const items = this.cartItems.value;

      // Find item by product ID AND variant ID
      const item = items.find(i => (i.product?.id || i.product) === id && i.variant_id === variantId);

      // If item found, update its quantity
      if (item) {
        item.quantity = quantity;
        // Save updated list to localStorage and BehaviorSubject
        this.saveGuestCart(items);
        this.saveCart(items); // keep cart synced with storage
      }

      // Return success observable
      return of({ success: true });
    }

    // Authenticated flow: Call API with cart item ID
    return this.http
      .patch(this.buildUrl(`/cart/${id}/`), { quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  /**
   * Removes an item from cart
   */
  removeFromCart(id: number, variantId: number | null = null): Observable<any> {
    // Check if user is NOT authenticated (Guest mode)
    if (!this.isAuthenticated()) {
      // Get current items
      const items = this.cartItems.value;

      // Filter out the item to remove (matching by product ID AND variant ID)
      const newItems = items.filter(i => !((i.product?.id || i.product) === id && i.variant_id === variantId));

      // Save updated list to localStorage
      this.saveGuestCart(newItems);
      this.saveCart(newItems); // keep cart synced with storage

      // Return success observable
      return of({ success: true });
    }

    // Authenticated flow: Call API with cart item ID
    return this.http
      .delete(this.buildUrl(`/cart/${id}/`))
      .pipe(tap(() => this.refreshCart()));
  }

  /**
   * Clears entire cart on backend
   */
  clearCart(): Observable<any> {
    return this.http
      .delete(this.buildUrl('/cart/clear/'))
      .pipe(tap(() => this.refreshCart()));
  }

  saveCart(items: any[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items)); // save cart
    }
  }

  loadCart(): any[] {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]'); // restore cart
    }
    return [];
  }
}
