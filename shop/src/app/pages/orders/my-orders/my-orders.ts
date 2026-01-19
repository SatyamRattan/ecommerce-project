import { Component, OnInit } from '@angular/core'; 
// Component decorator & lifecycle hook OnInit

import { CommonModule } from '@angular/common'; 
// CommonModule provides Angular directives like ngIf, ngFor

import { RouterLink } from '@angular/router'; 
// RouterLink allows navigation via <a [routerLink]=""> links

import { Orders } from '../../../services/orders'; 
// Service to interact with backend for fetching/managing orders

import { Auth } from '../../../services/auth'; 
// Auth service for user info / authentication checks

@Component({
  selector: 'app-my-orders', 
  // Component selector, used in HTML as <app-my-orders>

  standalone: true, 
  // Standalone component (Angular 14+), no need for NgModule

  imports: [CommonModule, RouterLink], 
  // Modules/directives used in template

  templateUrl: './my-orders.html', 
  // HTML template file

  styleUrl: './my-orders.css', 
  // CSS file for this component
})
export class MyOrders implements OnInit {
  orders: any[] = []; 
  // Holds the list of orders fetched from backend

  loading = true; 
  // Loading state for spinner / UI feedback

  errorMessage = ''; 
  // Holds error messages to display in template

  constructor(private ordersService: Orders, private auth: Auth) { } 
  // Inject Orders & Auth services via Angular DI

  ngOnInit() {
    // Lifecycle hook called after component init
    this.loadOrders(); 
    // Load orders on component init
  }

  loadOrders() {
    this.loading = true; 
    // Show loading spinner
    console.log('Fetching orders...');
    
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        // Successful API call
        console.log('Orders data received:', data);

        // Backend may return paginated { results: [...] } or raw array
        this.orders = data.results || data || [];

        this.loading = false; 
        // Stop spinner after data received
      },
      error: (err) => {
        // Handle API errors
        console.error('Error loading orders:', err);

        // Extract meaningful error message if available
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.errorMessage = 'Failed to load orders: ' + detail;

        this.loading = false; 
        // Stop spinner
      }
    });
  }

  getStatusClass(status: string): string {
    // Map order status to CSS classes for colored badges
    const statusMap: any = {
      'pending': 'status-pending',      // Yellow
      'processing': 'status-processing',// Blue
      'shipped': 'status-shipped',      // Light Blue
      'delivered': 'status-delivered',  // Green
      'cancelled': 'status-cancelled'   // Red
    };
    // Default CSS if unknown status
    return statusMap[status?.toLowerCase()] || 'status-default';
  }

  cancelOrder(orderId: number) {
    // Ask user for confirmation before cancelling
    if (typeof confirm !== 'undefined' && confirm('Are you sure you want to cancel this order?')) {
      this.ordersService.cancelOrder(orderId).subscribe({
        next: () => {
          // Refresh orders after successful cancellation
          this.loadOrders();
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