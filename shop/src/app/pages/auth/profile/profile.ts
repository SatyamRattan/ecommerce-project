import { Component, OnInit } from '@angular/core';
import { Auth, User } from '../../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, map, catchError, of, take } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user$!: Observable<User | null>;
  error: string = '';

  // Edit mode state
  editMode: boolean = false;
  editUserData: Partial<User> = {};
  saving: boolean = false;
  successMessage: string = '';

  constructor(private auth: Auth, private router: Router) { }

  ngOnInit() {
    // 1. Bind to the central auth state
    this.user$ = this.auth.user$;

    // 2. Trigger fetch if not already loaded (Single-Source-of-Truth pattern)
    this.auth.getProfile().pipe(
      take(1),
      catchError(err => {
        console.error('Error fetching profile in component:', err);
        this.error = 'Failed to load profile details';
        if (err.status === 401) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
        return of(null);
      })
    ).subscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  startEdit(user: User) {
    // Normalize gender to uppercase to match backend choices
    const normalizedGender = user.gender ? user.gender.toUpperCase() : 'OTHER';
    this.editUserData = { ...user, gender: normalizedGender };
    this.editMode = true;
    this.successMessage = '';
    this.error = '';
  }

  cancelEdit() {
    this.editMode = false;
    this.editUserData = {};
    this.error = '';
  }

  saveProfile() {
    this.user$.pipe(take(1)).subscribe(user => {
      const userId = this.auth.getUserId(user);
      if (!userId) {
        this.error = 'Could not identify user for update.';
        return;
      }

      this.saving = true;
      this.error = '';

      // Prepare payload with normalized values
      const updatePayload = {
        name: this.editUserData.name,
        phone: this.editUserData.phone,
        gender: this.editUserData.gender || 'OTHER',
        dob: this.editUserData.dob || null, // Ensure empty string becomes null
        address: this.editUserData.address
      };

      this.auth.updateProfile(userId, updatePayload).subscribe({
        next: () => {
          this.saving = false;
          this.editMode = false;
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => (this.successMessage = ''), 3000);

          // No need to manually refresh getProfile() here!
          // The auth.user$ BehaviorSubject was updated during the PATCH call
          // and this component (bound via async pipe) will update instantly.
        },
        error: (err) => {
          this.saving = false;
          const detail = err.error?.detail || err.error?.message || 'Failed to update profile. Please check all fields.';
          this.error = detail;
          console.error('Update profile error:', err);
        }
      });
    });
  }
}

// Key Points in These Comments:

// Every property is explained: user, loading, error.

// Every method (fetchProfile, logout) has step-by-step explanation of its purpose.

// Angular subscribe logic is broken down: next for success, error for failure.

// Special cases like array responses or 401 unauthorized are explicitly mentioned.

// Makes it easy for a new developer to understand flow, error handling, and routing.