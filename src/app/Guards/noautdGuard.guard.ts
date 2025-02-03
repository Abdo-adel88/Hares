import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noautdGuard: CanActivateFn = (route, state) => {
  let router = inject(Router);

  if (!localStorage.getItem('token')) {
    return true; // ✅ السماح بالوصول إذا لم يكن هناك توكن
  } else {
    router.navigate(['/home']);
    return false; // ❌ رفض الوصول إذا كان المستخدم مسجلاً بالفعل
  }
};
