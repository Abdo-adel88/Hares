import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthServiceService } from 'src/app/service/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(
    private sanitizer: DomSanitizer,
    private _AuthService: AuthServiceService,
    private _router: Router,

    private messageService: MessageService
  ) {
    this.currentSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.src1);
  }

  apiErrorMessage: string = '';
  isLoading: boolean = false;


  private src1: string =
    'https://lottie.host/embed/6adb8fdb-34db-4a98-89c7-dd8aea8fc5bc/IFmhR7dQod.json';
  private src2: string =
    'https://lottie.host/embed/c1817c02-0292-442c-9678-a06915cda16d/JerYaGQgWv.json';

  currentSrc: SafeResourceUrl;
  isFading: boolean = false;
  private intervalId: any;
  private toggle: boolean = true;
  isRotating: boolean = false;
  ngOnInit(): void {
    this.triggerAnimation();
    // تبديل التأثيرات مع الروابط كل 10 ثوانٍ
    this.intervalId = setInterval(() => {
      this.isFading = true; // التلاشي
      this.isRotating = true; // بدء الدوران

      setTimeout(() => {
        // تغيير الرابط بعد انتهاء التلاشي
        this.currentSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.toggle ? this.src2 : this.src1
        );
        this.toggle = !this.toggle;

        // إنهاء التلاشي بعد 1 ثانية
        this.isFading = false;

        // إنهاء الدوران بعد 1.5 ثانية
        setTimeout(() => {
          this.isRotating = false;
        }, 500);
      }, 1000);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  animate: boolean = false;
  triggerAnimation() {
    this.animate = true;
    setTimeout(() => (this.animate = false), 3000); // Reset after animation duration
  }
  isRegistering = false;
  toggleForm() {
    this.isRegistering = !this.isRegistering;
  }
  
}
