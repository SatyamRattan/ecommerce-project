import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { RouterLink } from '@angular/router';
import { Orders } from '../../../services/orders';
import { Auth } from '../../../services/auth';
import { Observable, map, of, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnInit {

  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  loading = true;
  errorMessage = '';

  constructor(
    private ordersService: Orders,
    private auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    // HYDRATION FIX: Prevent API calls during SSR.
    if (isPlatformBrowser(this.platformId)) {
      this.refreshOrders();
    }
  }

  refreshOrders() {
    this.loading = true;
    this.errorMessage = '';

    this.ordersService.getOrders().subscribe({
      next: (data: any) => {
        let list = data.results || data || [];

        // Normalize each order
        list = list.map((order: any) => {
          // Normalize items
          let items = (order.items || []).map((item: any) => {
            const variant = item.variant;
            // Prefer variant's nested product name, then item.product_name, then product object name
            const baseName = item.product?.name || variant?.product?.name || item.product_name || `Product #${item.product_id || item.product}`;
            const variantSuffix = variant?.color ? ` (${variant.color})` : '';

            return {
              ...item,
              display_name: `${baseName}${variantSuffix}`,
              // Use variant image if available
              display_image: variant?.image || item.product?.image_url || 'assets/images/placeholder.jpg'
            };
          });

          // Fallback for flat order structures (if any)
          if (items.length === 0 && (order.product_id || order.product_name || order.price)) {
            items = [{
              ...order,
              product_name: order.product_name || order.product?.name || `Product #${order.product_id || order.product}`
            }];
          }

          return {
            ...order,
            items: items,
            // Prioritize total_amount as the primary backend field
            total_price: order.total_amount || order.total_price || order.total || 0,
            // Ensure status exists
            status: order.status || 'pending'
          };
        });

        this.ordersSubject.next(list);
        this.loading = false;
      },
      error: (err) => {
        console.error('[MyOrders] Load failed:', err);
        this.errorMessage = 'Failed to load orders. Please try again later.';
        this.loading = false;
        this.ordersSubject.next([]);
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending', // Yellow
      'processing': 'status-processing', // Blue
      'shipped': 'status-shipped',   // Light Blue
      'delivered': 'status-delivered', // Green
      'cancelled': 'status-cancelled' // Red
    };
    return statusMap[status?.toLowerCase()] || 'status-default';
  }

  cancelOrder(orderId: number) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.ordersService.cancelOrder(orderId).subscribe({
        next: () => {
          this.refreshOrders();
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          if (typeof alert !== 'undefined') {
            alert('Failed to cancel order');
          }
        }
      });
    }
  }
}


// Key Points / Best Practices Highlighted:

// Lifecycle Hook Usage: ngOnInit() is used to fetch data immediately after component init.

// Error Handling: API errors are logged and shown to user.

// Conditional UI States: loading and errorMessage for reactive template updates.

// Status Mapping: getStatusClass() decouples CSS from logic → easy maintenance.

// Confirmation Prompt: Safe UX before cancelling an order.

// Dependency Injection: Orders and Auth injected via Angular DI.

// Reactive Updates: Reload orders after cancellation → consistent UI.