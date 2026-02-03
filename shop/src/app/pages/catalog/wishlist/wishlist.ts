import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Wishlist as WishlistService } from '../../../services/wishlist';
import { Observable } from 'rxjs';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {

  wishlistItems$!: Observable<{ id: number; product: Product }[]>; // updated type
  loading = true;

  constructor(private wishlistService: WishlistService) { }

  ngOnInit() {
    this.wishlistItems$ = this.wishlistService.getWishlist(); // no subscribe
  }

  removeItem(id: number) {
    if (confirm('Are you sure you want to remove this item?')) {
      this.wishlistService.removeFromWishlist(id).subscribe(() => {
        this.wishlistItems$ = this.wishlistService.getWishlist(); // refresh stream
      });
    }
  }
}
