// Marks this class as an injectable Angular service
import { Injectable } from '@angular/core';

// Used to perform HTTP requests (GET, POST, PATCH, etc.)
import { HttpClient } from '@angular/common/http';

// Observable represents async data coming from HTTP calls
import { Observable } from 'rxjs';

@Injectable({
  // Makes this service a singleton available across the app
  providedIn: 'root',
})
export class Orders {

  /**
   * Base API URL for all order-related operations
   * Backend example:
   * /api/orders/order/
   * /api/orders/order/{id}/
   */
  private BASE_URL = 'http://127.0.0.1:8000/api/orders';

  constructor(private http: HttpClient) { }

  /**
   * Utility method to safely construct API URLs
   *
   * Why this exists:
   * - Prevents double slashes (//)
   * - Ensures consistent URL formatting
   * - Centralizes URL logic (easy to change later)
   *
   * Example:
   * BASE_URL = http://.../api/orders
   * path     = /order/1/
   * result   = http://.../api/orders/order/1/
   */
  private buildUrl(path: string): string {

    // Remove trailing slash from BASE_URL if present
    const baseUrl = this.BASE_URL.endsWith('/')
      ? this.BASE_URL.slice(0, -1)
      : this.BASE_URL;

    // Ensure path always starts with a slash
    const cleanPath = path.startsWith('/')
      ? path
      : `/${path}`;

    // Combine base URL and path
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Fetch all orders of the logged-in user
   * Auth token is automatically added via interceptor
   */
  getOrders(): Observable<any> {
    return this.http.get(this.buildUrl('/order/'));
  }

  /**
   * Fetch details of a single order by ID
   *
   * @param id - Order ID
   */
  getOrderById(id: number): Observable<any> {
    return this.http.get(this.buildUrl(`/order/${id}/`));
  }

  /**
   * Create a new order
   *
   * @param orderData - Payload containing cart, address, payment info, etc.
   */
  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.buildUrl('/order/'), orderData);
  }

  /**
   * Cancel an existing order
   *
   * PATCH is used instead of PUT because:
   * - Only updating one field (status)
   * - Partial update is more efficient
   *
   * @param id - Order ID to cancel
   */
  cancelOrder(id: number): Observable<any> {
    return this.http.patch(
      this.buildUrl(`/order/${id}/`),
      { status: 'cancelled' }
    );
  }

  /**
   * Fetch order tracking history
   *
   * @param id - Order ID
   */
  getOrderHistory(id: number): Observable<any> {
    // Try /history/ if /track/ fails, or stick to the most likely standard DRF path
    return this.http.get(this.buildUrl(`/order/${id}/history/`));
  }
}



// What you should internalize from THIS file
// ✅ Why buildUrl() is a GOOD practice

// Avoids bugs caused by // in URLs

// Makes API endpoints predictable

// One place to fix if backend URL changes

// ✅ Why PATCH for cancel order
// Method	Use case
// POST	Create
// GET	Fetch
// PUT	Replace entire object
// PATCH	Update specific fields

// ➡️ Cancelling only changes status, so PATCH is correct.

// ✅ Why Observable<any>

// HttpClient always returns Observable

// any is acceptable during development

// Later you can replace with Order, Order[], etc.

// ✅ Why Auth is NOT imported here

// This service does not care about auth

// Interceptor handles tokens

// Clean architecture ✔️