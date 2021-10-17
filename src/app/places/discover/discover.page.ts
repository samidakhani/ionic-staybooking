/* eslint-disable arrow-body-style */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { SegmentChangeEventDetail} from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  placeSubscription: Subscription;

  loadedPlaces: Place[];
  listLoadedPlaces: Place[];
  relevantPlaces: Place[];
  segementSelected = 'all';

  constructor(private placesService: PlacesService,
    private menuController: MenuController, private authService: AuthService) { }

  ngOnInit() {
    this.placeSubscription = this.placesService.places.subscribe(
      (places) => {
        this.loadedPlaces = places;
        this.relevantPlaces = this.loadedPlaces;
        this.listLoadedPlaces = this.relevantPlaces.slice(1);
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

  onMenuOpen() {
    this.menuController.toggle('menu1');
  }

  onFilterChanged(event: CustomEvent<SegmentChangeEventDetail>) {
    this.segementSelected = event.detail.value;

    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if(userId == null) {
        throw new Error('UserId not available');
      }

      if(event.detail.value === 'all'){
        this.relevantPlaces = this.loadedPlaces;
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(place => {
            return place.userId !== userId;
        });
      }
      this.listLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

}
