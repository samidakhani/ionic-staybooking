import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OffersPage } from './offers.page';
import { RouterModule, Routes } from '@angular/router';
import { OfferItemComponent } from './offer-item/offer-item.component';

const routes: Routes = [{
  path: '',
  component: OffersPage
 }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OffersPage, OfferItemComponent]
})
export class OffersPageModule {}
