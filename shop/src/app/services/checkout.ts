// Injectable decorator allows this class to be injected as a service
import { Injectable } from '@angular/core';

/**
 * Interface defining the structure of a shipping address
 * This ensures type safety across the application
 */
export interface ShippingAddress {
    address: string;   // Street / house / locality
    city: string;      // City name
    state: string;     // State name
    country: string;   // Country (default: India)
    pincode: string;   // 6-digit postal code
}

@Injectable({
    // Makes this service a singleton and available app-wide
    providedIn: 'root'
})
export class CheckoutService {

    /**
     * Holds the shipping address in memory
     * This is used for fast access during checkout steps
     */
    private shippingAddress: ShippingAddress | null = null;

    /**
     * Saves the shipping address
     * - Stores it in memory
     * - Persists it in localStorage for page refresh / navigation safety
     *
     * @param address - ShippingAddress object from address form
     */
    setShippingAddress(address: ShippingAddress) {

        // Store address in memory (runtime use)
        this.shippingAddress = address;

        // Ensure localStorage is available (important for SSR safety)
        if (typeof localStorage !== 'undefined') {

            // Persist address so checkout survives page refresh
            localStorage.setItem(
                'checkout_address',
                JSON.stringify(address)
            );
        }
    }

    /**
     * Retrieves the saved shipping address
     *
     * Priority:
     * 1. Memory (fastest)
     * 2. localStorage (fallback)
     *
     * @returns ShippingAddress or null if not found
     */
    getShippingAddress(): ShippingAddress | null {

        // If address not in memory, try loading from localStorage
        if (!this.shippingAddress && typeof localStorage !== 'undefined') {

            // Read stored address string
            const saved = localStorage.getItem('checkout_address');

            // If data exists, parse and cache it
            if (saved) {
                this.shippingAddress = JSON.parse(saved);
            }
        }

        // Return cached or retrieved address
        return this.shippingAddress;
    }

    /**
     * Clears all checkout-related data
     * Called after successful order placement or logout
     */
    clearCheckoutData() {

        // Clear in-memory address
        this.shippingAddress = null;

        // Remove persisted data from localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('checkout_address');
        }
    }
}


// Why This Service Is Designed Correctly
// ✅ Memory + localStorage combo

// Fast access during checkout

// Safe across refreshes

// No unnecessary API calls

// ✅ Why this is NOT tied to backend

// Checkout address is temporary

// Backend gets it only when order is placed

// Cleaner separation of concerns

// ✅ Where this service is used

// Address page → setShippingAddress()

// Payment page → getShippingAddress()

// After order → clearCheckoutData()