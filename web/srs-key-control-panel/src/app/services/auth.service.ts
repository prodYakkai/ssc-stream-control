import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }

  authStateChanged: EventEmitter<boolean> = new EventEmitter();
  authState: boolean = false;

  probe() {
    return this.http.get(`${environment.apiHost}/auth/probe`, {
      withCredentials: true,
      headers: {
        'Authorization': 'Bearer probe',
      }
    });
  }

  callbackGoogle(oauthObj: unknown) {
    return this.http.get(`${environment.apiHost}/auth/google/callback`, {
      params: oauthObj as unknown as { [key: string]: string },
      withCredentials: true,
      headers: {
        'Authorization': 'Bearer callback'
      }
    });
  }

  callbackOpenid(url: string) {
    return this.http.get(`${environment.apiHost}/auth/openid/callback`, {
      params: {
        url,
      },
      withCredentials: true,
      headers: {
        'Authorization': 'Bearer callback'
      }
    });
  }
  
  signout() {
    return window.location.replace(`${environment.apiHost}/auth/logout?redirect=${window.location.origin}`);
  }

  authStateChange(state: boolean) {
    this.authState = state;
    this.authStateChanged.emit(state);
  }
}
