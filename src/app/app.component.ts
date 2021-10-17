import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthService } from './auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  authSubscription: Subscription;
  private previousAuthState = false;

  constructor(private authService: AuthService, private router: Router,
      private platform: Platform) {
        this.initializeApp();
      }

  ngOnInit(): void {
    this.authService.userAutehnticated.subscribe(authenticated => {
      if(!authenticated && this.previousAuthState !== authenticated) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = authenticated;
    });
  }

  ngOnDestroy(): void {
    if(this.authSubscription){
      this.authSubscription.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.show({
          showDuration: 5000,
          autoHide: false,
        });
      }
    });
  }

  onLogOut() {
    this.authService.logout();
  }
}
