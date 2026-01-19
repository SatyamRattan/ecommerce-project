import { Component, OnInit } from '@angular/core';  // Import Component decorator and OnInit lifecycle hook
import { CommonModule } from '@angular/common';      // Common Angular directives (ngIf, ngFor, etc.)
import { Router, RouterLink } from '@angular/router'; // Router for navigation, RouterLink for template linking
import { CheckoutService, ShippingAddress } from '../../../services/checkout'; // Checkout service + ShippingAddress interface
import { Cart as CartService } from '../../../services/cart';  // Cart service (renamed to avoid conflicts)
import { Orders as OrdersService } from '../../../services/orders'; // Orders service
import { forkJoin } from 'rxjs'; // RxJS operator to run multiple observables in parallel
import { FormsModule } from '@angular/forms'; // FormsModule for ngModel binding

@Component({
  selector: 'app-payment',  // HTML tag to use this component: <app-payment></app-payment>
  standalone: true,          // Standalone component, no NgModule required
  imports: [CommonModule, RouterLink, FormsModule], // Modules used inside this component template
  templateUrl: './payment.html',  // Path to HTML template
  styleUrl: './payment.css',      // Path to component-specific CSS
})
export class Payment implements OnInit {  // Class implements OnInit for lifecycle hook
  address: ShippingAddress | null = null;  // Holds shipping address object (null if not set)
  cartItems: any[] = [];                   // Array to hold items currently in the cart
  total = 0;                               // Total price for all cart items, calculated dynamically
  isProcessing = false;                    // Flag to prevent multiple clicks / submissions
  errorMessage = '';                        // Holds error messages to display in UI
  paymentMethod = 'cod';                    // Default payment method ('cod' = Cash on Delivery)
  agreed = false;                           // Whether user agreed to terms (bound in template, e.g., checkbox)

  constructor(
    private checkoutService: CheckoutService,  // Inject CheckoutService for shipping address operations
    private cartService: CartService,          // Inject CartService to read cart items and clear cart
    private ordersService: OrdersService,      // Inject OrdersService to create orders
    private router: Router                      // Inject Router to navigate programmatically
  ) { }

  // Function to set the payment method
  setPaymentMethod(method: string) {
    if (this.isProcessing) return;  // If an order is being processed, do not allow changing payment
    this.paymentMethod = method;     // Set the selected method (e.g., 'cod', 'card')
  }

  // Lifecycle hook called after component initialization
  ngOnInit() {
    // Retrieve saved shipping address from CheckoutService
    this.address = this.checkoutService.getShippingAddress();

    // If no address exists, redirect user to the address entry page
    if (!this.address) {
      this.router.navigate(['/checkout/address']); // Redirect
      return; // Stop further execution to prevent errors
    }

    // Subscribe to cart observable to keep track of current cart items
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;   // Update local cartItems array
      this.calculateTotal();    // Recalculate total whenever cart items change
    });
  }

  // Calculate total cost for all items in cart
  calculateTotal() {
    // Reduce array of cart items to a single total value
    this.total = this.cartItems.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0; // Get product price; fallback if not available
      const quantity = item.quantity || 1;                  // Get quantity; fallback to 1 if missing
      return sum + (price * quantity);                      // Multiply price * quantity and add to running sum
    }, 0); // Initial sum is 0
  }

  // Place an order for all cart items
  placeOrder() {
    if (this.isProcessing) return;   // Prevent double submission
    this.isProcessing = true;        // Mark that order is being processed
    this.errorMessage = '';          // Clear previous error messages

    // Map each cart item into a createOrder API call
    const orderRequests = this.cartItems.map(item => {
      const payload = {
        product: item.product?.id || item.product,                 // Use product.id if available; fallback to product object
        quantity: item.quantity,                                   // Quantity of the product
        price: item.product?.price || item.price,                 // Unit price
        total_price: (item.product?.price || item.price) * item.quantity, // Total price per item
        status: 'pending',                                        // Default order status
        shipping_address: this.address                             // Shipping address object
      };
      return this.ordersService.createOrder(payload);            // Return observable for API call
    });

    // forkJoin executes all API calls in parallel and waits for all to complete
    forkJoin(orderRequests).subscribe({
      next: (responses) => {
        console.log('All orders created successfully:', responses); // Log responses from backend

        // Once orders are successfully created, clear the cart
        this.cartService.clearCart().subscribe(() => {
          this.checkoutService.clearCheckoutData();           // Clear saved shipping info
          this.router.navigate(['/checkout/confirmation']);   // Navigate to confirmation page
        });
      },
      error: (err) => {                                       // Handle errors from any API call
        console.error('Error placing order:', err);          // Log for debugging
        this.errorMessage = 'Failed to place order. Please try again.'; // Show user-friendly error
        this.isProcessing = false;                            // Reset processing flag so user can retry
      }
    });
  }
}





// Key Points:

// Uses CheckoutService to get the saved shipping address.

// Subscribes to cartItems$ from CartService to always have the latest cart state.

// calculateTotal() dynamically computes total price whenever cart updates.

// Creates parallel API calls for each cart item using forkJoin.

// Handles success and failure scenarios gracefully with messages and navigation.

// Prevents double submission using isProcessing flag.