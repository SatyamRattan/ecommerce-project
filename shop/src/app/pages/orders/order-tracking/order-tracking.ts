// Core Angular lifecycle interfaces and decorators
import { Component, OnInit, OnDestroy } from '@angular/core';

// CommonModule provides common directives like *ngIf, *ngFor
import { CommonModule } from '@angular/common';

// ActivatedRoute is used to read route parameters (order ID)
// RouterLink is used for navigation links in the template
import { ActivatedRoute, RouterLink } from '@angular/router';

// Orders service handles API calls related to orders
import { Orders } from '../../../services/orders';

// Auth service manages authentication state (used implicitly here)
import { Auth } from '../../../services/auth';

// RxJS utilities for polling and subscription management
import { interval, Subscription, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-order-tracking',

  // Standalone component (Angular 15+), no NgModule required
  standalone: true,

  // Modules and directives used in this component’s template
  imports: [CommonModule, RouterLink],

  // External HTML and CSS files
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css',
})
export class OrderTracking implements OnInit, OnDestroy {

  /**
   * Holds the order details returned from the backend
   */
  order: any = null;

  /**
   * Controls loading spinner / UI state
   */
  loading = true;

  /**
   * Stores user-friendly error messages
   */
  errorMessage = '';

  /**
   * Order ID extracted from route parameters
   */
  orderId: number = 0;

  /**
   * Subscription reference for polling
   * Needed to properly unsubscribe on destroy
   */
  private pollingSubscription?: Subscription;

  /**
   * Inject required services
   */
  constructor(
    private ordersService: Orders,
    private auth: Auth,
    private route: ActivatedRoute
  ) { }

  /**
   * Lifecycle hook runs when component initializes
   * Reads order ID from URL and starts polling
   */
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = +params['id']; // Convert string to number
      this.startPolling();
    });
  }

  /**
   * Lifecycle hook runs when component is destroyed
   * Ensures polling stops to avoid memory leaks
   */
  ngOnDestroy() {
    this.stopPolling();
  }

  /**
   * Starts polling the backend every 15 seconds
   * Immediately fires once using startWith(0)
   */
  startPolling() {
    this.pollingSubscription = interval(15000)
      .pipe(
        startWith(0), // Trigger immediately on start
        switchMap(() => this.ordersService.getOrderById(this.orderId))
      )
      .subscribe({
        next: (data) => {
          console.log('[Order Tracking] Polled data:', data);
          this.order = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error polling order:', err);

          // Show error only if no previous data exists
          if (!this.order) {
            const detail =
              err.error?.detail ||
              err.error?.message ||
              err.message ||
              'Unknown error';

            this.errorMessage = 'Failed to load order details: ' + detail;
            this.loading = false;
          }
        }
      });
  }

  /**
   * Stops polling by unsubscribing
   * Prevents background API calls
   */
  stopPolling() {
    this.pollingSubscription?.unsubscribe();
  }

  /**
   * Manually loads the order once (without polling)
   * Useful for refresh buttons or fallback
   */
  loadOrder() {
    this.loading = true;

    this.ordersService.getOrderById(this.orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);

        const detail =
          err.error?.detail ||
          err.error?.message ||
          err.message ||
          'Unknown error';

        this.errorMessage = 'Failed to load order details: ' + detail;
        this.loading = false;
      }
    });
  }

  /**
   * Maps order status to CSS class names
   * Used for visual status indicators
   */
  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };

    return statusMap[status?.toLowerCase()] || 'status-default';
  }

  /**
   * Converts order status into progress percentage
   * Used for progress bars or trackers
   */
  getProgressPercentage(status: string): number {
    const progressMap: any = {
      'pending': 25,
      'processing': 50,
      'shipped': 75,
      'delivered': 100,
      'cancelled': 0
    };

    return progressMap[status?.toLowerCase()] || 0;
  }
}
