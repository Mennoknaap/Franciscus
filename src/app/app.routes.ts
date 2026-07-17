import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/auth/admin-auth-guard';
import { appAccessGuard } from './core/auth/app-access-guard';
import { authGuard } from './core/auth/auth-guard';
import { Home } from './modules/home/home';
import { Biertje } from './modules/biertje/biertje';
import { Kud } from './modules/kud/kud';
import { HomeModule } from './modules/home/home.module';
import { Login } from './modules/login/login';
import { LoginModule } from './modules/login/login.module';
import { Soundboard } from './modules/soundboard/soundboard';
import { Wheel } from './modules/wheel-of-fortune/wheel';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: Login, providers: [LoginModule] },
    { path: 'home', component: Home, providers: [HomeModule], canActivate: [authGuard] },
    { path: 'soundboard', component: Soundboard, loadChildren: () => import('./modules/soundboard/soundboard.module').then(m => m.SoundboardModule), canActivate: [authGuard, appAccessGuard('soundboard')] },
    { path: 'wheel', component: Wheel, canActivate: [authGuard, appAccessGuard('wheel')] },
    { path: 'biertje', component: Biertje, canActivate: [authGuard, appAccessGuard('biertje')] },
    { path: 'kud', component: Kud, canActivate: [authGuard, appAccessGuard('kud')] },
    { path: 'liedjes', loadComponent: () => import('./modules/liedjes/liedjes').then(m => m.Liedjes), canActivate: [authGuard, appAccessGuard('liedjes')] },
    { path: 'liedjes/:id', loadComponent: () => import('./modules/liedjes/child-detail').then(m => m.ChildDetail), canActivate: [authGuard, appAccessGuard('liedjes')] },
    { path: 'admin', loadComponent: () => import('./modules/admin/admin').then(m => m.Admin), canActivate: [adminAuthGuard] },
    { path: 'poop-app', loadComponent: () => import('./modules/poop-app/poop-app').then(m => m.PoopApp), canActivate: [authGuard, appAccessGuard('poop-app')] },
    { path: 'puntentelling', loadComponent: () => import('./modules/puntentelling/puntentelling').then(m => m.Puntentelling), canActivate: [authGuard, appAccessGuard('puntentelling')] },
    { path: 'puntentelling/geschiedenis', loadComponent: () => import('./modules/puntentelling/puntentelling-history').then(m => m.PuntentellingHistory), canActivate: [authGuard, appAccessGuard('puntentelling')] },
    { path: 'puntentelling/geschiedenis/:id', loadComponent: () => import('./modules/puntentelling/puntentelling-session-detail').then(m => m.PuntentellingSessionDetail), canActivate: [authGuard, appAccessGuard('puntentelling')] },
    { path: 'badjasspel', loadComponent: () => import('./modules/badjasspel/badjasspel').then(m => m.Badjasspel), canActivate: [authGuard, appAccessGuard('badjasspel')] },
    { path: 'badjasspel/geschiedenis', loadComponent: () => import('./modules/badjasspel/badjasspel-history').then(m => m.BadjasspelHistory), canActivate: [authGuard, appAccessGuard('badjasspel')] },
];
