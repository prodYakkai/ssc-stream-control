import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UserService } from '../../services/user.service';
import { User } from '@prisma/client';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    CommonModule,
    NzDividerModule,
    NzTableModule,
    RouterModule,
    NzModalModule,
    NzTagModule
  ],
  templateUrl: './user-manage.component.html',
  styleUrl: './user-manage.component.less'
})
export class UserManageComponent implements OnInit {

  users: User[] = [];

  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private modal: NzModalService,
    private messageService: NzMessageService,
    private fb: FormBuilder,
  ) {
     // Initialize the form with validation
     this.userForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      name: [
        '',
        [
          Validators.required,
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  submitForm() {
    if (this.userForm.invalid) {
      this.messageService.error('Please check the form');
      return;
    }
    const { email,name } = this.userForm.value;
    this.userService.createUser(email, name).subscribe({
      next: () => {
        this.loadUsers();
        this.userForm.reset();
        this.messageService.success('User created');
      },
      error: (err) => {
        console.error(err);
        this.messageService.error('Failed to create user');
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (!res.data) {
          this.messageService.error('Failed to load users');
          return;
        }
        this.users = res.data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  deactivateUser(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: (res) => {
        if (!res.data) {
          this.messageService.error('Failed to deactivate user');
          return;
        }
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  activateUser(id: string) {
    this.userService.activateUser(id).subscribe({
      next: (res) => {
        if (!res.data) {
          this.messageService.error('Failed to activate user');
          return;
        }
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onDeactivateUser(id: string) {
    this.modal.confirm({
      nzTitle: 'Are you sure to deactivate this user?',
      nzOnOk: () => {
        this.deactivateUser(id);
      }
    });
  }

  onActivateUser(id: string) {
    this.modal.confirm({
      nzTitle: 'Are you sure to activate this user?',
      nzOnOk: () => {
        this.activateUser(id);
      }
    });
  }

  userElevation(email: string, admin: boolean) {
    this.userService.updateUserElevation(email, admin).subscribe({
      next: (res) => {
        if (!res.data) {
          this.messageService.error('Failed to elevate user');
          return;
        }
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onUserElevation(email: string, admin: boolean) {
    this.modal.confirm({
      nzTitle: `Are you sure to ${admin ? 'promote' : 'demote'} this user?`,
      nzOnOk: () => {
        this.userElevation(email, admin);
      }
    });
  }

}
