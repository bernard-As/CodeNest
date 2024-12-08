import { Injectable } from '@angular/core';
import { makeAutoObservable } from 'mobx';

@Injectable({
  providedIn: 'root', // Singleton shared across the app
})
export class AppStore {
  title = 'CodeNest';
  userLoggedIn = false;

  constructor() {
    makeAutoObservable(this);
  }

  login() {
    this.userLoggedIn = true;
  }

  logout() {
    this.userLoggedIn = false;
  }

  get welcomeMessage() {
    return this.userLoggedIn
      ? `Welcome back to ${this.title}!`
      : `Welcome to ${this.title}!`;
  }
}
