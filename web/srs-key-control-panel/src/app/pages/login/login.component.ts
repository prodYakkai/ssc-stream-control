import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { environment } from './../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzSpinModule,
    NzMessageModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  environment = environment;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: NzMessageService
  ) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (Object.keys(params).length === 0) {
        return;
      }
      console.log(params);
      this.isLoading = true;
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: 'merge',
      })
      this.authService.callback(params).subscribe({
        next: () => {
          this.isLoading = false;
          this.messageService.success('Login successful');
          this.authService.authStateChange(true);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          this.authService.authStateChange(false);
          this.messageService.error('Login failed, ' + err.error.message);
          this.isLoading = false;
        },
      });
    });
  }
}
