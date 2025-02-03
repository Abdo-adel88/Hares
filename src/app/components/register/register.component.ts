import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthServiceService } from 'src/app/service/auth-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  isLoading: boolean = false; // مؤشر تحميل أثناء التسجيل
  apiErrorMessage: string = ''; // رسالة خطأ من السيرفر (إن وجدت)

  // نموذج التسجيل

  constructor(
    private _AuthService: AuthServiceService,
    private _router: Router,
    private messageService: MessageService
  ) {}

  // معالجة تسجيل المستخدم
// نموذج التسجيل
registerForm: FormGroup = new FormGroup({
  email: new FormControl(null, [Validators.required, Validators.email]), // استخدام الإيميل
  password: new FormControl(null, [
      Validators.required,
      Validators.minLength(6),
  ]),
});

handleRegister(registerForm: FormGroup) {
  if (registerForm.valid) {
      this.isLoading = true;
      
      // استدعاء API للتسجيل مع استخدام الإيميل
      this._AuthService.register(registerForm.value).subscribe({
        next: (response) => {
         
          this._AuthService.isLoggedInSubject.next(true);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Register successful!',
            life: 3000,
          });
          this.isLoading = false;
          this.isRegistering=false
        },
        error: (err) => {
          console.log('Register error:', err);
          this.apiErrorMessage = err.error.message || 'Register failed';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.apiErrorMessage,
            life: 5000,
          });
          this.isLoading = false;
        },
      });
  }
}
isRegistering = true;
toggleForm() {
  this.isRegistering = !this.isRegistering;
}
}
