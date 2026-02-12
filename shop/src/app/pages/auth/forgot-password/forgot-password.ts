import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Auth } from '../../../services/auth';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.css'
})
export class ForgotPassword implements OnInit {
    email: string = '';
    isLoading: boolean = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    constructor(
        private auth: Auth,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // Pre-fill email from query parameter if provided
        this.route.queryParams.subscribe(params => {
            if (params['email']) {
                this.email = params['email'];
            }
        });
    }

    onSubmit() {
        if (!this.email) return;

        this.isLoading = true;
        this.successMessage = null;
        this.errorMessage = null;

        const payload = { email: this.email };
        console.log('[ForgotPassword] Submitting payload:', payload);

        this.auth.forgotPassword(this.email)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: () => {
                    this.successMessage = 'If an account exists for this email, we have sent a password reset link.';
                    this.email = ''; // Clear input on success
                },
                error: (err) => {
                    console.error('Forgot password error:', err);
                    // SECURITY: Do not reveal that the email does not exist.
                    // Show the same success message even if it failed (unless it's a network error, but for user not found we feign success)
                    // unique constraint: The requirement says "Always show generic success message".
                    // However, if the backend 500s, we might want to say "Something went wrong".
                    // If the backend 404s (user not found), we should show success.
                    // Let's stick to the user request: "Always show generic success message" implies hiding 404s.

                    this.successMessage = 'If an account exists for this email, we have sent a password reset link.';
                    this.errorMessage = null;
                }
            });
    }
}
