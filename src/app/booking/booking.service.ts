/* eslint-disable eqeqeq */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { delay, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Booking } from './booking.model';


interface TempBooking {
  dateFrom: string;
  dateTo: string;
  firstName: string;
  guestNumber: string;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private _bookings: Subject<Booking[]> = new BehaviorSubject([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchBookings() {
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if(userId == null){
          throw new Error('UserId not found');
        }

        return this.http
        .get<{[key: string]: TempBooking}>(`https://pairbnb-7d40b-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${userId}"`);
      }),
      tap(response => {
        const bookings: Booking[] = [];
        for(const key in response) {
            const tempBooking = response[key];
            const booking = new Booking(key, tempBooking.placeId, tempBooking.userId,
              tempBooking.placeTitle, tempBooking.placeImage,
              tempBooking.firstName, tempBooking.lastName, +tempBooking.guestNumber,
              new Date(tempBooking.dateFrom), new Date(tempBooking.dateTo));
            bookings.push(booking);
          }
        this._bookings.next(bookings);
      })
    );
  }

  addBooking(placeId: string, placeTitle: string, placeImage: string,
    firstName: string, lastName: string, guestNumber: number, dateFrom: Date, dateTo: Date) {

    let booking = null;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
          if(userId == null){
            throw new Error('UserId not available');
          }

          booking = new Booking(Math.random().toString(), placeId, userId, placeTitle, placeImage, firstName,
                                lastName, guestNumber, dateFrom, dateTo);
          return this.http
            .post<{name: string}>('https://pairbnb-7d40b-default-rtdb.firebaseio.com/bookings.json', {...booking, id: null});
      }),
      switchMap(response => {
        booking.id = response.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        const addedBookings = bookings.concat(booking);
        this._bookings.next(addedBookings);
      }));
  }

  cancelBooking(bookingId: string) {
    return this.http
    .delete(`https://pairbnb-7d40b-default-rtdb.firebaseio.com/bookings/${bookingId}.json`)
    .pipe(
      switchMap(response => {
      return this.bookings;
      }),
     take(1),
     tap(bookings => {
      const remaningBookings = bookings.filter(b => {b.id !==  bookingId;});
      console.log(remaningBookings);
      this._bookings.next(remaningBookings);
     })
    );
  }
}
