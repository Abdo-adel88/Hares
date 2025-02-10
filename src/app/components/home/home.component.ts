import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoading = true;
  users: any[] = []; // قائمة المستخدمين المسجلين
  chatList: any[] = []; // قائمة الدردشة
  currentChatId: string | null = null;
  currentChatName: string | null = null;
  messages: {
    senderId: string;
    timestamp: number;
    message: any;
    text: string;
    time: string;
    
  }[] = [];
  newMessage: string = '';
  selectedMessageIndex: number | null = null;
  isEditing: boolean = false;
  editingMessageIndex: number | null = null;
  loggedInUserId: string = '';
  private messageSubscription: Subscription | null = null;

  constructor(
    private _chatService: AuthServiceService,
    private router: Router,
    
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  
    this.getUsers();
  
    // الاستماع للرسائل الجديدة
    this.messageSubscription = this._chatService
      .listenForMessages()
      .subscribe((message) => {
        if (message.recipient === this.currentChatId) {
          // تحقق من عدم إضافة الرسالة نفسها مرة أخرى
          if (!this.messages.some((msg) => msg.timestamp === message.timestamp)) {
            this.messages.push(message);
            this.updateLocalStorage();
          }
        }
      });
  
    this.loggedInUserId = this._chatService.getLoggedInUserId(); // تأكد من أن هذه الدالة تُرجع البريد الإلكتروني
    console.log("Logged in user ID:", this.loggedInUserId); // تحقق من القيمة
  }
  

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  getUsers(): void {
    this._chatService.getUsers().subscribe((users) => {
      console.log("Users from server:", users);
  
      this.loggedInUserId = this._chatService.getLoggedInUserId(); // ✅ استرجاع البريد الإلكتروني
      console.log("Logged in user ID:", this.loggedInUserId);
  
      // ✅ استبعاد المستخدم الحالي من قائمة المستخدمين
      this.users = users.filter(user => user.email !== this.loggedInUserId);
      console.log("Filtered users:", this.users);
  
      let localStorageData = JSON.parse(localStorage.getItem('chats') || '{}');
  
      this.chatList = this.users.map((user) => {
        let userMessages = localStorageData[user.id] || [];
  
        let lastMessage = userMessages.length > 0
          ? userMessages.reduce((latest: any, msg: any) => 
              new Date(msg.timestamp).getTime() > new Date(latest.timestamp).getTime() ? msg : latest
            , userMessages[0])
          : null;
  
        return {
          id: user.id.toString(),
          name: user.email,
          msg: lastMessage ? String(lastMessage.text) : 'لا توجد رسائل',
          time: lastMessage ? (lastMessage.time || new Date(lastMessage.timestamp).toLocaleTimeString()) : '',
          numMsg: userMessages.length.toString()
        };
      });
  
      console.log("🔹 Updated Chat List:", this.chatList);
    });
  }
  
  
  
  
  

  loadMessages(chatId: string): void {
    this.currentChatId = chatId;
    const chat = this.chatList.find((c) => c.id === chatId);
    this.currentChatName = chat ? chat.name : null;
  
    // تحميل الرسائل من localStorage
    const storedMessages = JSON.parse(localStorage.getItem('chats') || '{}');
    this.messages = storedMessages[chatId] ? [...storedMessages[chatId]] : [];
  
    // ✅ ضمان وجود senderId في كل رسالة
    this.messages = this.messages.map(msg => ({
      ...msg,
      senderId: msg.senderId || this.loggedInUserId // تأكد أن كل رسالة تحتوي على senderId
    }));
  
    console.log("Loaded messages from localStorage:", this.messages);
  
    // جلب الرسائل من السيرفر مع تجنب التكرار
    this._chatService.getMessages(chatId).subscribe((serverMessages) => {
      const localMessageSet = new Set(this.messages.map(msg => JSON.stringify(msg)));
      const filteredServerMessages = serverMessages.filter(msg => 
        msg.hasOwnProperty('text') && msg.hasOwnProperty('time') && !localMessageSet.has(JSON.stringify(msg))
      );
  
      // ✅ ضمان أن كل رسالة من السيرفر تحتوي على senderId
      filteredServerMessages.forEach(msg => {
        if (!msg.hasOwnProperty('senderId')) {
          msg.senderId = 'unknown'; // أو أي قيمة افتراضية
        }
      });
  
      this.messages = [...this.messages, ...filteredServerMessages];
  
      this.updateLocalStorage();
    });
  }
  
  
  
  

  sendMessage(): void {
    if (this.newMessage.trim() !== '' && this.currentChatId) {
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours());
      const currentTime = currentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  
      const newMsg = {
        senderId: this.loggedInUserId, // ✅ أضف معرف المرسل
        timestamp: Date.now(),
        message: this.newMessage,
        text: this.newMessage,
        time: currentTime,
      };
  
      if (newMsg.text.trim() !== '') {
        this.messages.push(newMsg);
        this.updateLocalStorage(); // ✅ تحديث التخزين المحلي
  
        // ✅ تحديث قائمة المحادثات فورًا بدلاً من انتظار تحديث الصفحة
        const chatIndex = this.chatList.findIndex(chat => chat.id === this.currentChatId);
        if (chatIndex !== -1) {
          this.chatList[chatIndex].msg = newMsg.text;
          this.chatList[chatIndex].time = newMsg.time;
          this.chatList[chatIndex].numMsg = (parseInt(this.chatList[chatIndex].numMsg, 10) + 1).toString();
        }
  
        console.log("🔹 Updated Chat List after sending message:", this.chatList);
  
        this._chatService.sendMessage(
          this.currentChatId,
          this.currentChatId,
          this.newMessage
        );
      }
  
      this.newMessage = ''; // مسح حقل الإدخال بعد الإرسال
    }
  }
  
  

  toggleOptions(index: number): void {
    this.selectedMessageIndex =
      this.selectedMessageIndex === index ? null : index;
  }

  editMessage(index: number): void {
    this.newMessage = this.messages[index].text;
    this.isEditing = true;
    this.editingMessageIndex = index;
    this.selectedMessageIndex = null;
  }

  deleteMessage(index: number): void {
    if (this.currentChatId) {
      const deletedMessage = this.messages[index];
  
      console.log("Deleting message:", deletedMessage); // 👈 تحقق من البيانات المرسلة
  
      this.messages.splice(index, 1);
      this.updateLocalStorage();
  
      this._chatService.deleteMessage(deletedMessage).subscribe(() => {
        console.log("Message deleted from server.");
      }, error => {
        console.error("Failed to delete message from server:", error);
      });
    }
  }
  
  

 
  clearCache(): void {
    localStorage.removeItem('chats');
    localStorage.removeItem('chatMessages');
    console.log("Cache Cleared");
  }
  updateLocalStorage(): void {
    if (this.currentChatId) {
      let allChats = JSON.parse(localStorage.getItem('chats') || '{}');
  
      if (this.messages.length > 0) {
        allChats[this.currentChatId] = [
          ...this.messages.filter(
            (msg, index, self) =>
              index === self.findIndex((m) => m.timestamp === msg.timestamp)
          ),
        ]; // إزالة الرسائل المكررة بناءً على `timestamp`
      } else {
        delete allChats[this.currentChatId];
      }
  
      localStorage.setItem('chats', JSON.stringify(allChats));
  
      console.log("Updated Local Storage:", JSON.parse(localStorage.getItem('chats') || '{}'));
    }
  }
  
  

  logout(): void {
    this._chatService.logout();
  }
}
