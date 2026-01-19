import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// FormBuilder helps create reactive forms easily
// FormGroup represents the entire form
// ReactiveFormsModule is needed for reactive forms in template
// Validators provides built-in validation functions
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// CheckoutService is used to save and retrieve shipping address
import { CheckoutService } from '../../../services/checkout';

@Component({
  selector: 'app-address', // Component selector used in templates
  standalone: true, // Standalone component, doesn't require NgModule
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Required modules for template
  templateUrl: './address.html', // Template file for HTML
  styleUrl: './address.css', // CSS file for styling
})
export class Address implements OnInit {
  // FormGroup object representing the shipping address form
  addressForm: FormGroup;

  constructor(
    private fb: FormBuilder, // FormBuilder service for creating the form
    private checkoutService: CheckoutService, // Service to store shipping address
    private router: Router // Router service to navigate to next page
  ) {
    // Initialize the reactive form with controls and validators
    this.addressForm = this.fb.group({
      address: ['', [Validators.required, Validators.minLength(10)]], // Address: required, min length 10
      city: ['', Validators.required], // City: required
      state: ['', Validators.required], // State: required
      country: ['India', Validators.required], // Country: default 'India', required
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]] // Pincode: required, must be 6 digits
    });
  }

  // Lifecycle hook, runs after component initialization
  ngOnInit() {
    // Get previously saved address from service
    const savedAddress = this.checkoutService.getShippingAddress();
    if (savedAddress) {
      // Populate the form with saved data
      this.addressForm.patchValue(savedAddress);
    }
  }

  // Called when user submits the form
  onSubmit() {
    if (this.addressForm.valid) {
      // Save the form value into CheckoutService
      this.checkoutService.setShippingAddress(this.addressForm.value);
      // Navigate to payment page after saving address
      this.router.navigate(['/checkout/payment']);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.addressForm);
    }
  }

  // Recursively mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched(); // Mark this control as touched
      // If the control is a nested FormGroup, recurse
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}



// Explanation Highlights:

// Uses Reactive Forms for full control over validation and state.

// Validators ensure proper data before moving to payment.

// CheckoutService stores the shipping address so it can be used in checkout/payment.

// The markFormGroupTouched method ensures that all validation messages show if the user tries to submit an invalid form.

// Navigates reactively to /checkout/payment only when the form is valid.