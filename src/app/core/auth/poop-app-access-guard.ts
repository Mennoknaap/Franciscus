import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth-service';

export const poopAppAccessGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isInitialized.pipe(
        filter(initialized => initialized),
        take(1),
        map(() => {
            if (!authService.user()) {
                router.navigate(['/login']);
                return false;
            }

            if (!authService.user()?.grantedApps?.includes('poop-app')) {
                router.navigate(['/home']);
                return false;
            }

            return true;
        }),
    );
};
