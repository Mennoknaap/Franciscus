import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, switchMap, throwError } from 'rxjs';
import { FransApiClient } from '../../apiclients/fransapi.client';

interface TokenPayload {
    exp: number;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const requestUrl = req.url;

    if (requestUrl.includes('/auth'))
        return next(req);

    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const router = inject(Router);

    if (!authToken || !refreshToken) {
        localStorage.clear();
        router.navigate(['/login']);
        return throwError(() => new Error('No auth tokens'));
    }

    if (isTokenExpired(authToken)) {
        if (isTokenExpired(refreshToken)) {
            localStorage.clear();
            router.navigate(['/login']);
            return throwError(() => new Error('Tokens expired'));
        }

        const api = inject(FransApiClient);
        return api.authRefresh({ authToken, refreshToken }).pipe(
            switchMap(response => {
                localStorage.setItem('authToken', response.authToken);
                localStorage.setItem('refreshToken', response.refreshToken);

                const clonedReq = req.clone({
                    headers: req.headers.set('Authorization', `Bearer ${response.authToken}`),
                });
                return next(clonedReq);
            }),
            catchError(error => {
                localStorage.clear();
                router.navigate(['/login']);
                return throwError(() => error);
            }),
        );
    }

    const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });
    return next(clonedReq);
};

function isTokenExpired(token: string): boolean {
    try {
        const payload = jwtDecode<TokenPayload>(token);
        return new Date(payload.exp * 1000) < new Date();
    } catch {
        return true;
    }
}
