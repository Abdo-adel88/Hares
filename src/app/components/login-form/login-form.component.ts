import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  constructor(
    private sanitizer: DomSanitizer,
    private _AuthService: AuthServiceService,
    private _router: Router,

    private messageService: MessageService
  ) {
    
  }

  apiErrorMessage: string = '';
  isLoading: boolean = false;

  // loginForm: FormGroup = new FormGroup({
  //   email: new FormControl(null, [Validators.email, Validators.required]),
  //   password: new FormControl(null, [Validators.required, Validators.pattern(/^[A-z].{5,}$/)]),
  // })

  userName: any;

  // handleLogin(loginForm: FormGroup) {
  //   if (loginForm.valid) {
  //     this.isLoading = true;
  //     this._AuthService.login(loginForm.value).subscribe({
  //       next: (Response) => {
  //         localStorage.setItem('token', Response.token);
  //         this._AuthService.isLoggedInSubject.next(true);
  //         this._router.navigate(['/home']);

  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'نجاح',
  //           detail: 'تم تسجيل الدخول بنجاح'
  //         });

  //         this.isLoading = false; // إيقاف مؤشر التحميل بعد الانتهاء
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         this.apiErrorMessage = err.error.message;

  //         // عرض Toast عند الخطأ
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'خطأ',
  //           detail: this.apiErrorMessage || 'حدث خطأ أثناء تسجيل الدخول'
  //         });

  //         this.isLoading = false; // إيقاف مؤشر التحميل بعد الخطأ
  //       },
  //     });
  //   }
  // }
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  handleLogin(loginForm: FormGroup) {
    if (loginForm.valid) {
      this.isLoading = true;

      this._AuthService.login(loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          this._AuthService.isLoggedInSubject.next(true);
          this._router.navigate(['/home']);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful!',
            life: 3000,
          });
          this.isLoading = false;
        },
        error: (err) => {
          console.log('Login error:', err);
          this.apiErrorMessage = err.error.message || 'Login failed';
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
  isRegistering = false;
  toggleForm() {
    this.isRegistering = !this.isRegistering;
  }
  login() {
    this.isLoading = true;
    this._AuthService.login(this.loginForm.value).subscribe(
      (response) => {
        localStorage.setItem('userEmail', response.email);
        this._router.navigate(['/home']);
      },
      (error) => {
        this.isLoading = false;
        this.apiErrorMessage = error.error.message;
      }
    );
  }
  
}
