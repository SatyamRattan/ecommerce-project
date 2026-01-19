import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../services/api'; // Service for making API calls
import { Router } from '@angular/router'; // Router for navigation

@Component({
  selector: 'app-categories', // Component tag name
  standalone: true, // Standalone component (no NgModule required)
  imports: [CommonModule], // Import Angular common directives like *ngFor, *ngIf
  templateUrl: './categories.html', // HTML template file
  styleUrl: './categories.css' // CSS file for styling
})
export class Categories {

  categories: any[] = []; // Array to store the list of categories fetched from API
  isLoading: boolean = false; // Loading flag to show a loader while fetching categories

  constructor(private api: Api, private router: Router) { } // Inject API service and Router

  ngOnInit() {
    this.isLoading = true; // Set loader true while fetching data
    console.log('Fetching categories...');

    // Call API to fetch all categories
    this.api.getCategories().subscribe({
      next: (res: any) => {
        console.log('Categories received:', res);
        this.categories = res; // Save the API response to categories array
        this.isLoading = false; // Disable loader after data is fetched
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err); // Log error for debugging
        this.isLoading = false; // Disable loader if error occurs
        if (typeof alert !== 'undefined') {
          alert('Failed to load categories.'); // Alert user if API fails
        }
      }
    });
  }

  // Navigate to Products page and filter by category using query params
  openCategory(id: number) {
    this.router.navigate(['/products'], { queryParams: { category: id } });
  }
}




// Key Points:

// isLoading controls UI loader to avoid showing empty content.

// categories: any[] stores data fetched from backend.

// ngOnInit() runs once the component is initialized to fetch categories.

// openCategory(id) demonstrates router navigation with query parameters.

// API errors are logged and notified to the user using alert.

// Standalone component removes the need for a module declaration in NgModule.