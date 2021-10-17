import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit, OnDestroy {
  bookingSubscription: Subscription;
  bookings: Booking[];

  constructor(private bookingService: BookingService,
    private loadingController: LoadingController) { }

  ngOnInit() {
    this.bookingSubscription = this.bookingService.bookings.subscribe(b => {
      this.bookings = b;
    });
  }

  ionViewDidEnter() {
    this.bookingService.fetchBookings().subscribe();
  }

  ngOnDestroy(): void {
    if(this.bookingSubscription) {
      this.bookingSubscription.unsubscribe();
    }
  }

  onCancelBooking(bookingId: string, slidingItem: IonItemSliding) {
    this.loadingController.create({
      message: 'Canceling Booking...'
    }).then((loadingEl) => {
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() =>{
        this.loadingController.dismiss();
        slidingItem.close();
      });
    });

  }
}
