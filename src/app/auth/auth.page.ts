/* eslint-disable object-shorthand */
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService, AuthenticationResponse } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLogin = true;

  constructor(private authService: AuthService, private router: Router,
    private loadingContoller: LoadingController, private alertController: AlertController) { }

  ngOnInit() {}

  onLoginOrSignup(email: string, password: string) {
    this.loadingContoller.create({keyboardClose:true, message: 'Logging in...'})
    .then((loadingEl) => {
      loadingEl.present();

      let authObervable: Observable<AuthenticationResponse>;
      if(this.isLogin){
        authObervable = this.authService.login(email, password);
      } else {
        authObervable = this.authService.signup(email, password);
      }

      authObervable.subscribe((response) => {
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      }, (error) => {
        loadingEl.dismiss();

        // Disply alert
        const code = error.error.error.errors[0].message;
        let message = 'Unable to perform authentication operation.';
        if(code === 'EMAIL_EXISTS'){
          message = 'Email lready exists';
        } else if(code === 'EMAIL_NOT_FOUND'){
          message = 'Email does not exist.';
        } else if(code === 'INVALID_PASSWORD'){
          message = 'Incorrect password.';
        }
        this.displayAlert(message);
      });

    });
  }

  onSwicthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if(!form.valid){
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.onLoginOrSignup(email, password);
    form.resetForm();
  }

  private displayAlert(message: string) {
    this.alertController.create(
      {header: 'Authentication Failure!!',
       message: message,
       buttons: [{text:'Okay'}]
      }).then(alertEl => {alertEl.present();});
  }

}
