import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Wishlist as WishlistService } from '../../../services/wishlist';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {

  wishlistItems$!: Observable<any[]>;
  loading = true;

  constructor(private wishlistService: WishlistService) { }


  ngOnInit() {
    this.wishlistItems$ = this.wishlistService.getWishlist();
  }

  removeItem(id: number) {
    this.wishlistService.removeFromWishlist(id).subscribe(() => {
      this.wishlistItems$ = this.wishlistService.getWishlist();
    });
  }
}
