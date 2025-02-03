import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // تسجيل مستخدم جديد
  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  // تسجيل الدخول
  login(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, user);
  }

  // الحصول على بيانات المستخدم
  getProfile(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(`${this.baseUrl}/profile`, { headers });
  }
}
