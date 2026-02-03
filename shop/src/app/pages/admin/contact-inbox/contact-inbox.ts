import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactUs as ContactUsService } from '../../../services/contact-us';
import { Auth } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
    selector: 'app-contact-inbox',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact-inbox.html',
    styleUrl: './contact-inbox.css'
})
export class ContactInbox implements OnInit {
    messages: any[] = [];
    selectedMessage: any = null;
    loading = false;

    // Filters state
    filters = {
        status: '',
        subject: '',
        search: ''
    };

    constructor(
        private contactUs: ContactUsService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        // Wait for auth to be fully loaded before checking status
        this.auth.authLoaded$.subscribe(loaded => {
            if (loaded) {
                if (!this.auth.isAuthenticated()) {
                    console.log('[ContactInbox] Not authenticated, redirecting to login...');
                    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
                } else {
                    this.loadMessages();
                }
            }
        });
    }

    loadMessages() {
        this.loading = true;
        this.contactUs.getMessages(this.filters).subscribe({
            next: (res: any) => {
                this.messages = res.results || res;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load messages', err);
                this.loading = false;
            }
        });
    }

    onFilterChange() {
        this.loadMessages();
    }

    resetFilters() {
        this.filters = {
            status: '',
            subject: '',
            search: ''
        };
        this.loadMessages();
    }

    selectMessage(msg: any) {
        this.selectedMessage = msg;
        // If selecting an UNREAD message, we might want to mark it as READ automatically 
        // but the requirement says "Mark as Read" is an action button.
    }

    closeDetails() {
        this.selectedMessage = null;
    }

    updateStatus(id: number, status: string) {
        this.contactUs.updateMessageStatus(id, status).subscribe({
            next: () => {
                this.loadMessages(); // Refresh list
                if (this.selectedMessage && this.selectedMessage.id === id) {
                    this.selectedMessage.status = status; // Update local detail view
                }
            },
            error: (err) => {
                console.error('Failed to update status', err);
            }
        });
    }

    getStatusClass(status: string) {
        return `status-badge ${status.toLowerCase()}`;
    }
}
