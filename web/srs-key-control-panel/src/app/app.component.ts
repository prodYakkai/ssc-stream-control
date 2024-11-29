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
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Subscription } from 'rxjs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { LocalStorageKey } from './constants/StorageKey';
import { GoogleLoginProvider, SocialAuthService, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';
import { jwtDecode } from 'jwt-decode';
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
    SocialLoginModule,
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

  constructor(private auth: SocialAuthService, private router: Router, private apiAuth: AuthService) { }

  ngOnInit(): void {
    this.authStateSubscription = this.auth.authState.subscribe(
      this.authStateChanged
    );
    this.initializeLocalStorage();
    this.checkTokenValidity();
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  checkTokenValidity = async () => {
    const storedToken = localStorage.getItem(LocalStorageKey.LoginToken);

    if (!storedToken) {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
      return;
    }

    const decodedToken = jwtDecode(storedToken);
    // check for expiration
    if (Date.now() >= (decodedToken.exp || 0) * 1000) {
      this.auth.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID).then(() => {
        console.log('Refreshed token');
      }).catch((err) => {
        console.error('Failed to refresh token', err);
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
      });
      return;
    }
    this.isLoggedIn = true;

    if (this.router.url === '/login') {
      this.router.navigate(['/']);
    }
  }

  authStateChanged = (user: SocialUser | null) => {
    console.log('Auth state changed', user);
    if (!user) {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
      return;
    }

    this.apiAuth.probe(user.idToken)
      .subscribe({
        next: (res: any) => {
          console.log('Probe response', res);
          localStorage.setItem(LocalStorageKey.LoginToken, user.idToken);

          this.isLoggedIn = true;

          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        },
        error: (err: any) => {
          console.error('Probe error', err);
        }
      })
  };

  logout = () => {
    this.auth.signOut();
    this.router.navigate(['login']);
    this.isLoggedIn = false;
    localStorage.removeItem(LocalStorageKey.LoginToken);
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
