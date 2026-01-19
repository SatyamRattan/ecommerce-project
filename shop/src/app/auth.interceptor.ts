// Import required Angular HTTP types for interceptor implementation
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';

// inject() is used instead of constructor injection (functional interceptor)
import { inject } from '@angular/core';

// Auth service for token, refresh, login/logout logic
import { Auth } from './services/auth';

// RxJS operators and helpers
import {
  catchError,
  throwError,
  switchMap,
  Observable,
  of
} from 'rxjs';

// Router is used to redirect user to login when auth fails
import { Router } from '@angular/router';

/**
 * Global flag to prevent multiple refresh-token calls
 * when several requests fail with 401 at the same time
 */
let isRefreshing = false;

/**
 * Functional HTTP interceptor
 * This intercepts EVERY outgoing HTTP request
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Inject required services manually
  const authService = inject(Auth);
  const router = inject(Router);

  // Get access token (if exists)
  const token = authService.getToken();

  // Get token prefix (Bearer / Token)
  const prefix = authService.getTokenPrefix();

  /* ============================
     REQUEST TYPE IDENTIFICATION
     ============================ */

  // Login request (should NOT attach token)
  const isLogin = req.url.includes('/token/');

  // Refresh token request
  const isRefresh = req.url.includes('/token/refresh/');

  // Registration request
  const isRegister =
    (req.url.includes('/user/') || req.url.includes('/users/')) &&
    req.method === 'POST';

  // Public catalog GET requests (no auth required)
  const isPublicCatalog =
    (req.url.includes('/catalog/products/') ||
      req.url.includes('/catalog/category/')) &&
    req.method === 'GET';

  // Contact form request (public)
  const isContact = req.url.includes('/contact/');

  /**
   * Aggregate flag for public endpoints
   * Public requests MUST NOT send Authorization header
   */
  const isPublicRequest =
    isLogin || isRegister || isPublicCatalog || isContact || isRefresh;

  // Debug log for interceptor visibility
  console.log(
    `[Auth Interceptor] URL: ${req.url}, Method: ${req.method}, Public: ${isPublicRequest}, Has Token: ${!!token}, Prefix: ${prefix}`
  );

  /* ============================
     ATTACH TOKEN IF REQUIRED
     ============================ */

  // By default, use original request
  let authReq = req;

  // Attach Authorization header only for protected routes
  if (token && !isPublicRequest) {
    authReq = addTokenHeader(req, token, prefix);
  }

  /* ============================
     SEND REQUEST & HANDLE ERRORS
     ============================ */

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      /**
       * CASE 1:
       * Token expired → backend returns 401
       * Try refreshing token ONCE
       */
      if (
        error.status === 401 &&
        !isPublicRequest &&
        !isRefreshing
      ) {
        console.log(
          '[Auth Interceptor] 401 detected, attempting token refresh...'
        );

        // Prevent parallel refresh calls
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            // Refresh successful
            isRefreshing = false;

            // Extract new access token
            const newToken = response.access || authService.getToken();

            console.log(
              '[Auth Interceptor] Refresh successful, retrying original request.'
            );

            // Retry original request with NEW token
            return next(addTokenHeader(req, newToken!, prefix));
          }),

          /**
           * Refresh token failed
           * → force logout
           * → redirect to login
           */
          catchError((refreshError) => {
            isRefreshing = false;

            console.error(
              '[Auth Interceptor] Refresh failed, logging out.'
            );

            authService.logout();

            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url }
            });

            return throwError(() => refreshError);
          })
        );
      }

      /**
       * CASE 2:
       * 401 on public request OR
       * refresh already in progress
       * → logout defensively
       */
      if (
        error.status === 401 &&
        (isPublicRequest || isRefreshing)
      ) {
        authService.logout();

        // Avoid infinite redirect loop on login page
        if (!isLogin) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }

      // Pass error to calling service/component
      return throwError(() => error);
    })
  );
};

/**
 * Helper function to clone request
 * and attach Authorization header safely
 */
function addTokenHeader(
  request: HttpRequest<any>,
  token: string,
  prefix: string
) {
  return request.clone({
    headers: request.headers.set(
      'Authorization',
      `${prefix} ${token}`
    )
  });
}
