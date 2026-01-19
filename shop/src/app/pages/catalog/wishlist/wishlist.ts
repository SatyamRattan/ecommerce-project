import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 
import { Wishlist as WishlistService } from '../../../services/wishlist'; // Import wishlist service

@Component({
  selector: 'app-wishlist', // Component selector used in templates
  standalone: true, // Standalone component (no NgModule needed)
  imports: [CommonModule, RouterLink], // Modules used inside this component
  templateUrl: './wishlist.html', // Template file
  styleUrl: './wishlist.css', // Stylesheet file
})
export class Wishlist implements OnInit {
  wishlistItems: any[] = []; // Array to store wishlist items
  loading = true; // Loading state to show spinner or loading message

  constructor(private wishlistService: WishlistService) { } // Inject Wishlist service

  ngOnInit() {
    // Lifecycle hook: called once component initializes
    this.loadWishlist(); // Load wishlist items when component loads
  }

  loadWishlist() {
    // Method to fetch wishlist items from backend
    this.loading = true; // Set loading state to true
    console.log('Fetching wishlist items...');

    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        // Called when API returns successfully
        console.log('Wishlist data received:', data);
        this.wishlistItems = data; // Assign fetched data to component variable
        this.loading = false; // Turn off loading state
      },
      error: (err) => {
        // Called if API call fails
        console.error('Error fetching wishlist:', err);
        this.loading = false; // Turn off loading state

        // Optional alert to notify user
        if (typeof alert !== 'undefined') {
          alert('Error loading wishlist. Check console for details.');
        }
      }
    });
  }

  removeItem(id: number) {
    // Method to remove an item from the wishlist
    if (typeof confirm !== 'undefined' && confirm('Are you sure you want to remove this item?')) {
      // Ask user for confirmation
      this.wishlistService.removeFromWishlist(id).subscribe({
        next: () => {
          // On success, reload wishlist to update view
          this.loadWishlist();
        },
        error: (err) => console.error('Error removing item', err) // Log error if removal fails
      });
    }
  }
}


// Explanation of Angular Features and Practices Used

// standalone: true → Component doesn’t need to be declared in an NgModule.

// imports: [CommonModule, RouterLink] → Enables common directives like *ngIf and [routerLink].

// Reactive Subscription → wishlistService.getWishlist().subscribe(...) is used to fetch data asynchronously.

// Error Handling → Both next and error callbacks handle success and failure of API requests.

// User Confirmation → Uses confirm() before deleting an item to prevent accidental removals.

// Loading State → loading variable allows the UI to display a loading message or spinner while waiting for API.