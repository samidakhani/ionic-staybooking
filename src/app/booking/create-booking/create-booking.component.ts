import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select'| 'random';
  @ViewChild('f', {static: true}) form: NgForm;
  startDate: string;
  endDate: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    const availableFrom = this.selectedPlace.availableFrom;
    const availableTo = this.selectedPlace.availableTo;

    if(this.selectedMode === 'random'){
      this.startDate = new Date(
        availableFrom.getTime() +
        Math.random ()* (availableTo.getTime() - (7*24*60*60*1000) - availableFrom.getTime())
      ).toISOString();
      this.endDate = new Date(
        new Date(this.startDate).getTime() +
        Math.random ()* (new Date(this.startDate).getTime() + (6*24*60*60*1000)
                        - new Date(this.startDate).getTime())
      ).toISOString();
    }
  }

  onClose() {
    this.modalController.dismiss(null,'cancel');
  }

  onBook() {
    this.modalController.dismiss({bookingData: {
       firstName : this.form.value.firstname,
       lastName : this.form.value.lastname,
       guestnumber : this.form.value.guestnumber,
       fromDate : new Date(this.form.value.dateFrom),
       toDate : new Date(this.form.value.dateTo)
    } }, 'confirm');
  }

  isDateVaild() {
    const fromDate = this.form.value.dateFrom;
    const toDate = this.form.value.dateTo;
    return toDate > fromDate;
  }
}
