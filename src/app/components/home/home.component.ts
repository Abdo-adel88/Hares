import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoading = true;
  users: any[] = []; // قائمة المستخدمين المسجلين
  chatList: any[] = []; // قائمة الدردشة التي سيتم تحديثها لاحقًا

  currentChatId: string | null = null;
  currentChatName: string | null = null;
  messages: { text: string; time: string }[] = [];
  newMessage: string = '';
  selectedMessageIndex: number | null = null;
  isEditing: boolean = false;
  editingMessageIndex: number | null = null;

  constructor(private _chatService: AuthServiceService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  
    this.getUsers(); // جلب المستخدمين عند تحميل الصفحة
  
    // إعادة تحميل المستخدمين كل 5 ثوانٍ لضمان تحديث القائمة عند تسجيل مستخدم جديد
    setInterval(() => {
      this.getUsers();
    }, 5000);
  }
  

  getUsers(): void {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(
      (response) => {
        this.users = response;
        
        // تحديث chatList فقط إذا لم يكن المستخدم مضافًا مسبقًا
        response.forEach(user => {
          if (!this.chatList.some(chat => chat.id === user.id.toString())) {
            this.chatList.push({
              id: user.id.toString(),
              name: user.email,
              msg: '',
              time: '',
              numMsg: '0'
            });
          }
        });
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  

  updateChatList(): void {
    this.chatList = this.users.map(user => ({
      id: user.id.toString(), // تحويل الـ id إلى نص لتجنب الأخطاء
      name: user.email, // استخدام الإيميل كاسم في الدردشة
      msg: '', // لا توجد رسائل في البداية
      time: '', // لا يوجد وقت في البداية
      numMsg: '0' // عدد الرسائل 0 في البداية
    }));
  }

  loadMessages(chatId: string): void {
    this.currentChatId = chatId;
    const chat = this.chatList.find(c => c.id === chatId);
    this.currentChatName = chat ? chat.name : null;
    this.messages = this._chatService.getMessages(chatId);
    this.updateChatListLastMessage(chatId);
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '' && this.currentChatId) {
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 2);
      const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      if (this.isEditing && this.editingMessageIndex !== null) {
        this.messages[this.editingMessageIndex].text = this.newMessage;
        this.messages[this.editingMessageIndex].time = currentTime;
        this.isEditing = false;
        this.editingMessageIndex = null;
      } else {
        this.messages.push({ text: this.newMessage, time: currentTime });
      }

      this._chatService.saveMessages(this.currentChatId, this.messages);
      this.updateChatListLastMessage(this.currentChatId);
      this.newMessage = '';
    }
  }

  updateChatListLastMessage(chatId: string): void {
    const chat = this.chatList.find(c => c.id === chatId);
    if (chat && this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1];
      chat.msg = lastMessage.text;
      chat.time = lastMessage.time;
    }
  }




  toggleOptions(index: number): void {
    this.selectedMessageIndex = this.selectedMessageIndex === index ? null : index;
  }

  editMessage(index: number): void {
    this.newMessage = this.messages[index].text;
    this.isEditing = true;
    this.editingMessageIndex = index;
    this.selectedMessageIndex = null;
  }

  deleteMessage(index: number): void {
    if (this.currentChatId) {
      this.messages.splice(index, 1);
      this._chatService.saveMessages(this.currentChatId, this.messages);
      this.updateChatListLastMessage(this.currentChatId);
      this.selectedMessageIndex = null;
    }
  }

  logout() {
    localStorage.removeItem('token');  // حذف التوكن من localStorage
    sessionStorage.removeItem('token'); // إذا كنت تستخدم sessionStorage أيضًا
    this.router.navigate(['/login']); // إعادة توجيه المستخدم إلى صفحة الـ Welcome
  }
}
