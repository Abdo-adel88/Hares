import { trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit(): void {
    this.triggerAnimation()
  }
  

navigateToLogin() {
  this.router.navigate(['/login']);
}
animate: boolean = false;

triggerAnimation() {
  this.animate = true;
  setTimeout(() => (this.animate = false), 3000); // Reset after animation duration
}
}
