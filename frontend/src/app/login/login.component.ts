import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import baseApi from '../../utils/axiosInstances';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,InputTextModule,MessageModule,
    CommonModule,FormsModule,ButtonModule,
    PasswordModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError: boolean = false;
  errorText = '';
  showPassword = false
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
    const response = await baseApi.post('/login')
    console.log(response);
    
  }
}
