// Import the Component decorator from Angular core to define a component
import { Component } from '@angular/core';

// Import CommonModule to use common Angular directives like *ngIf, *ngFor
import { CommonModule } from '@angular/common';

// Import RouterLink to enable navigation via <a [routerLink]> in the template
import { RouterLink } from '@angular/router';

// Define the Angular component
@Component({
  selector: 'app-order-confirmation',  // The HTML tag used to include this component
  standalone: true,                     // Standalone component, no NgModule required
  imports: [CommonModule, RouterLink],  // Import modules needed by this component
  templateUrl: './order-confirmation.html', // Path to the HTML template for this component
  styleUrl: './order-confirmation.css',    // Path to the CSS file for styling this component
})
// Export the component class
export class OrderConfirmation {
  // Currently empty because this component is static and only displays confirmation info
  // Future functionality could include displaying order details from a service or showing tracking info
}
