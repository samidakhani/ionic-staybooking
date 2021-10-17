/* eslint-disable object-shorthand */
/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from 'src/app/places/location.model';
import { environment } from 'src/environments/environment';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedImage: string;
  isLoading = false;

  constructor(private modalController: ModalController, private http: HttpClient,
    private actionsheetController: ActionSheetController,
    private alertController: ActionSheetController) { }

  ngOnInit() {}

  onPickLocation() {
    this.actionsheetController.create({
      header: 'Please Choose',
      buttons: [
        { text: 'Auto Locate', handler: () => {
            this.onAutoLocate();
         }
        },
        { text: 'Pick a Location', handler: () => {
          this.onChooseLocation();
         }
        },
        { text: 'Cancel', role:'cancel'}
      ]
    }).then((actionsheetEl) => {
      actionsheetEl.present();
    });
  }

  onAutoLocate() {
    Geolocation.getCurrentPosition().then(coordinates => {
      this.locationSelected(coordinates.coords.latitude, coordinates.coords.longitude);
    }).catch(ex => {
      this.alertController.create({
        header: 'Location not available',
        subHeader: 'Please pick a location',
        animated: true,
        mode: 'ios',
        buttons: [
          {text: 'Okay'}
        ]
      }).then(alertEl => {
        alertEl.present();
      });
    });
  }

  onChooseLocation() {
    this.modalController.create({component: MapModalComponent})
    .then((modalEl) => {
      modalEl.onDidDismiss().then((response) => {
        this.locationSelected(response.data.lat, response.data.lng);
      });
      modalEl.present();
    });
  }


  private locationSelected(lat: number, lng: number){
       this.isLoading = true;
       const placeLocation: PlaceLocation = {
         lat: lat,
         lng: lng,
         address: null,
         staticMapUrl: null
       };

       this.getAddress(placeLocation.lat, placeLocation.lng)
        .pipe(switchMap(address => {
          placeLocation.address = address;
          return of(this.getMapUrl(placeLocation.lat, placeLocation.lng, 14));
        })).subscribe((imageurl) => {
          placeLocation.staticMapUrl = imageurl;
          this.selectedImage = imageurl;
          this.isLoading = false;

          this.locationPick.emit(placeLocation);
        });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
        .get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googlemapsKey}`)
        .pipe(map(response => {
          return response.results[0].formatted_address;
        }));
  }

  private getMapUrl(lat: number, lng: number, zoom: number){
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap&markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googlemapsKey}`;
  }

}
