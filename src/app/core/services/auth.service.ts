import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}


interface LoginResponse {
  accessToken: string;
  user: User;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private _currentUser = signal<User | null>(this.getSavedUser());
  
  currentUser = this._currentUser.asReadonly();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  login(email: string, password: string): Observable<boolean> {
    return this.http.get<User[]>(`http://localhost:3000/users?email=${email}`).pipe(
      map(users => {
        const user = users[0];
        const fakeToken = `${btoa(email + ':' + password)}`;
        
        if (user && password === 'password') {
          const response: LoginResponse = {
            accessToken: fakeToken,
            user
          };
          
          this.setSession(response);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }
  
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth']);
  }
  
  checkAuthStatus(): Observable<boolean> {
    if (!this.hasToken()) {
      return of(false);
    }

    return of(true)
  }
  
  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }
  
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
  
  private getSavedUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    
    return null;
  }
} 