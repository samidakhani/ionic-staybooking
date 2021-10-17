import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/booking/booking.service';
import { CreateBookingComponent } from 'src/app/booking/create-booking/create-booking.component';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  placeSubscription: Subscription;
  bookingSubscription: Subscription;

  place: Place;
  isBookable = false;
  placefetched = false;

  constructor(private activatedRoute: ActivatedRoute, private navController: NavController,
    private modalController: ModalController,private actionSheetController: ActionSheetController,
    private loadingContoller: LoadingController,
    private placesService: PlacesService, private bookingService: BookingService,
    private authService: AuthService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')){
        this.navController.navigateBack('/places/tabs/discover');
      }
      const id = paramMap.get('placeId');
      this.placefetched = false;

      let fetchedUserId = null;
      this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
          if(userId == null) {
            throw new Error('UserId not available');
          }
          fetchedUserId = userId;
          return this.placesService.getPlace(id);
        }))
        .subscribe((place) => {
          this.place = place;
          this.placefetched = true;
          this.isBookable = (this.place.userId !== fetchedUserId);
        });
    });
  }

  ngOnDestroy() {
    if(this.placeSubscription){
      this.placeSubscription.unsubscribe();
    }
    if(this.bookingSubscription){
      this.bookingSubscription.unsubscribe();
    }
  }

  onBookPlace() {
    //this.navController.navigateBack('/places/tabs/discover');
    this.actionSheetController.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    .then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  openBookingModal(mode: 'select'| 'random') {
    this.modalController.create({component: CreateBookingComponent,
      componentProps: {selectedPlace: this.place, selectedMode: mode}})
      .then(modalController => {
        modalController.present();
        return modalController.onDidDismiss();
      }).then(result => {
         if(result.role === 'confirm') {
           this.confirmedBooking(result.data.bookingData);
         }
      });
  }

  confirmedBooking(data: any) {
    this.loadingContoller.create({
      message: 'Booking Place...'
    }).then(loadingEl => {
        loadingEl.present();

        this.bookingSubscription = this.bookingService.addBooking(this.place.id,this.place.title, this.place.imageUrl,
          data.firstName, data.lastName, data.guestnumber, data.fromDate, data.toDate)
        .subscribe(() => {
          loadingEl.dismiss();
        });
    });
  }

  onShowFullMap(){
    this.modalController.create({component: MapModalComponent, componentProps: {
      center: {lat: this.place.location.lat, lng: this.place.location.lng},
      selectable: false,
      title: this.place.location.address,
      closeButton: 'Close'
    }})
    .then((modalEl) => {
      modalEl.present();
    });
  }

}
