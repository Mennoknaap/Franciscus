import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';
import { Home } from './home/home';
import { HomeModule } from './home/home.module';
import { Login } from './login/login';
import { LoginModule } from './login/login.module';
import { Soundboard } from './soundboard/soundboard';
import { Wheel } from './wheel-of-fortune/wheel';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: Login, providers: [LoginModule] },
    { path: 'home', component: Home, providers: [HomeModule], canActivate: [authGuard] },
    { path: 'soundboard', component: Soundboard, canActivate: [authGuard] },
    { path: 'wheel', component: Wheel, canActivate: [authGuard] }, 
];
