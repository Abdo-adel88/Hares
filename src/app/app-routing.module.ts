import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { authguardGuard } from './Guards/authguard.guard';
import { noautdGuard } from './Guards/noautdGuard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', canActivate: [noautdGuard], component: WelcomeComponent },
  { path: 'home', canActivate: [authguardGuard], component: HomeComponent }, 
  { path: 'chat/:chatId', canActivate: [authguardGuard], component: HomeComponent }, 
  
  { path: 'login', canActivate: [noautdGuard], component: LoginComponent },
  { path: 'register', canActivate: [noautdGuard], component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
