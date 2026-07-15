import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/auth/admin-auth-guard';
import { authGuard } from './core/auth/auth-guard';
import { Home } from './modules/home/home';
import { HomeModule } from './modules/home/home.module';
import { Login } from './modules/login/login';
import { LoginModule } from './modules/login/login.module';
import { Soundboard } from './modules/soundboard/soundboard';
import { Wheel } from './modules/wheel-of-fortune/wheel';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: Login, providers: [LoginModule] },
    { path: 'home', component: Home, providers: [HomeModule], canActivate: [authGuard] },
    { path: 'soundboard', component: Soundboard, loadChildren: () => import('./modules/soundboard/soundboard.module').then(m => m.SoundboardModule), canActivate: [authGuard] },
    { path: 'wheel', component: Wheel, canActivate: [authGuard] },
    { path: 'liedjes', loadComponent: () => import('./modules/liedjes/liedjes').then(m => m.Liedjes), canActivate: [authGuard] },
    { path: 'liedjes/:id', loadComponent: () => import('./modules/liedjes/child-detail').then(m => m.ChildDetail), canActivate: [authGuard] },
    { path: 'admin', loadComponent: () => import('./modules/admin/admin').then(m => m.Admin), canActivate: [adminAuthGuard] },
];
