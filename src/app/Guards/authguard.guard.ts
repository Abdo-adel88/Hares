import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authguardGuard: CanActivateFn = (route, state) => {
  let router = inject(Router);

  if (localStorage.getItem('token')) {
    return true; // ✅ السماح بالوصول إذا كان المستخدم مسجلاً
  } else {
    router.navigate(['/login']);
    return false; // ❌ رفض الوصول إذا لم يكن هناك توكن
  }
};
