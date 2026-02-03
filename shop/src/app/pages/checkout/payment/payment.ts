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
  product: {
    id: number;
    name: string;
    base_price: number;
    discount_price?: number | null;
  };
  product_id?: number;
  variant_id?: number | null;
  quantity: number;
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
      const product = item.product || { base_price: 0 };
      const price = product.discount_price ?? product.base_price;
      return sum + (price || 0) * item.quantity;
    }, 0);

    this.orderTotal = this.itemsTotal;
    this.total = this.orderTotal;
  }

  placeOrder() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.errorMessage = '';

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

    // Map cart items to backend OrderItem format (nested under Order)
    const items = this.cartItems.map(item => {
      const productObj = item.product || { base_price: 0 };
      const price = productObj.discount_price ?? productObj.base_price;

      return {
        product: productObj.id || item.product_id,
        quantity: item.quantity,
        price: price || 0,
        variant: item.variant_id || (item as any).variant?.id || null
      };
    });

    // Consolidated payload for single-order creation with nested items
    const payload = {
      user: userId,
      order_number: orderNumber,
      total_amount: this.total,
      items: items
    };

    console.log('[Payment] Placing Order with consolidated Payload:', payload);

    this.ordersService.createOrder(payload).subscribe({
      next: (response) => {
        console.log('[Payment] Order created successfully:', response);

        this.cartService.clearCart().subscribe(() => {
          this.checkoutService.clearCheckoutData();
          this.router.navigate(['/checkout/confirmation']);
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
        this.isProcessing = false;
      }
    });
  }
}