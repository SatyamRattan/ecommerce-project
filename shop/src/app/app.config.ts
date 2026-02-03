// Import type for application-wide configuration
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Import function to set up routing for standalone apps
import { provideRouter } from '@angular/router';

// Import the array of routes defined for your application
import { routes } from './app.routes';

// Import functions for client-side hydration (useful for SSR / pre-rendering) and event replay
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Import provideAnimations for Angular animations support
import { provideAnimations } from '@angular/platform-browser/animations';

// Import HttpClient and ability to add interceptors globally
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Import a custom authentication interceptor
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1️⃣ Provide HttpClient globally and attach authInterceptor
    //    - This ensures all HTTP requests go through this interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // 2️⃣ Enable global error listeners for uncaught exceptions and promise rejections
    //    - Logs errors to console by default, can be extended for analytics
    provideBrowserGlobalErrorListeners(),

    // 3️⃣ Provide the router configuration
    //    - This sets up routing for the app using the 'routes' array
    provideRouter(routes),

    // 4️⃣ Enable client-side hydration
    //    - Useful if your app uses SSR (server-side rendering)
    //    - withEventReplay() replays DOM events captured during SSR to client
    provideClientHydration(withEventReplay()),

    // 5️⃣ Enable Angular animations
    //    - Required for @angular/animations to work (slide, fade, etc.)
    provideAnimations()
  ]
};




// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';

// export const appConfig = {
//   providers: [provideRouter(routes)]
// };
