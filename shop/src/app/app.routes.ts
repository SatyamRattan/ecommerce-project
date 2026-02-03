// Import Angular's Routes type
// Routes is simply an array of route definitions
import { Routes } from '@angular/router';

/* =======================
   AUTH PAGES
   ======================= */

// Login page component
import { Login } from './pages/auth/login/login';

// User registration page component
import { Register } from './pages/auth/register/register';

// User profile page (requires authentication logically)
import { Profile } from './pages/auth/profile/profile';

/* =======================
   CATALOG / SHOP PAGES
   ======================= */

// Categories listing page
import { Categories } from './pages/catalog/categories/categories';

// Products listing page
import { Products } from './pages/catalog/products/products';

// Single product detail page (uses route param :id)
import { ProductDetails } from './pages/catalog/product-details/product-details';

// Wishlist page (user-specific items)
import { Wishlist } from './pages/catalog/wishlist/wishlist';

/* =======================
   CART
   ======================= */

// Shopping cart page
import { Cart } from './pages/cart/cart/cart';

/* =======================
   CHECKOUT FLOW
   ======================= */

// Step 1: Shipping address page
import { Address } from './pages/checkout/address/address';

// Step 2: Payment page
import { Payment } from './pages/checkout/payment/payment';

// Step 3: Order confirmation page
import { OrderConfirmation } from './pages/checkout/order-confirmation/order-confirmation';

/* =======================
   ORDERS
   ======================= */

// List of user's orders
import { MyOrders } from './pages/orders/my-orders/my-orders';

// Order tracking page (dynamic order ID)
import { OrderTracking } from './pages/orders/order-tracking/order-tracking';

/* =======================
   MISC / STATIC PAGES
   ======================= */

// Contact / support page
import { ContactUs } from './pages/contact/contact-us/contact-us';

// Admin: Contact Inbox dashboard
import { ContactInbox } from './pages/admin/contact-inbox/contact-inbox';

// About Us page
import { About } from './pages/about/about';

/**
 * Application route configuration
 */
export const routes: Routes = [

   /**
    * Default route
    * When user opens `/`, redirect them to `/categories`
    * pathMatch: 'full' ensures exact match of empty path
    */
   { path: '', redirectTo: 'categories', pathMatch: 'full' },

   /* ========= AUTH ROUTES ========= */

   // Login page
   { path: 'login', component: Login },

   // Register page
   { path: 'register', component: Register },

   // Profile page (should ideally be protected by Auth Guard)
   { path: 'profile', component: Profile },

   /* ========= SHOP ROUTES ========= */

   // Categories listing
   { path: 'categories', component: Categories },

   // Products listing
   { path: 'products', component: Products },

   /**
    * Product details page
    * `:id` is a dynamic route parameter
    * Example: /product/12
    */
   { path: 'product/:id', component: ProductDetails },

   // Wishlist page
   { path: 'wishlist', component: Wishlist },

   /* ========= CART ========= */

   // Shopping cart page
   { path: 'cart', component: Cart },

   /* ========= CHECKOUT FLOW ========= */

   // Checkout step 1: Address
   { path: 'checkout/address', component: Address },

   // Checkout step 2: Payment
   { path: 'checkout/payment', component: Payment },

   // Checkout step 3: Confirmation
   { path: 'checkout/confirmation', component: OrderConfirmation },

   /* ========= ORDERS ========= */

   // View all orders
   { path: 'orders', component: MyOrders },

   /**
    * Track a specific order
    * Dynamic order ID
    * Example: /orders/track/101
    */
   { path: 'orders/track/:id', component: OrderTracking },

   /* ========= SUPPORT ========= */

   // Contact / help page
   { path: 'contact', component: ContactUs },

   // Admin: Contact Inbox
   { path: 'admin/contact-messages', component: ContactInbox },

   // About Us page
   { path: 'about', component: About },
];
