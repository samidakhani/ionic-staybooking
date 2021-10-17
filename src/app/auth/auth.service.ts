/* eslint-disable @typescript-eslint/type-annotation-spacing */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Storage } from '@capacitor/storage';

export interface AuthenticationResponse {
  idToken:	string;
  email:	string;
  refreshToken:	string;
  expiresIn:	string;
  localId:	string;
  registered?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user: Subject<User> = new BehaviorSubject(null);
  private timeoutHandler: any;

  constructor(private http: HttpClient) { }

  ngOnDestroy() {
    if(this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }
  }

  get userAutehnticated() {
    return this._user.asObservable().pipe(map(user => {
      if(user) {
        return !!user.token;
      } else {
        return false;
      };
    }));
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if(user) {
        return user.id;
      } else {
        return null;
      };
    }));
  }

  signup(email: string, password: string) {
    return this.http
    .post<AuthenticationResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseKey}`,
    {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(tap(this.createUser.bind(this)));
  }

  login(email: string, password: string) {
    return this.http
    .post<AuthenticationResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseKey}`,
    {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(tap(this.createUser.bind(this)));
  }

  autoLogin() {
    return from(Storage.get({ key: 'authenticationData' }))
     .pipe(map(authdata => {
            if(!authdata || !authdata.value) {
              return null;
            }

            const parseddata = JSON.parse(authdata.value) as { userId: string; email: string;
                                token: string; tokenExpirationDate: string;};
            const tokenExpirationDate = new Date(parseddata.tokenExpirationDate);
            if(tokenExpirationDate <= new Date()) {
              return null;
            }

            return new User(parseddata.userId, parseddata.email, parseddata.token, tokenExpirationDate);
          }),
          tap(user => {
            if(user) {
              this._user.next(user);
              this.autologout(user.timeoutDuration);
            }
          }),
          map(user=> {return !!user;})
     );
  }

  logout() {
    if(this.timeoutHandler){
      clearTimeout(this.timeoutHandler);
    }

    Storage.remove({key: 'authenticationData'});
    this._user.next(null);
  }

  autologout(duration: number) {
    if(this.timeoutHandler){
      clearTimeout(this.timeoutHandler);
    }

    this.timeoutHandler = setTimeout(() => {
      this.logout();
    }, (duration));
  }

  private createUser(response: AuthenticationResponse) {
    const tokenExpirationDate = new Date(new Date().getTime() + (+response.expiresIn * 1000));
    const user = new User(response.localId, response.email, response.idToken, tokenExpirationDate);
    this._user.next(user);
    this.autologout(user.timeoutDuration);
    this.storeUser(user.id, user.email, user._token, user.tokenExpirationDate.toISOString());
  }

  private storeUser(userId: string, email: string, token: string, tokenExpirationDate: string) {
    const authdata = JSON.stringify({
      userId: userId,
      email: email,
      token: token,
      tokenExpirationDate: tokenExpirationDate
    });
    Storage.set({key: 'authenticationData', value: authdata});
  }
}
