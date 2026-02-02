import { Routes } from '@angular/router';
import { Home } from './home/home';
import { HomeModule } from './home/home.module';
import { Login } from './login/login';
import { LoginModule } from './login/login.module';

export const routes: Routes = [
    { path: '**', redirectTo: '' },
    { path: '', component: Home, providers: [HomeModule] },
    { path: 'login', component: Login, providers: [LoginModule] },
];
