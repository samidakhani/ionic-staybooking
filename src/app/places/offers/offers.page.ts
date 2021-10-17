import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  placeSubscription: Subscription;
  offers: Place[];

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.placeSubscription = this.placesService.places.subscribe(
      (places) => {
        this.offers = places;
      }
    );
  }

  ionViewDidEnter() {
    this.placesService.fetchPlaces().subscribe();
  }

  ngOnDestroy() {
    if(this.placeSubscription){
      this.placeSubscription.unsubscribe();
    }
  }

  onEditOffer(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places','tabs','offers', 'edit',offerId]);
  }

}
