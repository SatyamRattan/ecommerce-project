import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
    resetForm: FormGroup;
    token: string | null = null;
    isLoading: boolean = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // Initialize reactive form with validators
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        // Read token from query parameters (?token=...)
        this.token = this.route.snapshot.queryParams['token'];

        if (!this.token) {
            this.errorMessage = 'Invalid or expired password reset link';
        }
    }

    /**
     * Custom validator to ensure password and confirm_password match
     */
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit() {
        if (this.resetForm.invalid || !this.token) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;
        this.successMessage = null;

        const payload = {
            token: this.token,
            new_password: this.resetForm.value.password,
            confirm_password: this.resetForm.value.confirmPassword
        };

        // Call API matching the exact requested payload
        this.http.post(`${environment.apiUrl}/users/auth/reset-password/`, payload)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: () => {
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    console.error('Reset password error:', err);
                    // Show backend error message
                    this.errorMessage = err.error?.detail || err.error?.message || 'Failed to reset password. Please try again.';
                }
            });
    }
}
