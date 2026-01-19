import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Used to read route params (product ID)
import { Api } from '../../../services/api'; // Service to call backend API for products
import { CommonModule } from '@angular/common'; // Angular common module for structural directives
import { Cart } from '../../../services/cart'; // Service to handle cart actions
import { Wishlist } from '../../../services/wishlist'; // Service to handle wishlist actions

@Component({
  standalone: true,
  selector: 'app-product-details', // HTML tag to use this component
  imports: [CommonModule], // Required modules for this component
  templateUrl: './product-details.html', // HTML template for product details page
  styleUrl: './product-details.css', // CSS styles for product details page
})
export class ProductDetails {
  product: any; // Holds the product data fetched from backend

  constructor(
    private route: ActivatedRoute, // Access route parameters
    private api: Api, // API service for fetching product data
    private cartService: Cart, // Cart service for adding product to cart
    private wishlistService: Wishlist // Wishlist service for adding product to wishlist
  ) {
    // Get the 'id' parameter from the URL (route snapshot)
    const id = this.route.snapshot.params['id'];

    // Fetch product details from the backend using the API service
    this.api.getProduct(id).subscribe((res: any) => {
      console.log('[ProductDetails] Raw response:', res);

      // Parse the response:
      // - If response is an array, take the first element
      // - If response has a 'results' property, take the first element of results
      // - Otherwise, use response as is
      this.product = Array.isArray(res)
        ? res[0]
        : (res && res.results ? res.results[0] : res);

      console.log('[ProductDetails] Parsed product:', this.product);
    });
  }

  // Method to add current product to cart
  addToCart() {
    if (!this.product) return; // Guard: exit if product is not loaded
    console.log('[ProductDetails] Adding to cart:', this.product.id);

    // Call cart service to add product to cart
    this.cartService.addToCart(this.product).subscribe({
      next: () => {
        // Notify user of successful addition
        if (typeof alert !== 'undefined') {
          alert('Added to cart!');
        }
      },
      error: (err) => {
        // Handle errors and show detailed message if available
        console.error('Add to cart error:', err);
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        if (typeof alert !== 'undefined') {
          alert(`Failed to add to cart: ${detail}`);
        }
      }
    });
  }

  // Method to add current product to wishlist
  addToWishlist() {
    if (!this.product) return; // Guard: exit if product is not loaded
    console.log('[ProductDetails] Adding to wishlist:', this.product.id);

    // Call wishlist service to add product to wishlist
    this.wishlistService.addToWishlist(Number(this.product.id)).subscribe({
      next: () => {
        // Notify user of successful addition
        if (typeof alert !== 'undefined') {
          alert('Added to wishlist!');
        }
      },
      error: (err) => {
        // Handle errors and show detailed message if available
        console.error('Add to wishlist error:', err);
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        if (typeof alert !== 'undefined') {
          alert(`Failed to add to wishlist: ${detail}`);
        }
      }
    });
  }
}




// Key Points Covered in Comments:

// Imports explained: why each service/module is needed.

// Constructor logic explained, including route param extraction.

// Response parsing explained in detail for different response shapes (array, results, single object).

// Method logic for addToCart and addToWishlist fully commented:

// Guards for null/undefined product

// Subscription logic

// Success and error handling with detailed messages

// Console logs explained as debug aids.