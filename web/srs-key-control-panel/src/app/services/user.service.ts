import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '@prisma/client';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  getCurrentUser() {
    return this.http.get(environment.apiHost + '/user/profile');
  }

  getUsers() {
    return this.http.get<HttpResponse<User[]>>(environment.apiHost + '/user');
  }

  deleteUser(id: string, permanent=false) {
    return this.http.delete<HttpResponse<User>>(environment.apiHost + '/user/' + id, {
      params: {
        permanent: permanent ? 'true' : 'false'
      }
    });
  }

  activateUser(id: string) {
    return this.http.patch<HttpResponse<User>>(environment.apiHost + '/user/' + id, {});
  }

  updateUserElevation(email: string, admin: boolean) {
    return this.http.post<HttpResponse<User>>(environment.apiHost + '/user/elevator', {
      floor: email,
      call: admin
    });
  }

  createUser(email: string, name: string) {
    return this.http.post<HttpResponse<User>>(environment.apiHost + '/user', {
      email,
      name
    });
  }

  
}
