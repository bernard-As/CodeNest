import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import baseApi from '../../utils/axiosInstances';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { ToastModule } from 'primeng/toast';
import { AppStore } from '../app.store';
import { InputOtpModule } from 'primeng/inputotp';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,InputTextModule,MessageModule,
    CommonModule,FormsModule,ButtonModule,
    PasswordModule,AnimateOnScrollModule,ToastModule,
    InputOtpModule,DialogModule,ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers:[MessageService]
})

export class LoginComponent {
  constructor(public appStore: AppStore,
    private messageService: MessageService
   ){}
  email: string = '';
  password: string = '';
  auth_code: string = '';
  loginError: boolean = false;
  errorText = '';
  showPassword = false
  showCodePanel = false
  // Simulated login function (you should replace this with actual authentication logic)
  // onLogin() {
  //   if (this.email.trim() === '' || this.password.trim() === '') {
  //     this.loginError = true;
  //     return;
  //   }

  //   // Simulate a login check (replace this with actual login logic)
  //   if (this.email === 'admin' && this.password === 'password') {
  //     this.loginError = false;
  //     alert('Login successful');
  //   } else {
  //     this.loginError = true;
  //   }
  // }
  showToast(mess:any) {
    this.messageService.add({
      severity: mess.severity,
      summary: mess.summary,
      detail: mess.detail,
      life: mess.life
    });

  }
  async onLogin () {
    if (this.email.trim() === ''){
      this.errorText = 'Email field cannot be empty'
      this.loginError = true;
      return;
    }
    
    if (!this.email.trim().endsWith('@rdu.edu.tr')) {
      this.errorText = 'Email must be an rdu.edu.tr email'
      this.loginError = true;
      return;
    }
    let data:any = {
      "email": this.email.trim(),
    }
    if(this.showCodePanel&&this.auth_code.trim()===''){
      this.errorText = 'Authentication code cannot be empty'
      this.showToast({
        severity:'error',
        detail:'Authentication code cannot be empty',
        life:2500
      })
      this.loginError = true;
      return
    }else if(this.showCodePanel)
    data.auth_code = this.auth_code
    if(this.showPassword&&this.password.trim()===''){
      this.errorText = 'Password cannot be empty'
      this.loginError = true;
      return
    }else if(this.showPassword)
    data.password = this.password

    const response = await baseApi.post('account/login/',data)
    
    if(response.status===400){
      const res:any = response;
      const message = res.response.data.message;
      
      if(message==='err_pwd'){
        this.errorText = 'Invalid password'
      }else if(message==='err_nd_pwd'){
        this.errorText = 'Password required'
        this.showPassword = true
      }else if(message==='err_auth_code'){
        this.errorText = 'Invalid authentication code'
        this.showToast({
          severity:'error',
          detail:'Invalid authentication code',
          life:2500
        })
          this.showCodePanel = true
      }else if(message==='err_nd_auth'){
          this.errorText = 'Authentication code required'
          this.showToast({
            severity:'error',
            detail:'Authentication code required',
            life:2500
          })
          this.showCodePanel = true
      }
      
      else if(response.data.message)
        this.errorText = response.data.message
      else
        this.errorText = 'Email or password is incorrect'
      this.loginError = true;
      return;
      // this.appStore.addToastMessage('Unexpeted error. Please try later')
    }else if(response.status ===200){
      const message = response.data.message
      if(message==='email_verif'){
        this.showCodePanel=true,
        this.errorText = 'Email verification code sent to your email'
        this.auth_code=''
      }

      if(response.data.token){
        localStorage.setItem('token',response.data.token)
        this.appStore.addToastMessage('Login successful')
        this.appStore.login()
        window.location.href='/'
      }
    }

  }
}
