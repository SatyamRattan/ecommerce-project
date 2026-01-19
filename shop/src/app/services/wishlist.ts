// Injectable decorator makes this class an Angular service
import { Injectable } from '@angular/core';

// HttpClient is used to make API calls
import { HttpClient } from '@angular/common/http';

// RxJS types and operators
import { Observable, switchMap, of } from 'rxjs';

// Auth service for user + authentication data
import { Auth } from './auth';

@Injectable({
  // Service is available application-wide (singleton)
  providedIn: 'root',
})
export class Wishlist {

  /**
   * Base API endpoint for wishlist operations
   * Example backend:
   * POST   -> add to wishlist
   * GET    -> fetch wishlist
   * DELETE -> remove item
   */
  private BASE_URL = 'http://127.0.0.1:8000/api/catalog/wishlist/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  /**
   * Fetch the current user's wishlist
   * Auth header is automatically attached by interceptor
   */
  getWishlist(): Observable<any> {
    return this.http.get(this.BASE_URL);
  }

  /**
   * Add a product to wishlist
   *
   * Flow:
   * 1. Try to get cached user from Auth service
   * 2. If user ID exists → send request immediately
   * 3. If NOT → fetch profile first, then retry
   */
  addToWishlist(productId: number): Observable<any> {

    // Get cached user (stored after login / profile fetch)
    const user = this.auth.getCurrentUser();

    console.log('[Wishlist] Current cached user for add:', user);

    // Extract user ID from cached user object
    const userId = this.auth.getUserId(user);

    /**
     * CASE 1:
     * User ID is already available in cache
     * → Directly send wishlist request
     */
    if (userId) {
      const payload = {
        user: userId,
        product: productId,
      };

      console.log('[Wishlist] Sending payload (cached user):', payload);

      return this.http.post(this.BASE_URL, payload);
    }

    /**
     * CASE 2:
     * User ID not available (page refresh / cold start)
     * → Fetch profile first
     * → Extract user ID
     * → Then add to wishlist
     */
    else {
      console.log('[Wishlist] User ID not in cache, fetching profile first...');

      return this.auth.getProfile().pipe(
        switchMap(profile => {

          // Extract user ID from freshly fetched profile
          const freshUserId = this.auth.getUserId(profile);

          console.log('[Wishlist] Profile fetched, User ID:', freshUserId);

          /**
           * Defensive check:
           * If backend response structure is unexpected
           */
          if (!freshUserId) {
            console.error(
              '[Wishlist] Still no User ID after profile fetch. Profile keys:',
              Object.keys(profile || {})
            );
            throw new Error('Could not identify user');
          }

          // Build payload after successful profile fetch
          const payload = {
            user: freshUserId,
            product: productId,
          };

          console.log('[Wishlist] Sending payload after fresh fetch:', payload);

          // Send wishlist POST request
          return this.http.post(this.BASE_URL, payload);
        })
      );
    }
  }

  /**
   * Remove an item from wishlist
   * wishlistId is the ID of the wishlist record (not product ID)
   */
  removeFromWishlist(wishlistId: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${wishlistId}/`);
  }
}


// Key concepts YOU should understand from this service
// 1️⃣ Why cached user may be missing

// Page refresh

// App reload

// Auth state restored only from token, not profile

// ➡️ That’s why profile fetch fallback exists

// 2️⃣ Why switchMap is used

// You must wait for profile

// Then use its data to make another HTTP call

// switchMap ensures:

// Old requests are canceled

// Clean async chaining

// 3️⃣ Why user ID is sent explicitly

// Django REST backend likely expects:

// {
//   "user": 3,
//   "product": 12
// }


// Even though token exists, serializer still needs user

// 4️⃣ Difference between IDs
// ID Type	Meaning
// productId	Product being wishlisted
// wishlistId	Wishlist table row ID
// userId	Logged-in user
// 5️⃣ Why interceptor is NOT mentioned here

// Because:

// This service only declares intent

// Auth headers are injected automatically

// Clean separation of concerns ✔️