// import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
// import { provideServerRendering, withRoutes } from '@angular/ssr';
// import { appConfig } from './app.config';
// import { serverRoutes } from './app.routes.server';

// const serverConfig: ApplicationConfig = {
//   providers: [
//     provideServerRendering(withRoutes(serverRoutes))
//   ]
// };

// export const config = mergeApplicationConfig(appConfig, serverConfig);


// Import utility to merge multiple ApplicationConfig objects
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';

// Import SSR-specific provider and ability to define server-side routes
import { provideServerRendering, withRoutes } from '@angular/ssr';

// Import your main app configuration (client-side providers, router, HttpClient, etc.)
import { appConfig } from './app.config';

// Import the server-specific routes
import { serverRoutes } from './app.routes.server';

// Define a new server-side configuration
const serverConfig: ApplicationConfig = {
  providers: [
    // 1️⃣ Enable Server-Side Rendering (SSR)
    //    - This sets up Angular to render pages on the server
    //    - withRoutes(serverRoutes) tells Angular which routes to pre-render on the server
    provideServerRendering(withRoutes(serverRoutes))
  ]
};
// Merge client-side appConfig with server-specific serverConfig
// This ensures the final configuration includes:
// - All client-side providers (HttpClient, Router, interceptors, hydration, etc.)
// - All server-side providers (SSR, server routes)
export const config = mergeApplicationConfig(appConfig, serverConfig);
