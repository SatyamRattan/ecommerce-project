import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Orders } from '../../../services/orders';
import { Auth } from '../../../services/auth';
import { interval, Subscription, startWith, switchMap, forkJoin, catchError, of, tap, Subject, takeUntil, map } from 'rxjs';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css',
})
export class OrderTracking implements OnInit, OnDestroy {

  order: any = null;
  loading = true;
  errorMessage = '';
  orderId: number = 0;

  history: any[] = [];
  stepTimestamps: { [key: string]: string } = {};

  private destroy$ = new Subject<void>();

  readonly steps = ['pending', 'processing', 'shipped', 'delivered'];

  constructor(
    private ordersService: Orders,
    private auth: Auth,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];

      if (isPlatformBrowser(this.platformId)) {
        this.loadOrderData();  // initial fetch
        setTimeout(() => {
          this.startPolling(); // delayed polling
        }, 5000);   // wait for hydration to finish
      }
    });
  }

  /**
   * Performs the initial data load for the order and its status history.
   * This happens immediately after hydration to prevent an infinite loading state.
   */
  loadOrderData() {
    this.loading = true;

    this.ordersService.getOrderById(this.orderId).pipe(
      switchMap(orderData =>
        this.ordersService.getOrderHistory(this.orderId).pipe(
          catchError(() => of({ status_history: [] })),
          map((historyData: any) => ({ orderData, historyData }))
        )
      ),
      catchError(err => {
        console.error("Initial load failed", err);
        this.errorMessage = "Failed to load order.";
        this.loading = false;
        return of(null);
      })
    ).subscribe((response: any) => {
      if (!response) return;

      this.order = response.orderData;
      this.history = response.historyData?.status_history || [];

      this.processTimestamps(this.history);
      this.loading = false;

      console.log("Initial order loaded:", this.order);
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  startPolling() {
    console.log(`[OrderTracking] Starting polling for Order #${this.orderId}`);

    // HYDRATION FIX: Run polling outside Angular's zone.
    // Interval timers inside Angular zone prevent the app from reaching a "stable" state,
    // which causes hydration to fail (NG0506).
    this.ngZone.runOutsideAngular(() => {
      interval(15000)
        .pipe(
          startWith(0),
          takeUntil(this.destroy$), // Stop polling when component is destroyed
          switchMap((i) =>
            this.ordersService.getOrderById(this.orderId).pipe(
              switchMap(orderData =>
                this.ordersService.getOrderHistory(this.orderId).pipe(
                  catchError(() => of({ status_history: [] })),
                  map((historyData: any) => ({ orderData, historyData }))
                )
              ),
              catchError(err => {
                console.error("Order fetch failed", err);
                return of(null);
              })
            )
          )
        )
        .subscribe({
          next: (response: any) => {
            // Re-enter Angular zone to update UI
            this.ngZone.run(() => {
              if (!response) return;

              console.log("Order API:", response.orderData);
              console.log("History API:", response.historyData);

              this.order = response.orderData;
              this.history = response.historyData?.status_history || [];

              if (this.order && !this.order.status) {
                this.order.status = 'pending';
              }

              this.processTimestamps(this.history);
              this.loading = false;
            });
          },
          error: (err) => {
            this.ngZone.run(() => {
              console.error('Error polling order:', err);
              if (!this.order) {
                this.errorMessage = 'Failed to load order. ' + (err.error?.detail || err.message);
                this.loading = false;
              }
            });
          }
        });
    });
  }

  // Removed direct stopPolling() method as takeUntil handles it via ngOnDestroy

  processTimestamps(history: any[]) {
    this.stepTimestamps = {};
    if (!history) return;

    history.forEach((h: any) => {
      const statusKey = h.status?.toLowerCase();
      if (statusKey) {
        this.stepTimestamps[statusKey] = h.changed_at;
      }
    });
  }

  // --- Helper Methods ---

  get items(): any[] {
    if (!this.order) return [];

    // Normalize items: prioritize order.items array, then order as single item
    let list: any[] = [];
    if (this.order.items && Array.isArray(this.order.items)) {
      list = this.order.items;
    } else if (this.order.product_id || this.order.product_name || this.order.price) {
      list = [this.order];
    }

    return list.map(item => {
      const variant = item.variant;
      const baseName = item.product?.name || variant?.product?.name || item.product_name || `Product #${item.product_id || item.product}`;
      const variantSuffix = variant?.color ? ` (${variant.color})` : '';

      return {
        ...item,
        display_name: `${baseName}${variantSuffix}`,
        display_image: variant?.image || item.product?.image_url || 'assets/images/placeholder.jpg'
      };
    });
  }

  // Derived from history, or 'pending' fallback
  get currentStatus(): string {
    if (this.history && this.history.length > 0) {
      // Sort history to find the latest status
      // Cloning array to avoid mutating original source
      const sorted = [...this.history].sort((a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
      );
      return sorted[0].status || 'pending';
    }
    return 'pending';
  }

  get currentStepIndex(): number {
    const status = this.currentStatus.toLowerCase();
    if (status === 'cancelled') return -1;
    return this.steps.indexOf(status);
  }

  isStepActive(stepIndex: number): boolean {
    if (this.currentStepIndex === -1) return false;
    return this.currentStepIndex >= stepIndex;
  }

  getBadgeClass(status: string): string {
    const map: any = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return map[status?.toLowerCase()] || 'status-default';
  }

  getStatusClass(status: string): string {
    return this.getBadgeClass(status);
  }

  getProgressWidth(): number {
    const index = this.currentStepIndex;
    if (index === -1) return 0;
    const widths = [0, 33, 66, 100];
    return widths[index] || 0;
  }

  get subtotal(): number {
    if (!this.order) return 0;

    // Use backend-provided subtotal if available
    if (this.order.subtotal) return Number(this.order.subtotal);

    const items = this.items;
    if (items.length > 0) {
      return items.reduce((total, item) => {
        // Securely use item.price, as requested
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        return total + (price * qty);
      }, 0);
    }

    return 0;
  }
}
