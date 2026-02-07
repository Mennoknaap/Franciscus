import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../modules/login/login-service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.user()) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};
