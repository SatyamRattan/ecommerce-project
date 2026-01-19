import { Component, OnInit } from '@angular/core';
// Import Component and OnInit lifecycle hook from Angular core library
// Component: To define an Angular component
// OnInit: Lifecycle interface to run code when component initializes

import { CommonModule } from '@angular/common';
// Import CommonModule to use common Angular directives like *ngIf, *ngFor in the template

import { RouterLink } from '@angular/router';
// Import RouterLink directive to allow navigation links in the template

import { Cart as CartService } from '../../../services/cart';
// Import Cart service, renaming it to CartService to avoid naming conflict with component
// This service handles cart operations like adding/removing items, fetching cart data

@Component({
  selector: 'app-cart',
  // Defines HTML tag for this component, e.g., <app-cart></app-cart>

  standalone: true,
  // Marks this as a standalone component (no module declaration required)

  imports: [CommonModule, RouterLink],
  // Modules/directives used in the template: CommonModule for Angular directives, RouterLink for navigation

  templateUrl: './cart.html',
  // Path to the HTML template for this component

  styleUrl: './cart.css',
  // Path to CSS file for component styling
})
export class Cart implements OnInit {
  // Exporting class Cart so Angular can use it as a component
  // Implements OnInit lifecycle hook to perform initialization tasks

  cartItems: any[] = [];
  // Array to store items in the cart
  // Initialized as empty array to avoid undefined errors

  total = 0;
  // Variable to store total cart value
  // Initialized to 0

  loading = true;
  // Boolean flag to show loading spinner or message
  // True initially until cart data is fetched

  errorMessage = '';
  // String to store error messages related to cart operations

  constructor(private cartService: CartService) { }
  // Inject CartService into component
  // Declared private because only this class needs to access it

  ngOnInit() {
    // Lifecycle hook called after component is initialized

    this.cartService.cartItems$.subscribe(items => {
      // Subscribe to cartItems$ observable from CartService
      // Observable emits current cart items whenever cart updates

      console.log('[Cart Component] Received items from stream:', items.length);
      // Debugging: Logs the number of items received

      this.cartItems = items;
      // Assign emitted cart items to local cartItems array for template usage

      this.calculateTotal();
      // Calculate total price whenever cart items change

      this.loading = false;
      // Loading finished, hide any loading spinner
    });

    this.loadCart();
    // Call method to fetch cart items from backend initially
  }

  loadCart() {
    // Method to reload cart from backend
    this.loading = true;
    // Show loading indicator while fetching

    // Only refresh from backend if authenticated
    // This prevents 401 errors during SSR (where no tokens exist)
    if (this.cartService.isAuthenticated()) {
      this.cartService.refreshCart();
      // Call CartService method to fetch latest cart items from backend
    } else {
      // For guests, cartItems$ is already populated from localStorage via service logic
      // Just stop loading
      this.loading = false;
    }
  }

  updateQuantity(item: any, quantity: number) {
    // Method to update quantity of a cart item

    if (quantity < 1) return;
    // Prevent setting quantity below 1 (invalid)

    // Determine correct ID to send to service
    // Guest: use product.id (since no cart item ID exists)
    // Auth: use item.id (database primary key of cart item)
    const id = this.cartService.isAuthenticated()
      ? item.id
      : (item.product?.id || item.product);

    this.cartService.updateCartItem(id, quantity).subscribe();
    // Call service to update backend with new quantity
    // Subscribe is required to execute the observable
  }

  removeItem(item: any) {
    // Method to remove a single item from cart

    if (confirm('Remove this item from cart?')) {
      // Show browser confirmation dialog to user

      // Determine correct ID based on auth status
      // Guest: use product.id
      // Auth: use item.id
      const id = this.cartService.isAuthenticated()
        ? item.id
        : (item.product?.id || item.product);

      this.cartService.removeFromCart(id).subscribe();
      // Call service to remove item by ID from backend
    }
  }

  clearCart() {
    // Method to clear entire cart

    if (confirm('Clear entire cart?')) {
      // Confirmation dialog before clearing all items

      this.cartService.clearCart().subscribe();
      // Call service method to clear backend cart
    }
  }

  calculateTotal() {
    // Method to calculate total price of all items in cart

    this.total = this.cartItems.reduce((sum, item) => {
      // Reduce method iterates over all cart items and accumulates total
      // sum: accumulated total so far
      // item: current cart item

      // Use discount_price if available, otherwise fallback to base_price or legacy price field
      const price = item.product?.discount_price ||
        item.product?.base_price ||
        item.product?.price ||
        item.price ||
        0;

      const quantity = item.quantity || 1;
      // Get item quantity, default to 1 if undefined

      return sum + (price * quantity);
      // Add price multiplied by quantity to sum
    }, 0);
    // Initial sum value is 0
  }
}
