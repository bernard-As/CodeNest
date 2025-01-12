import { Injectable } from '@angular/core';
import { makeAutoObservable } from 'mobx';
import baseApi from '../utils/axiosInstances';
import { environment } from '../utils/environment';

@Injectable({
  providedIn: 'root', // Singleton shared across the app
})
export class AppStore {
  title = 'CodeNest';
  userLoggedIn = false;
  toastMessage:any = []
  user:any = {
    first_name:'',
    last_name:'',
    image:''
  }
  profileSection = {
    show:false,
    toView:null
  }
  darkMode = false;
  constructor() {
    makeAutoObservable(this);
  }

  get fullName(){
    return this.user.first_name + ' ' + this.user.last_name
  }

  login() {
    this.userLoggedIn = true;
  }

  logout() {
    this.userLoggedIn = false;
    localStorage.clear()
  }

  get welcomeMessage() {
    return this.userLoggedIn
      ? `Welcome back to ${this.title}!`
      : `Welcome to ${this.title}!`;
  }

  addToastMessage(mess:any)
  {
    this.toastMessage.push(mess)
  }
  getToken(){
    return localStorage.getItem('token')
  }
  async verifyToken(){
    
    await baseApi.post('account/verify-token/').then((res:any)=>{
      console.log(res.data.user.image);
      
      this.login()
      if(environment.apiUrl==='http://localhost:8000/')
        res.data.user.image = 'http://localhost:8000' +  res.data.user.image
        this.user = res.data.user
    }).catch((error:any)=>{
      console.log(error);
      
      // this.logout()
    })
      
  }
  showProfile(id:any = null){
    if(id===null)
      this.profileSection.show = true
    else
      this.profileSection.toView = id
  }

  isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor ;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const isMobile = mobileRegex.test(userAgent) || (screenWidth < 768 && screenHeight < 1024);
    return isMobile;
  }
}
