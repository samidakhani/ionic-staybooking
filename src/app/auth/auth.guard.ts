/* eslint-disable arrow-body-style */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router){}

  canLoad(route: Route, segments: UrlSegment[]):
       Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.authService.userAutehnticated.pipe(
        take(1),
        switchMap(authenticated => {
          if(!authenticated){
            return this.authService.autoLogin();
          }
          return of(authenticated);
        }),
        tap(authenticated => {
          if(!authenticated) {
            this.router.navigateByUrl('/auth');
          }
        }));
  }
}
