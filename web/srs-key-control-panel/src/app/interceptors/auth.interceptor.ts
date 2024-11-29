import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';
import { LocalStorageKey } from '../constants/StorageKey';
import { SocialAuthService } from '@abacritt/angularx-social-login';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const messageService = inject(NzMessageService);
  const router = inject(Router);
  const auth = inject(SocialAuthService);

  const handleAuthError = () => {
    router.navigate(['/login']);
    messageService.warning('Unauthorized, please login again');
    auth.signOut();
    localStorage.removeItem(LocalStorageKey.LoginToken);
  }

  if (req.headers.has('Authorization')) {
    // already has an Authorization header, might be a login request
    return next(req);
  }

  const newReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${localStorage.getItem(LocalStorageKey.LoginToken)}`,
    },
  });

  return next(newReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        handleAuthError();
      }
      return throwError(error);
    })
  );
  
};
