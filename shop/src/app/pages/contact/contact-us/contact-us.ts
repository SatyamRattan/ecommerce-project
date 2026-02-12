import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactUs as ContactService } from '../../../services/contact-us';

@Component({
    selector: 'app-contact-us',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-us.html',
    styleUrl: './contact-us.css'
})
export class ContactUs {
    formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };

    isSubmitting = false;
    successMessage = '';
    errorMessage = '';

    constructor(private contactService: ContactService) { }

    onSubmit() {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.contactService.sendMessage(this.formData).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                this.successMessage = 'Your message has been sent successfully! We will get back to you soon.';
                this.formData = { name: '', email: '', subject: '', message: '' };
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = 'Failed to send message. Please try again later.';
                console.error('Contact form error:', err);
            }
        });
    }
}
