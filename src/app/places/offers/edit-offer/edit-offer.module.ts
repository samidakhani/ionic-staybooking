import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { EditOfferPage } from './edit-offer.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  component: EditOfferPage
 }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditOfferPage]
})
export class EditOfferPageModule {}
