// Injectable decorator allows this service to be injected using Angular's DI system
import { Injectable } from '@angular/core';

// HttpClient is used to make HTTP requests to the backend
import { HttpClient } from '@angular/common/http';

// Observable represents asynchronous data streams returned by HTTP calls
import { Observable } from 'rxjs';

@Injectable({
  // Makes this service a singleton available across the entire app
  providedIn: 'root'
})
export class Api {

  /**
   * Base URL for catalog-related backend APIs
   * All product and category requests are built on top of this
   */
  private BASE_URL = 'http://127.0.0.1:8000/api/catalog';

  /**
   * Inject HttpClient so this service can communicate with the backend
   */
  constructor(private http: HttpClient) {}

  /**
   * Fetches the complete list of products
   * Typically used on product listing pages
   *
   * Returns:
   * - Observable that emits the backend response (array or paginated data)
   */
  getProducts(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/products/`);
  }

  /**
   * Fetches all product categories
   * Used to display category navigation or filters
   *
   * Returns:
   * - Observable containing category data
   */
  getCategories(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/category/`);
  }

  /**
   * Fetches details of a single product by ID
   *
   * @param id - Unique identifier of the product
   * Returns:
   * - Observable emitting product detail object
   */
  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/products/${id}/`);
  }
}
