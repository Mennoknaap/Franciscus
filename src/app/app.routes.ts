import { Routes } from '@angular/router';
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
];
