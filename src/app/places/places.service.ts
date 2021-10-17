/* eslint-disable guard-for-in */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {  take, map, delay, tap, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { PlaceLocation } from './location.model';
import { Place } from './place.model';

interface TempPlace {
 title: string;
 description: string;
 imageUrl: string;
 price: string;
 availableFrom: string;
 availableTo: string;
 userId: string;
 location: PlaceLocation;
}


@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Subject<Place[]> = new BehaviorSubject([]);

  constructor(private http: HttpClient, private authService: AuthService) { }

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.http
      .get<{[key: string]: TempPlace}>('https://pairbnb-7d40b-default-rtdb.firebaseio.com/offered-places.json')
    .pipe(
      take(1),
      tap(response => {
        const places: Place[] = [];
        for(const key in response) {
            const tempPlace = response[key];
            const place = new Place(key, tempPlace.title, tempPlace.description,
              tempPlace.imageUrl, +tempPlace.price, new Date(tempPlace.availableFrom),
              new Date(tempPlace.availableTo), tempPlace.userId, tempPlace?.location);
              places.push(place);
          }
        this._places.next(places);
      })
    );
  }

  getPlace(placeId: string) {
    return this.http
      .get<TempPlace>(`https://pairbnb-7d40b-default-rtdb.firebaseio.com/offered-places/${placeId}.json`)
      .pipe(
        take(1),
        map(tempPlace => {
          return  new Place(placeId, tempPlace.title, tempPlace.description,
            tempPlace.imageUrl, +tempPlace.price, new Date(tempPlace.availableFrom),
            new Date(tempPlace.availableTo), tempPlace.userId, tempPlace?.location);
        })
      );
  }



  addPlace(title: string, description: string, price: number, availableFrom: Date,
    availableTo: Date, location: PlaceLocation) {
     let placeId: string;

     let newPlace = null;
     return this.authService.userId.pipe(
       take(1),
       switchMap(userId => {
          if(!userId){
            throw new Error('UserId not available');
          }
          newPlace =  new Place(Math.random.toString(), title, description,
          'https://static.onecms.io/wp-content/uploads/sites/28/2021/02/19/new-york-city-evening-NYCTG0221.jpg'
          ,price, availableFrom, availableTo, userId, location);

          return this.http
          .post<{name: string}>('https://pairbnb-7d40b-default-rtdb.firebaseio.com/offered-places.json', {...newPlace, id: null});
       }),
       switchMap(response => {
        placeId = response.name;
        return this.places;
       }),
       take(1),
       tap(places => {
        newPlace.id = placeId;
        const addedPlaces = places.concat(newPlace);
        this._places.next(addedPlaces);
       }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatePlaces: Place[];

    return this.places
          .pipe(take(1),
                switchMap(places => {
                  if(!places || places.length === 0) {
                    return this.fetchPlaces();
                  } else {
                    return of(places);
                  }
                }),
                switchMap((places: Place[]) => {
                  const updatePlaceIndex = places.findIndex(p => p.id === placeId);
                  updatePlaces = [...places];
                  const oldPlace = updatePlaces[updatePlaceIndex];
                  updatePlaces[updatePlaceIndex] = new Place(
                    oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price,
                    oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId,
                    oldPlace?.location
                  );

                  return this.http
                  .put(`https://pairbnb-7d40b-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,  {...updatePlaces[updatePlaceIndex], id: null})
                }),
                tap(() => {
                  this._places.next(updatePlaces);
                }));
  }
}
