import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation implements OnInit {
  order: any = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras.state?.['order'];
  }

  ngOnInit() {
    console.log('[OrderConfirmation] Displaying Summary for:', this.order);
  }

  get items(): any[] {
    if (!this.order?.items) return [];

    return this.order.items.map((item: any) => {
      const variant = item.variant;
      const baseName = variant?.product?.name || item.product?.name || `Product #${item.product}`;
      const variantSuffix = variant?.color ? ` (${variant.color})` : '';

      return {
        ...item,
        display_name: `${baseName}${variantSuffix}`,
        display_image: variant?.image || item.product?.image_url || 'assets/images/placeholder.jpg'
      };
    });
  }
}
