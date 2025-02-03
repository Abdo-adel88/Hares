import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEmojiPickerModule } from 'ngx-emoji-picker';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SkeletonModule } from 'primeng/skeleton';
import { ChatsComponent } from './components/chats/chats.component';
import { LoginFormComponent } from './components/login-form/login-form.component';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    WelcomeComponent,
    ChatsComponent,
    LoginFormComponent,
    
  ],
  imports: [
    ToastModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    SkeletonModule,
      ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
