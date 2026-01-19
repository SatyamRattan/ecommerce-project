// Import the function to bootstrap a standalone Angular application
import { bootstrapApplication } from '@angular/platform-browser';

// Import the app configuration, usually containing providers (like services, interceptors, router, etc.)
import { appConfig } from './app/app.config';

// Import the root standalone component of your Angular app
import { App } from './app/app';

// Bootstrap the Angular application using the root component 'App' and configuration 'appConfig'
// bootstrapApplication returns a Promise, so we can handle errors with .catch
bootstrapApplication(App, appConfig)
  // Catch any errors during bootstrap and log them to the console
  .catch((err) => console.error(err));





//   Key points:

// bootstrapApplication(App, appConfig)

// Replaces the older platformBrowserDynamic().bootstrapModule(AppModule) used in Angular <14.

// Works for standalone component architecture.

// App

// This is your root standalone component, which acts like AppComponent in traditional Angular apps.

// appConfig

// Can contain providers (DI), router configuration, interceptors, and other global settings.

// Example:

// export const appConfig = {
//   providers: [importProvidersFrom(RouterModule.forRoot(routes)), { provide: SOME_SERVICE, useClass: MyService }]
// };


// .catch((err) => console.error(err))

// Catches any bootstrap errors (e.g., dependency injection issues, misconfigured providers) and logs them.