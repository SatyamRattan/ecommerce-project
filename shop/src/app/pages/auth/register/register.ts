import { Component } from '@angular/core'; 
// Importing Component decorator to define an Angular component

import { Router, RouterLink } from '@angular/router'; 
// Router allows programmatic navigation
// RouterLink allows using [routerLink] in templates

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
// ReactiveFormsModule is required to use reactive forms
// FormBuilder helps quickly create form groups and controls
// FormGroup represents a group of form controls
// Validators provide built-in validation rules (required, minLength, email, etc.)

import { Auth } from '../../../services/auth'; 
// Importing custom Auth service to handle user registration

import { CommonModule } from '@angular/common'; 
// CommonModule provides common Angular directives (ngIf, ngFor, etc.)

@Component({
  selector: 'app-register', 
  // This is the HTML tag used to embed this component: <app-register></app-register>

  standalone: true, 
  // Marks this component as standalone (does not need to be declared in a module)

  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  // Importing Angular modules and directives used in the component template

  templateUrl: './register.html', 
  // External HTML template for this component

  styleUrl: './register.css', 
  // External CSS file for styling this component
})
export class Register {
  registerForm: FormGroup; 
  // A FormGroup object representing the registration form and its controls

  errorMessage: string = ''; 
  // String to store error messages from backend/API to show to the user

  constructor(
    private fb: FormBuilder, 
    // Inject FormBuilder to easily create form controls and groups

    private auth: Auth, 
    // Inject Auth service for making API calls to register the user

    private router: Router 
    // Inject Router to programmatically navigate after registration
  ) {
    // Initialize the reactive form using FormBuilder
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      // Email form control: default empty, required, must match email pattern

      password: ['', [Validators.required, Validators.minLength(6)]], 
      // Password form control: default empty, required, minimum 6 characters

      name: ['', Validators.required], 
      // Name form control: required

      phone: [''], 
      // Phone form control: optional, default empty

      gender: ['OTHER'], 
      // Gender form control: default value is 'OTHER'

      dob: [''], 
      // Date of Birth form control: optional

      address: [''] 
      // Address form control: optional
    });
  }

  // Method executed when the user submits the registration form
  onSubmit() {
    // Check if the form passes all validation rules
    if (this.registerForm.valid) {
      // If valid, call Auth service to register the user with form data
      this.auth.register(this.registerForm.value).subscribe({
        next: () => {
          // On successful registration
          this.router.navigate(['/login']); 
          // Navigate the user to the login page
        },
        error: (err) => {
          // Handle errors returned from backend/API
          const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error'; 
          // Extract a meaningful error message from the API response

          this.errorMessage = 'Registration failed: ' + detail; 
          // Set the error message so it can be displayed in the template

          console.error('Registration error:', err); 
          // Log full error object to console for debugging
        }
      });
    }
    // If form is invalid, Angular automatically marks controls as touched
    // The template can then display validation messages for each invalid control
  }
}




// Key Points:

// Reactive Forms:

// FormGroup manages multiple form controls together.

// Validators provide rules like required, minLength, email, etc.

// Dependency Injection:

// FormBuilder simplifies creating forms.

// Auth is a service to communicate with backend for register/login.

// Router allows navigation after successful actions.

// Error Handling:

// Gracefully handles different types of API errors.

// Displays errors in the UI and logs them for debugging.

// Submit Flow:

// Form validity checked before calling API.

// On success → navigate to login.

// On error → show user-friendly message.