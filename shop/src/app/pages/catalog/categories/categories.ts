import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../services/api'; // Service for making API calls
import { Router, RouterLink } from '@angular/router'; // Router for navigation
import { trigger, state, style, transition, animate } from '@angular/animations';

import { FormsModule } from '@angular/forms';
import { CarouselComponent } from '../../../shared/components/carousel/carousel';

@Component({
  selector: 'app-categories', // Component tag name
  standalone: true, // Standalone component (no NgModule required)
  imports: [CommonModule, RouterLink, FormsModule, CarouselComponent], // Import Angular common directives, RouterLink, and FormsModule
  templateUrl: './categories.html', // HTML template file
  styleUrl: './categories.css', // CSS file for styling
  animations: [
    // Slide-down animation for subcategories
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: '0', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '*', opacity: '1' }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: '1', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '0', opacity: '0' }))
      ])
    ])
  ]
})
export class Categories {

  categories: any[] = []; // Array to store the list of categories fetched from API
  isLoading: boolean = false; // Loading flag to show a loader while fetching categories

  // Hero Banners for the Carousel
  heroBanners: string[] = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200', // Retail Store
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200', // Modern Watch
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200', // Laptop / Workspace
  ];

  // Track which parent category is currently expanded (ID of expanded category, or null if none)
  expandedCategoryId: number | null = null;

  // Array to store featured products for the home page
  featuredProducts: any[] = [];

  // Static list of trust badges for the home page
  trustBadges = [
    { icon: '🚚', title: 'Free Shipping', desc: 'On orders over ₹100' },
    { icon: '🛡️', title: 'Secure Payment', desc: '100% protected' },
    { icon: '🔄', title: 'Easy Returns', desc: '7 days return' },
    { icon: '🎧', title: '24/7 Support', desc: 'Dedicated team' }
  ];

  // Static list of testimonials for the home page
  testimonials = [
    { name: 'Rahul Sharma', role: 'Verified Buyer', content: 'The quality of the Zara shirt I ordered is exceptional. Fast shipping too!', rating: 5 },
    { name: 'Priya Patel', role: 'Fashion Enthusiast', content: 'PepeJeans never disappoints. The fit is perfect and the 7-day return policy is great.', rating: 5 },
    { name: 'Amit Verma', role: 'Regular Customer', content: 'Best place for authentic brands. Highly recommended!', rating: 4 }
  ];

  // Property for newsletter email binding
  newsletterEmail: string = '';

  constructor(private api: Api, private router: Router, private cdr: ChangeDetectorRef) { } // Inject API service and Router

  ngOnInit() {
    console.log('Fetching categories...');
    console.log("Categories component initialized");
    this.api.getCategories().subscribe({
      next: (res: any) => {
        console.log('Categories received:', res);
        this.categories = res; // Save the API response to categories array
        this.isLoading = false; // Disable loader after data is fetched
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err); // Log error for debugging
        this.isLoading = false; // Disable loader if error occurs
        if (typeof alert !== 'undefined') {
          alert('Failed to load categories.'); // Alert user if API fails
        }
      }
    });

    // Fetch products to pick featured ones
    this.api.getProducts().subscribe({
      next: (res: any) => {
        const allProducts = res.results || res;
        // Filter: Only in-stock and available products
        const inStockProducts = allProducts.filter((p: any) => p.is_available && p.stock > 0);

        // Custom Priority: Find specific products requested by user
        const prioritized = inStockProducts.filter((p: any) =>
          p.name.toLowerCase().includes('pepejeans') ||
          p.name.toLowerCase().includes('zara') ||
          p.name.toLowerCase().includes('samsung s23') ||
          p.name.toLowerCase().includes('prestige pan')
        );

        // Others: Products that aren't the prioritized ones and NOT the ones to be replaced
        const others = inStockProducts.filter((p: any) =>
          !p.name.toLowerCase().includes('pepejeans') &&
          !p.name.toLowerCase().includes('zara') &&
          !p.name.toLowerCase().includes('samsung s23') &&
          !p.name.toLowerCase().includes('prestige pan') &&
          !p.name.toLowerCase().includes('juicer mixer grinder') &&
          !p.name.toLowerCase().includes('water purifier')
        );

        // Combine: Prioritized items first, then fill up to 4 with others
        this.featuredProducts = [...prioritized, ...others].slice(0, 4).map((p: any) => ({
          ...p,
          price: p.discount_price || p.base_price,
          image_url: p.media?.[0]?.file || p.image_url
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching featured products:', err)
    });
  }

  /**
   * Get only parent categories (categories where parent == null)
   * These are displayed by default in the accordion
   */
  getParentCategories(): any[] {
    return this.categories.filter(cat => cat.parent === null || cat.parent === undefined);
  }

  /**
   * Get subcategories for a specific parent category
   * @param parentId - ID of the parent category
   */
  getSubcategories(parentId: number): any[] {
    return this.categories.filter(cat => cat.parent === parentId);
  }

  /**
   * Check if a category has subcategories
   * @param categoryId - ID of the category to check
   */
  hasSubcategories(categoryId: number): boolean {
    return this.categories.some(cat => cat.parent === categoryId);
  }

  /**
   * Toggle expansion of a parent category's subcategories
   * @param category - The category object being clicked
   */
  toggleCategory(event: Event, category: any) {
    event.stopPropagation(); // Prevent event bubbling

    // Check if this category has subcategories
    if (this.hasSubcategories(category.id)) {
      // Toggle expansion: if already expanded, collapse it; otherwise expand it
      if (this.expandedCategoryId === category.id) {
        this.expandedCategoryId = null; // Collapse
      } else {
        this.expandedCategoryId = category.id; // Expand this category
      }
    } else {
      // No subcategories, navigate directly
      this.openCategory(category.id);
    }
  }

  /**
   * Check if a specific category is currently expanded
   * @param categoryId - ID of the category
   */
  isExpanded(categoryId: number): boolean {
    return this.expandedCategoryId === categoryId;
  }

  // Navigate to Products page and filter by category using query params
  openCategory(id: number) {
    this.router.navigate(['/products'], { queryParams: { category: id } });
  }

  // Handle newsletter subscription
  subscribeNewsletter() {
    if (this.newsletterEmail && this.newsletterEmail.includes('@')) {
      if (typeof alert !== 'undefined') {
        alert('Thank you for subscribing! You will receive our latest updates soon.');
      }
      this.newsletterEmail = ''; // Clear input
    } else {
      if (typeof alert !== 'undefined') {
        alert('Please enter a valid email address.');
      }
    }
  }
}




// Key Points:

// isLoading controls UI loader to avoid showing empty content.

// categories: any[] stores data fetched from backend.

// ngOnInit() runs once the component is initialized to fetch categories.

// openCategory(id) demonstrates router navigation with query parameters.

// API errors are logged and notified to the user using alert.

// Standalone component removes the need for a module declaration in NgModule.