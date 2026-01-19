import { Component } from '@angular/core';
// Import Angular's Component decorator to define this class as a component

import { CommonModule } from '@angular/common';
// Import CommonModule to use common Angular directives like *ngIf, *ngFor, etc.

import { RouterLink } from '@angular/router';
// Import RouterLink to enable linking to routes in the footer template

@Component({
  selector: 'app-footer',
  // The HTML tag used to include this component: <app-footer></app-footer>

  standalone: true,
  // Marks this as a standalone component, no need to declare in NgModule

  imports: [CommonModule, RouterLink],
  // Modules needed in the template: CommonModule for Angular directives, RouterLink for routing

  templateUrl: './footer.html',
  // Points to the HTML template file for this component

  styleUrl: './footer.css',
  // Points to the CSS file for styling this component
})
export class Footer {
  // The Footer component class
  // Currently, it has no logic; it purely serves the footer HTML template
}
