import { Component } from '@angular/core'; // Import Component decorator from Angular core
import { CommonModule } from '@angular/common'; // Import CommonModule for common directives like ngIf/ngFor
import { Api } from '../../../services/api'; // Import Api service to fetch products from backend
import { Router, ActivatedRoute } from '@angular/router'; // Import Router for navigation, ActivatedRoute for query params
import { Cart } from '../../../services/cart'; // Import Cart service to add products to cart

@Component({
  selector: 'app-products', // Define selector to use this component in HTML <app-products></app-products>
  standalone: true, // Standalone component, does not require NgModule
  imports: [CommonModule], // Import CommonModule inside standalone component
  templateUrl: './products.html', // HTML template file for this component
  styleUrl: './products.css' // CSS file for styling this component
})
export class Products {

  products: any[] = []; // Array to hold products currently displayed (after filtering)
  allProducts: any[] = []; // Array to hold all products fetched from backend
  isLoading: boolean = false; // Boolean flag to show loading spinner/message

  constructor(
    private api: Api,                // Inject Api service to fetch products
    public router: Router,           // Inject Router service for navigation
    private route: ActivatedRoute,   // Inject ActivatedRoute to read query parameters like category
    private cartService: Cart        // Inject Cart service to handle adding products to cart
  ) { }

  ngOnInit() { // Angular lifecycle method called once the component is initialized
    this.isLoading = true; // Start the loading spinner/message
    console.log('Fetching products...'); // Debug log to indicate fetch start

    // Call the Api service to fetch all products
    this.api.getProducts().subscribe({
      next: (res: any) => { // On successful fetch
        console.log('[Products] Raw response:', res); // Debug log of raw API response
        this.allProducts = res; // Save all products fetched into allProducts array

        // Subscribe to query params to dynamically filter products (e.g., by category)
        this.route.queryParamMap.subscribe(params => {
          const catId = params.get('category'); // Read 'category' query param from URL
          console.log('[Products] Category ID from query:', catId); // Debug log category ID

          if (catId) { // If category ID exists
            const numericCatId = Number(catId); // Convert string category ID to number
            // Filter allProducts array to only include products matching category ID
            this.products = this.allProducts.filter(p => Number(p.category) === numericCatId);
            console.log(`[Products] Filtered list size: ${this.products.length}`); // Debug log filtered length
          } else { // If no category filter, show all products
            this.products = this.allProducts; // Copy all products to display list
            console.log('[Products] Showing all products'); // Debug log
          }

          this.isLoading = false; // Stop loading spinner/message
        });
      },
      error: (err: any) => { // If API call fails
        console.error('Error fetching products:', err); // Log error in console
        this.isLoading = false; // Stop loading spinner/message
        if (typeof alert !== 'undefined') { // Browser alert fallback
          alert('Failed to load products. Check console.'); // Notify user
        }
      }
    });
  }

  addToCart(event: Event, product: any) { // Method to add a product to the cart
    event.stopPropagation(); // Stop the click event from bubbling to parent (like navigating to product page)
    console.log('[Products] Adding to cart:', product.id); // Debug log product ID

    // Call Cart service to add the product
    this.cartService.addToCart(product).subscribe({
      next: () => { // On successful addition
        if (typeof alert !== 'undefined') { // Browser alert fallback
          alert(`${product.name} added to cart!`); // Notify user
        }
      },
      error: (err) => { // On error adding to cart
        console.error('[Products] Add to cart error FULL:', err); // Log error in console
        let msg = 'Unknown error'; // Default error message

        // Check if error object has detailed message
        if (err.error) {
          msg = typeof err.error === 'string' // If error is string
            ? err.error
            : (err.error.message || err.error.detail || 'Error details in console'); // Pick message or detail
        } else if (err.message) { // Otherwise check for generic message
          msg = err.message;
        }

        // Alert user of error
        if (typeof alert !== 'undefined') {
          alert(`Failed to add to cart: ${msg}\n\nCheck console for details.`);
        }
      }
    });
  }

  openProduct(id: number) { // Method to navigate to product detail page
    this.router.navigate(['/product', id]); // Use Angular router to navigate to /product/:id
  }

}



// Key Notes on Functionality

// Fetching Products

// Uses Api.getProducts() to fetch all products from the backend.

// Subscribes to queryParamMap to reactively filter products by category (?category=1).

// Filtering Logic

// Converts category query param to number.

// Filters allProducts based on category ID.

// If no category, displays all products.

// Add to Cart

// Stops propagation to avoid accidental navigation.

// Calls cartService.addToCart(product.id) and shows alerts on success/failure.

// Handles detailed error extraction (err.error, err.message, etc.).

// Product Navigation

// Clicking a product triggers openProduct(id) → navigates to /product/:id.

// Loading State

// isLoading shows a spinner/message while fetching/filtering products.