/*
 * File: vhost.service.ts
 * Project: srs-key-control-panel
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Category } from '@prisma/client';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private http: HttpClient,
  ) { }

  getCategories(eventId: string) {
    return this.http.get<HttpResponse<Category[]>>(`${environment.apiHost}/category/event/${eventId}`);
  }

  createCategory(eventId: string, name: string) {
    return this.http.post(`${environment.apiHost}/category`, { name, eventId });
  }

  getCategoryDetail(eventId: string, categoryId: string) {
    return this.http.get(`${environment.apiHost}/category/event/${eventId}/${categoryId}`);
  }

  updateCategory(eventId: string, categoryId: string, name: string) {
    return this.http.put(`${environment.apiHost}/category/event/${eventId}/${categoryId}`, { name });
  }

  deleteCategory(eventId: string, categoryId: string) {
    return this.http.delete(`${environment.apiHost}/category/event/${eventId}/${categoryId}`);
  }


}
