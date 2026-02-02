import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';
import { Home } from './home/home';
import { HomeModule } from './home/home.module';
import { Login } from './login/login';
import { LoginModule } from './login/login.module';
import { Soundboard } from './soundboard/soundboard';

export const routes: Routes = [
    { path: 'login', component: Login, providers: [LoginModule] },
    { path: '', component: Home, providers: [HomeModule], canActivate: [authGuard] },
    {path: 'soundboard', component: Soundboard, canActivate: [authGuard]}, 
];
