import { CategoryService } from './../../services/category.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Category } from '@prisma/client';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { EventService } from '../../services/event.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-category-manage',
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
    NzModalModule,
  ],
  templateUrl: './category-manage.component.html',
  styleUrl: './category-manage.component.less',
})
export class CategoryManageComponent implements OnInit {
  categoryForm: FormGroup;
  categories: Category[] = [];
  public isLoading = false;
  currentEventId: string = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private categoryService: CategoryService,
    private messageService: NzMessageService,
    private modalService: NzModalService
  ) {
    // Initialize the form with validation
    this.categoryForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(16),
          Validators.pattern(/^[a-z0-9_]+$/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.currentEventId = this.eventService.getLocalCurrentEvent();
    if (!this.currentEventId) {
      this.messageService.error('Please select an event first');
      return;
    }
    this.loadCategories();
  }

  // Function to handle form submission
  submitForm(): void {
    if (!this.currentEventId) {
      this.messageService.error('Please select an event first');
      return;
    }
    if (this.categoryForm.valid) {
      this.categoryService
        .createCategory(this.currentEventId, this.categoryForm.value.name)
        .subscribe({
          next: () => {
            this.categoryForm.reset();
            this.messageService.success('Category created successfully');
            this.loadCategories();
          },
          error: (err) => {
            console.error(err);
            this.messageService.error('Failed to create event');
          },
        });
    } else {
      Object.values(this.categoryForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
    }
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories(this.currentEventId).subscribe({
      next: (data: HttpResponse<Category[]>) => {
        if (data.code === 0) {
          this.categories = data.data;
        } else {
          this.messageService.error('Failed to load events');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  deleteCategory(id: string): void {
    this.modalService.confirm({
      nzTitle: 'Are you sure you want to delete this category?',
      nzContent: 'This action cannot be undone',
      nzOnOk: () => {
        this.categoryService.deleteCategory(this.currentEventId, id).subscribe({
          next: () => {
            this.messageService.success('Category deleted successfully');
            this.loadCategories();
          },
          error: (err) => {
            console.error(err);
            this.messageService.error('Failed to delete category');
          },
        });
      },
    });
  }

  public onInputChanged(e: Event): void {
    const input = e.target as HTMLInputElement;
    // Getting the current value of the input
    const currentValue = input.value;

    // Replacing spaces with underscores
    const modifiedValue = currentValue.replace(/ /g, '_');

    input.value = modifiedValue;
  }
}
