import {
  SocialLoginModule,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzSpinModule,
    NzMessageModule,
    SocialLoginModule,
    GoogleSigninButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;

  constructor() {}
  ngOnDestroy(): void {}

  ngOnInit(): void {}
}
