import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from 'src/app/service/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoading = true;
  chatList = [
    { id: '1', name: 'Abdo Adel', msg: '', time: '12.30 pm', numMsg: '66' },
    { id: '2', name: 'Ahmed Ali', msg: '', time: '12.30 pm', numMsg: '66' },
    { id: '3', name: 'Sara Mohamed', msg: '', time: '12.30 pm', numMsg: '66' },
  ];

  currentChatId: string | null = null;
  currentChatName: string | null = null;
  messages: { text: string; time: string }[] = [];
  newMessage: string = '';
  selectedMessageIndex: number | null = null;
  isEditing: boolean = false;
  editingMessageIndex: number | null = null;

  constructor(private chatService: AuthServiceService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  loadMessages(chatId: string): void {
    this.currentChatId = chatId;
    const chat = this.chatList.find(c => c.id === chatId);
    this.currentChatName = chat ? chat.name : null;
    this.messages = this.chatService.getMessages(chatId);
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

      this.chatService.saveMessages(this.currentChatId, this.messages);
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
      this.chatService.saveMessages(this.currentChatId, this.messages);
      this.updateChatListLastMessage(this.currentChatId);
      this.selectedMessageIndex = null;
    }
  }
}


