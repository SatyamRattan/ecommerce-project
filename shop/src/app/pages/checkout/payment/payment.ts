import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService, ShippingAddress } from '../../../services/checkout';
import { Cart as CartService } from '../../../services/cart';
import { Orders as OrdersService } from '../../../services/orders';
import { Auth } from '../../../services/auth';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface OrderItem {
  id?: number;
  product?: {
    id: number;
    name: string;
    base_price: number;
    discount_price?: number | null;
  };
  variant?: {
    id: number;
    color: string;
    image: string;
    product: {
      id: number;
      name: string;
    };
  };
  product_id?: number;
  variant_id?: number | null;
  quantity: number;
  price?: number;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit {
  address: ShippingAddress | null = null;
  cartItems: OrderItem[] = [];
  total = 0;
  itemsTotal = 0;
  orderTotal = 0;
  isProcessing = false;
  errorMessage = '';
  paymentMethod = 'cod';
  agreed = false;

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private ordersService: OrdersService,
    private auth: Auth,
    private router: Router
  ) { }

  setPaymentMethod(method: string) {
    if (this.isProcessing) return;
    this.paymentMethod = method;
  }

  ngOnInit() {
    this.address = this.checkoutService.getShippingAddress();

    if (!this.address) {
      this.router.navigate(['/checkout/address']);
      return;
    }

    this.cartItems = this.cartService.loadCart() as OrderItem[];

    if (!this.cartItems || this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.calculateTotals();
  }

  calculateTotals() {
    this.itemsTotal = this.cartItems.reduce((sum, item) => {
      // Prefer item.price (variant price) if available
      const price = (item as any).price || item.product?.discount_price || item.product?.base_price || 0;
      return sum + Number(price) * item.quantity;
    }, 0);

    this.orderTotal = this.itemsTotal;
    this.total = this.orderTotal;
  }

  placeOrder() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.errorMessage = '';

    // STEP 2: Inspect cart structure
    console.log('[Payment] Inspecting raw cart items:', JSON.stringify(this.cartItems, null, 2));

    // Get current user and generate a unique order number for this batch
    const user = this.auth.getCurrentUser();
    let userId = this.auth.getUserId(user);

    // Ensure userId is a number (integer) as required by backend PK fields
    if (userId && isNaN(Number(userId))) {
      console.warn('[Payment] userId is not numeric, sending as-is but backend may reject.');
    } else if (userId) {
      userId = Number(userId);
    }

    // Single unique order number for the entire checkout
    const timestampShort = Date.now().toString().slice(-8);
    const orderNumber = `ORD-${timestampShort}-${userId || 'GS'}`.substring(0, 20);

    // STEP 3: Fix payload construction
    // Map cart items to backend OrderItem format (nested under Order)
    const items = this.cartItems.map((item, index) => {
      const price = (item as any).price || item.product?.discount_price || item.product?.base_price || 0;

      // Robustly find product ID from all possible locations
      let productId: number | undefined;

      // 1. Check if directly on item (sometimes added this way)
      if (item.product_id) productId = Number(item.product_id);

      // 2. Check the product object (common for authenticated cart)
      if (!productId && item.product) {
        productId = typeof item.product === 'object' ? Number(item.product.id) : Number(item.product);
      }

      // 3. Check the variant's product relation (common for variant items)
      if (!productId && item.variant?.product?.id) {
        productId = Number(item.variant.product.id);
      }

      // 4. Fallback to item.id if no product info exists (some cart models)
      if (!productId && (item as any).id && !item.product && !item.variant) {
        productId = Number((item as any).id);
      }

      // STEP 4: Fail-fast guard
      if (!productId || isNaN(productId)) {
        const errorMsg = `CRITICAL ERROR: Item at index ${index} is missing product_id. Data: ${JSON.stringify(item)}`;
        console.error(errorMsg);
        this.errorMessage = 'Checkout Error: One of your items is invalid. Please try re-adding to cart.';
        this.isProcessing = false;
        throw new Error(errorMsg); // Stop the request
      }

      console.log(`[Payment] Item ${index}: Resolved product_id=${productId}`);

      return {
        product_id: productId, // EXACT field name required by DRF
        variant_id: item.variant?.id || item.variant_id || null,
        quantity: item.quantity,
        price: Number(price) || 0
      };
    });

    // Consolidated payload for single-order creation
    const payload = {
      user: userId,
      order_number: orderNumber,
      total_amount: this.total,
      items: items
    };

    // STEP 5: Prove the fix
    console.log('[Payment] FINAL Order Payload to be sent to backend:', JSON.stringify(payload, null, 2));

    // STEP 1: Locate the real API call
    this.ordersService.createOrder(payload).subscribe({
      next: (response) => {
        console.log('[Payment] Order created successfully:', response);

        this.cartService.clearCart().subscribe(() => {
          this.checkoutService.clearCheckoutData();
          // Pass the order data to confirmation page
          this.router.navigate(['/checkout/confirmation'], { state: { order: response } });
        });
      },
      error: (err) => {
        console.error('[Payment] Error placing order:', err);

        // Extract specific error detail if available
        let detailedError = '';
        if (err.error) {
          detailedError = typeof err.error === 'string'
            ? err.error
            : (err.error.detail || err.error.message || JSON.stringify(err.error));
        }

        this.errorMessage = `Failed to place order: ${detailedError || 'Please try again.'}`;
        console.error('[Payment] Full error response body:', err.error);
        if (typeof alert !== 'undefined' && err.error) {
          alert('Order Error Details: ' + JSON.stringify(err.error));
        }
        this.isProcessing = false;
      }
    });
  }
}