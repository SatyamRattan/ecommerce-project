import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError, Observable, finalize } from 'rxjs';
import { Auth } from './auth';

export interface ToggleWishlistPayload {
  product: number;
  variant?: number | null;
}

export interface ToggleWishlistResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Wishlist {
  private BASE_URL = 'http://127.0.0.1:8000/api/catalog/wishlist/';
  private TOGGLE_URL = `${this.BASE_URL}toggle/`;

  // Signal to store identifiers of wishlisted products (Set for O(1) lookup)
  private wishlistState: WritableSignal<Set<number>> = signal(new Set<number>());

  // Public readonly signal for UI (if needed directly)
  public readonly wishlistedIds = this.wishlistState.asReadonly();

  // Loading state signal
  public isLoading = signal(false);

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {
    this.initWishlist();
  }

  /**
   * Initialize wishlist state
   */
  private initWishlist() {
    if (this.auth.isAuthenticated()) {
      this.refreshWishlist();
    }
  }

  /**
   * Fetch latest wishlist from backend
   */
  /**
   * Fetch latest wishlist from backend
   */
  getWishlist(): Observable<any[]> {
    this.isLoading.set(true);
    return this.http.get<any[]>(this.BASE_URL).pipe(
      tap((items) => {
        // Map response to Set of product IDs for O(1) checks
        const productIds = new Set<number>();
        items.forEach(item => {
          // Handle both flat ID and expanded object
          const pId = typeof item.product === 'object' ? item.product.id : item.product;
          if (pId) productIds.add(pId);
        });
        this.wishlistState.set(productIds);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  refreshWishlist() {
    this.getWishlist().subscribe({
      error: (err) => console.error('[Wishlist] Failed to fetch:', err)
    });
  }

  /**
   * Remove item from wishlist (alias to toggle for compatibility)
   */
  removeFromWishlist(productId: number): Observable<any> {
    return this.toggleWishlist(productId);
  }

  /**
   * Check if a product is wishlisted (Reactive Helper)
   */
  isWishlisted(productId: number) {
    return computed(() => this.wishlistState().has(productId));
  }

  /**
   * Toggle wishlist state for a product
   * Handles Optimistic UI updates
   */
  toggleWishlist(productId: number, variantId: number | null = null): Observable<ToggleWishlistResponse> {
    if (!this.auth.isAuthenticated()) {
      // return error if not logged in, let component handle redirect/toast
      return throwError(() => new Error('Unauthenticated'));
    }

    const payload: ToggleWishlistPayload = {
      product: productId,
      variant: variantId
    };

    // OPTIMISTIC UPDATE
    const currentState = new Set(this.wishlistState());
    const isCurrentlyWishlisted = currentState.has(productId);

    if (isCurrentlyWishlisted) {
      currentState.delete(productId);
    } else {
      currentState.add(productId);
    }

    // Update Signal immediately
    this.wishlistState.set(currentState);

    return this.http.post<ToggleWishlistResponse>(this.TOGGLE_URL, payload).pipe(
      tap(response => {
        console.log('[Wishlist] Toggle success:', response.message);
      }),
      catchError(err => {
        console.error('[Wishlist] Toggle failed, rolling back:', err);

        // ROLLBACK ON ERROR
        // Revert to previous state (inverse of what we just did)
        const rollbackState = new Set(this.wishlistState());
        if (isCurrentlyWishlisted) {
          rollbackState.add(productId); // Put it back
        } else {
          rollbackState.delete(productId); // Remove it
        }
        this.wishlistState.set(rollbackState);

        return throwError(() => err);
      })
    );
  }
}