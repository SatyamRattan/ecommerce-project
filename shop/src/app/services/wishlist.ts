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

  // Signal to store identifiers of wishlisted items (Variant IDs preferred, Fallback to Product ID if no variant)
  private wishlistState: WritableSignal<Set<number>> = signal(new Set<number>());

  // Public readonly signal for UI
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
  getWishlist(): Observable<any[]> {
    this.isLoading.set(true);
    return this.http.get<any[]>(this.BASE_URL).pipe(
      tap((items) => {
        // Map response to Set of IDs (variant ID preferred, fallback to product ID)
        const itemIds = new Set<number>();
        items.forEach(item => {
          const vId = typeof item.variant === 'object' ? item.variant?.id : item.variant;
          const pId = typeof item.product === 'object' ? item.product?.id : item.product;

          // If it's a variant-based wishlist, use vId
          if (vId) {
            itemIds.add(vId);
          } else if (pId) {
            // Fallback for product-only wishlist items
            itemIds.add(pId);
          }
        });
        this.wishlistState.set(itemIds);
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
   * Remove item from wishlist by record ID
   */
  removeFromWishlist(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${id}/`).pipe(
      tap(() => {
        console.log(`[Wishlist] Item #${id} removed`);
        // We refresh the whole state to ensure consistency, 
        // especially since tracked IDs in wishlistState depend on response fields
        this.refreshWishlist();
      })
    );
  }

  /**
   * Check if an ID is wishlisted (Reactive Helper)
   */
  isWishlisted(id: number | undefined) {
    return computed(() => id ? this.wishlistState().has(id) : false);
  }

  /**
   * Toggle wishlist state for a product/variant
   */
  toggleWishlist(productId: number, variantId: number | null = null): Observable<ToggleWishlistResponse> {
    if (!this.auth.isAuthenticated()) {
      return throwError(() => new Error('Unauthenticated'));
    }

    const payload: ToggleWishlistPayload = {
      product: productId,
      variant: variantId
    };

    // Use variantId if present, otherwise fallback to productId for tracking
    const trackId = variantId || productId;

    // OPTIMISTIC UPDATE
    const currentState = new Set(this.wishlistState());
    const isCurrentlyWishlisted = currentState.has(trackId);

    if (isCurrentlyWishlisted) {
      currentState.delete(trackId);
    } else {
      currentState.add(trackId);
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
        const rollbackState = new Set(this.wishlistState());
        if (isCurrentlyWishlisted) {
          rollbackState.add(trackId);
        } else {
          rollbackState.delete(trackId);
        }
        this.wishlistState.set(rollbackState);

        return throwError(() => err);
      })
    );
  }
}