/* eslint-disable no-var */
/* eslint-disable object-shorthand */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from '../../location.model';
import { PlacesService } from '../../places.service';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  var sliceSize = 1024;
  var byteCharacters = atob(base64Data);
  var bytesLength = byteCharacters.length;
  var slicesCount = Math.ceil(bytesLength / sliceSize);
  var byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);

      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}


@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(private placesService: PlacesService, private router: Router,
    private loadingController: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(100)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        //validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }

  onCreateOffer() {
    if(!this.form.value) {
      return;
    }
    console.log(this.form.value);

    this.loadingController.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();

      this.placesService.addPlace(this.form.value.title,this.form.value.description,
        +this.form.value.price, new Date(this.form.value.dateFrom),
        new Date(this.form.value.dateTo), this.form.value.location).subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/','places','tabs','offers']);
        });
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({location: location});
  }

  onImagePicked(imageData: string) {
    const finalImage = imageData.replace('data:image/jpeg;base64,','');
    const imageFile =base64toBlob(finalImage ,'image/jpeg');
    this.form.patchValue({image: imageFile});
  }

}
