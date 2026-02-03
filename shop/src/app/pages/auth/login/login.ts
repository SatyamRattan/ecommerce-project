import { Component } from '@angular/core'; // Import Angular's core Component decorator
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // Router for navigation, RouterLink for template links, ActivatedRoute for reading query params
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Reactive forms and validation helpers
import { Auth } from '../../../services/auth'; // Auth service to handle login API calls
import { CommonModule } from '@angular/common'; // CommonModule provides common directives like ngIf/ngFor

@Component({
  selector: 'app-login',               // Selector used to embed this component in HTML
  standalone: true,                     // Indicates this is a standalone component, not part of a NgModule
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Import modules needed for template bindings
  templateUrl: './login.html',          // HTML template path
  styleUrl: './login.css',              // CSS styles path
})
export class Login {
  loginForm: FormGroup;                 // Reactive form object storing email and password fields
  errorMessage: string = '';            // String to hold error messages for display in template
  showPassword: boolean = false;        // Toggle for password visibility

  constructor(
    private fb: FormBuilder,            // FormBuilder for easy form control creation
    private auth: Auth,                 // Auth service for sending login request to backend
    private router: Router,             // Router to programmatically navigate after login
    private route: ActivatedRoute       // ActivatedRoute to read query parameters, like returnUrl
  ) {
    // Initialize reactive login form with form controls and validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email input: required & must be valid email format
      password: ['', [Validators.required]]                 // Password input: required
    });
  }

  // Function triggered when the user submits the login form
  onSubmit() {
    // Check if the form passes all validators
    if (this.loginForm.valid) {
      // Prepare the payload object for login API request
      const payload = {
        email: this.loginForm.value.email,       // Extract email from form
        password: this.loginForm.value.password  // Extract password from form
      };

      // Call Auth service login method with payload
      this.auth.login(payload).subscribe({
        // Success callback when API responds with 2xx status
        next: () => {
          // Read the returnUrl query parameter from URL (if user was redirected to login)
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          console.log('[Login] Success! Navigating to:', returnUrl); // Debug: log navigation
          this.router.navigateByUrl(returnUrl); // Navigate to returnUrl or home page
        },

        // Error callback when API returns 4xx/5xx status
        error: (err) => {
          // Extract the most descriptive error message from possible backend responses
          const detail =
            err.error?.detail ||                    // DRF standard detail field
            err.error?.non_field_errors?.[0] ||    // Django default for form errors
            err.error?.message ||                   // Generic error message
            err.message ||                          // Fallback JS error message
            'Unknown error';                        // Ultimate fallback if nothing else

          // Store the message for display in the template
          this.errorMessage = 'Login failed: ' + detail;

          // Debug: print full error object to console
          console.error('Login error:', err);
        }
      });
    } else {
      // If form is invalid, optionally log or highlight errors
      console.warn('[Login] Form invalid, cannot submit:', this.loginForm.errors);
    }
  }
}

// Key Points:

// loginForm is reactive, meaning validations and data bindings happen in TypeScript rather than template-driven.

// onSubmit() only fires the API call if the form is valid.

// Error handling uses multiple fallbacks to get the most descriptive message from the backend.

// returnUrl ensures the user goes back to the page they tried to access before login.