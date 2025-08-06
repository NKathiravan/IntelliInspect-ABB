import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ Import Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLoginMode = true;
  message = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router // ✅ Inject Router here
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.message = '';
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.http.post('http://localhost:5144/api/Auth/login', this.loginForm.value, { withCredentials: true }).subscribe({
      next: () => {
        this.message = 'Login successful!';
        this.router.navigate(['/master']); // ✅ This will now work
      },
      error: err => this.message = err.error || 'Login failed'
    });
  }

  onSignup() {
    if (this.signupForm.invalid) return;

    this.http.post('http://localhost:5144/api/Auth/register', this.signupForm.value).subscribe({
      next: () => {
        this.message = 'Registration successful!';
        this.toggleMode();
      },
      error: err => this.message = err.error || 'Signup failed'
    });
  }
}
