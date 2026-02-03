import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    // Base URL for product-related backend APIs
    private BASE_URL = 'http://127.0.0.1:8000/api/catalog';

    constructor(private http: HttpClient) { }

    /**
     * Fetch products from backend with optional search and category parameters
     * 
     * @param searchQuery - Optional search term to filter products
     * @param categoryId - Optional category ID to filter products by category
     * @returns Observable containing product array from backend
     * 
     * Examples:
     * - getProducts() → GET /api/catalog/products/
     * - getProducts('iphone') → GET /api/catalog/products/?search=iphone
     * - getProducts(undefined, 5) → GET /api/catalog/products/?category=5
     * - getProducts('phone', 5) → GET /api/catalog/products/?search=phone&category=5
     */
    getProducts(searchQuery?: string, categoryId?: number): Observable<any> {
        let params = new HttpParams();

        // Add search parameter if provided and not empty
        if (searchQuery && searchQuery.trim()) {
            params = params.set('search', searchQuery.trim());
        }

        // Add category parameter if provided
        // This will filter products to show only those belonging to the specified category
        if (categoryId !== undefined && categoryId !== null) {
            params = params.set('category', categoryId.toString());
        }

        // Make GET request to backend with query parameters
        return this.http.get(`${this.BASE_URL}/products/`, { params });
    }

    /**
     * Fetch single product details by ID
     * 
     * @param id - Product ID
     * @returns Observable containing product details
     */
    getProductById(id: number): Observable<any> {
        return this.http.get(`${this.BASE_URL}/products/${id}/`);
    }
}
