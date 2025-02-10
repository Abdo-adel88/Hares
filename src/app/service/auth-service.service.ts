import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private storageKey = 'chatMessages';
  private baseUrl: string = 'http://localhost:3000'; // رابط السيرفر الخاص بك
  private socket: Socket;

  isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn()); // لإدارة حالة تسجيل الدخول
  currentUser: any;

  constructor(private http: HttpClient, private router: Router) {
    this.socket = io(this.baseUrl); // الاتصال بالخادم
  }


// في AuthServiceService
// في AuthServiceService
login(credentials: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
    tap((response: any) => {
      if (response.token) {
        localStorage.setItem('token', response.token);
        this.currentUser = response.user; // تعيين المستخدم الحالي
        this.isLoggedInSubject.next(true);
      }
    })
  );
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

  // تسجيل مستخدم جديد
  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  // الحصول على بيانات المستخدم
  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');
    return this.http.get(`${this.baseUrl}/profile`, { headers });
  }

  // تسجيل المستخدم في Socket.IO
  registerUser(email: string): void {
    this.socket.emit('register-user', email);
  }

  // إرسال رسالة
  sendMessage(sender: string, recipient: string, message: string): void {
    this.socket.emit('send-message', { sender, recipient, message });
  }

  // استقبال رسائل جديدة
  listenForMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receive-message', (message) => {
        observer.next(message);
      });
    });
  }

  // جلب جميع المستخدمين
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  // جلب الرسائل بين مستخدمين معينين
  getMessages(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/messages/${email}`);
  }
  
  deleteMessage(message: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete-message`, message);
  }

// في AuthServiceService
getLoggedInUserId(): string {
  console.log("Current user:", this.currentUser); // تحقق مما إذا كان `currentUser` يحتوي على بيانات المستخدم
  return this.currentUser ? this.currentUser.email : '';
}

  
}