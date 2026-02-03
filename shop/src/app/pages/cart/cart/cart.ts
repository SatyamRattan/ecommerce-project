import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cart as CartService } from '../../../services/cart';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {

  cartItems$!: Observable<any[]>;
  total$!: Observable<number>;
  loading = true;
  errorMessage = '';

  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.cartItems$ = this.cartService.cartItems$.pipe(
      tap(() => this.loading = false)
    );

    // Calculate total reactively
    this.total$ = this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => {
        // Securely use backend-provided price
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0))
    );

    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    if (this.cartService.isAuthenticated()) {
      this.cartService.refreshCart();
    } else {
      // For guest cart, it's already in the BehaviorSubject from initCart()
      setTimeout(() => this.loading = false, 300);
    }
  }

  updateQuantity(item: any, quantity: number) {
    if (quantity < 1) return;
    const id = this.cartService.isAuthenticated()
      ? item.id
      : (item.product?.id || item.product);
    const variant_id = item.variant?.id || item.variant_id;
    this.cartService.updateCartItem(id, quantity, variant_id).subscribe();
  }

  removeItem(item: any) {
    if (confirm('Remove this item from cart?')) {
      const id = this.cartService.isAuthenticated()
        ? item.id
        : (item.product?.id || item.product);
      const variant_id = item.variant?.id || item.variant_id;
      this.cartService.removeFromCart(id, variant_id).subscribe();
    }
  }

  clearCart() {
    if (confirm('Clear entire cart?')) {
      this.cartService.clearCart().subscribe();
    }
  }
}
