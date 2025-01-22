import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private storageKey = 'chatMessages';

  getMessages(chatId: string): { text: string; time: string }[] {
    const allChats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    return allChats[chatId] || [];
  }

  saveMessages(chatId: string, messages: { text: string; time: string }[]): void {
    const allChats = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    allChats[chatId] = messages;
    localStorage.setItem(this.storageKey, JSON.stringify(allChats));
  }
  constructor(private _HttpClient: HttpClient) { }
  isLoggedInSubject = new BehaviorSubject<boolean>(localStorage.getItem('Token') ? true : false);

  register(regForm: object): Observable<any> {
    return this._HttpClient.post("https://ecommerce.routemisr.com/api/v1/auth/signup", regForm);
  }

  login(loginForm: object): Observable<any> {
    return this._HttpClient.post("https://ecommerce.routemisr.com/api/v1/auth/signin", loginForm);
  }

}
