import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }

  probe(token?: string) {
    return this.http.get(`${environment.apiHost}/auth/probe`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
