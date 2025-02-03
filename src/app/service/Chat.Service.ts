import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket = io('http://localhost:3000');

  registerUser(userId: string) {
    this.socket.emit('register-user', userId);
  }

  sendMessage(data: any) {
    this.socket.emit('send-message', data);
  }

  receiveMessage(callback: (data: any) => void) {
    this.socket.on('receive-message', callback);
  }
}
