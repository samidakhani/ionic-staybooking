import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { BookingPage } from './booking.page';

const routes: Routes = [
  {
    path: '',
    component: BookingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class BookingPageRoutingModule {}
