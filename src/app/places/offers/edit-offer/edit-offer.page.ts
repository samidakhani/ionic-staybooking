import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  placeSubscription: Subscription;
  form: FormGroup;
  place: Place;
  placefetched = false;

  constructor(private placesService: PlacesService,
    private activatedRoute: ActivatedRoute, private router: Router,
    private navController: NavController, private loadingController: LoadingController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/offers');
      }
      const id = paramMap.get('placeId');
      this.placefetched = false;

      this.placeSubscription =this.placesService.getPlace(id).subscribe(
        (place) => {
        this.place = place;
        this.placefetched = true;

        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(100)]
          })
        });
      });
    });
  }

  ngOnDestroy() {
    if(this.placeSubscription){
      this.placeSubscription.unsubscribe();
    }
  }

  onUpdateOffer() {
    if(!this.form.value) {
      return;
    }

    this.loadingController.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();

      this.placesService.updatePlace(this.place.id, this.form.value.title,
        this.form.value.description).subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/','places','tabs','offers']);
        });
    });
  }
}
