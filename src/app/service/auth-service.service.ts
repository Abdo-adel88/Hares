// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthServiceService {
//   private storageKey = 'chatMessages';

//   getMessages(chatId: string): { text: string; time: string }[] {
//     const allChats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
//     return allChats[chatId] || [];
//   }

//   saveMessages(chatId: string, messages: { text: string; time: string }[]): void {
//     const allChats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
//     allChats[chatId] = messages;
//     localStorage.setItem(this.storageKey, JSON.stringify(allChats));
//   }
//   constructor(private _HttpClient: HttpClient) { }
//   isLoggedInSubject = new BehaviorSubject<boolean>(localStorage.getItem('Token') ? true : false);

//   register(regForm: object): Observable<any> {
//     return this._HttpClient.post("https://ecommerce.routemisr.com/api/v1/auth/signup", regForm);
//   }

//   login(loginForm: object): Observable<any> {
//     return this._HttpClient.post("https://ecommerce.routemisr.com/api/v1/auth/signin", loginForm);
//   }

// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private storageKey = 'chatMessages';
  private baseUrl: string = 'http://localhost:3000'; // رابط السيرفر الخاص بك
  isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn()); // لإدارة حالة تسجيل الدخول

  constructor(private http: HttpClient, private router: Router) {}

  // تسجيل الدخول
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  // تسجيل الخروج
  logout(): void {
    localStorage.removeItem('token'); // إزالة التوكن عند تسجيل الخروج
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']); // إعادة التوجيه إلى صفحة تسجيل الدخول
  }

  // التحقق من تسجيل الدخول
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // إذا كان التوكن موجودًا، المستخدم مسجل دخوله
  }
  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }
  
  // الحصول على بيانات المستخدم
  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');
    return this.http.get(`${this.baseUrl}/profile`, { headers });
  }
  getMessages(chatId: string): { text: string; time: string }[] {
        const allChats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return allChats[chatId] || [];
      }
    
      saveMessages(chatId: string, messages: { text: string; time: string }[]): void {
        const allChats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        allChats[chatId] = messages;
        localStorage.setItem(this.storageKey, JSON.stringify(allChats));
      }
}
