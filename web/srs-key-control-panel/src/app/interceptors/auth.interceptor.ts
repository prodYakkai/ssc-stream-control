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
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const messageService = inject(NzMessageService);
  const router = inject(Router);
  const auth = inject(AuthService);

  const handleAuthError = () => {
    router.navigate(['/login']);
    messageService.warning('Unauthorized, please login again');
    auth.authStateChange(false);
  }


  if (req.headers.has('Authorization')) {
    // already has an Authorization header, might be a login request
    return next(req);
  }

  const newReq = req.clone({
    withCredentials: true,
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
