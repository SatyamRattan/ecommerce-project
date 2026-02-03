import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Cart } from '../../../services/cart';
import { Wishlist } from '../../../services/wishlist';
import { ProductService } from '../../../services/products.service';
import { Observable, switchMap } from 'rxjs';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {

  products$!: Observable<Product[]>;

  constructor(
    private productService: ProductService,
    public router: Router,
    private route: ActivatedRoute,
    private cartService: Cart,
    public wishlist: Wishlist
  ) { }

  ngOnInit() {
    /**
     * Setup reactive stream to handle search and category query changes
     * 
     * Flow:
     * 1. Listen to query parameter changes using route.queryParamMap
     * 2. Extract 'search' and 'category' params from URL
     * 3. Call ProductService.getProducts() with both parameters
     * 4. Backend returns filtered results based on search query and/or category
     * 5. Template displays products from backend (no client-side filtering)
     * 
     * Examples:
     * - /products → backend returns all products
     * - /products?search=iphone → backend returns search results
     * - /products?category=5 → backend returns products in category 5 (e.g., Mobiles)
     * - /products?search=phone&category=5 → backend returns search results within category 5
     */
    this.products$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        // Extract search query from URL (?search=...)
        const searchQuery = params.get('search');

        // Extract category ID from URL (?category=...)
        // Convert string to number if present
        const categoryParam = params.get('category');
        const categoryId = categoryParam ? Number(categoryParam) : undefined;

        // Call ProductService with both search and category parameters
        // Backend handles the actual filtering based on these params
        return this.productService.getProducts(
          searchQuery || undefined,
          categoryId
        );
      })
    );
  }

  addToCart(event: Event, product: any) {
    event.stopPropagation();
    console.log('[Products] Adding to cart:', product.id);

    this.cartService.addToCart(product).subscribe({
      next: () => {
        if (typeof alert !== 'undefined') {
          alert(`${product.name} added to cart!`);
        }
      },
      error: (err) => {
        console.error('[Products] Add to cart error FULL:', err);
        let msg = 'Unknown error';
        if (err.error) {
          msg = typeof err.error === 'string'
            ? err.error
            : (err.error.message || err.error.detail || 'Error details in console');
        } else if (err.message) {
          msg = err.message;
        }

        if (typeof alert !== 'undefined') {
          alert(`Failed to add to cart: ${msg}\n\nCheck console for details.`);
        }
      }
    });
  }

  toggleWishlist(event: Event, product: any) {
    event.stopPropagation();
    this.wishlist.toggleWishlist(product.id).subscribe({
      next: (res) => console.log(res.message),
      error: (err) => {
        if (err.message === 'Unauthenticated') {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getVariantsByType(variants: any[]) {
    if (!variants || !Array.isArray(variants)) return [];
    const grouped: { [key: string]: string[] } = {};
    variants.forEach(v => {
      const type = v.variant_type || 'Options';
      if (!grouped[type]) grouped[type] = [];
      if (!grouped[type].includes(v.variant_value)) {
        grouped[type].push(v.variant_value);
      }
    });
    return Object.keys(grouped).map(key => ({
      type: key,
      values: grouped[key]
    }));
  }

  openProduct(id: number) {
    this.router.navigate(['/product', id]);
  }
}