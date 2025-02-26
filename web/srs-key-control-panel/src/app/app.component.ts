/*
 * File: app.component.ts
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Subscription } from 'rxjs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { LocalStorageKey } from './constants/StorageKey';
import { EventSelectorComponent } from './components/event-selector/event-selector.component';
import { BrandingInfo } from './../../../../common/branding/branding';
import { Branding } from './../../../../common/branding/branding.abs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    RouterModule,
    NzDividerModule,
    EventSelectorComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isLoggedIn = false;

  authStateSubscription: Subscription = new Subscription();
  branding: Branding = new BrandingInfo();

  constructor(private router: Router, private apiAuth: AuthService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.authStateSubscription = this.apiAuth.authStateChanged.subscribe(this.authStateChanged);
    this.initializeLocalStorage();
    this.checkTokenValidity();
  }

  checkTokenValidity = () => {
    this.apiAuth.probe()
      .subscribe({
        next: (res: unknown) => {
          console.log('Probe response', res);

          this.isLoggedIn = true;

          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        },
        error: (err: unknown) => {
          console.error('Probe error', err);
        }
      });
  };

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  authStateChanged = (user: boolean) => {
    console.log('Auth state changed', user);
    if (!user) {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
      return;
    }

    this.checkTokenValidity();
  };

  logout = () => {
    this.apiAuth.signout();
  };

  initializeLocalStorage = () => {
    if (!localStorage.getItem(LocalStorageKey.LastGeneratedMasterSheet)) {
      localStorage.setItem(LocalStorageKey.LastGeneratedMasterSheet, '');
      console.log('Initialized KV LastGeneratedMasterSheet');
    }
    if (!localStorage.getItem(LocalStorageKey.TableSettings.EnableAutoUpdate)) {
      localStorage.setItem(
        LocalStorageKey.TableSettings.EnableAutoUpdate,
        'false'
      );
      console.log('Initialized KV EnableAutoUpdate');
    }
    if (!localStorage.getItem(LocalStorageKey.TableSettings.EnableRevokeKey)) {
      localStorage.setItem(
        LocalStorageKey.TableSettings.EnableRevokeKey,
        'false'
      );
      console.log('Initialized KV EnableRevokeKey');
    }
    if (!localStorage.getItem(LocalStorageKey.ClearKeyGenModalAfterCreate)) {
      localStorage.setItem(LocalStorageKey.ClearKeyGenModalAfterCreate, 'true');
      console.log('Initialized KV ClearKeyGenModalAfterCreate');
    }
  };
}
