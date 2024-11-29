import { Routes } from '@angular/router';
import { EventManageComponent } from './pages/event-manage/event-manage.component';
import { CategoryManageComponent } from './pages/category-manage/category-manage.component';
import { DestinationManageComponent } from './pages/destination-manage/destination-manage.component';
import { StreamDetailComponent } from './pages/stream-detail/stream-detail.component';
import { UserManageComponent } from './pages/user-manage/user-manage.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
  },
  {
    path: 'manage',
    children: [
      {
        path: 'event',
        component: EventManageComponent,
      },
      {
        path: 'category',
        component: CategoryManageComponent
      },
      {
        path: 'destination',
        component: DestinationManageComponent
      },
      {
        path: 'user',
        component: UserManageComponent
      }
    ]
  },
  {
    path: 'stream',
    children: [
      {
        path: ':id',
        component: StreamDetailComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/home',
  }
];
