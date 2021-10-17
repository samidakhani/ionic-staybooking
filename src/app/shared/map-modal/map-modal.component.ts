/* eslint-disable object-shorthand */
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  @Input() selectable = true;
  @Input() center = { lat:42.6680631, lng:-73.880721};
  @Input() title = 'Pick a location';
  @Input() closeButton = 'Cancel';

  googleMaps: any;
  clickListener: any;

  constructor(private modalContoller: ModalController, private renderer: Renderer2) { }

  ngOnInit() {}

  onClose(){
    this.modalContoller.dismiss();
  }

  ngOnDestroy() {
    this.googleMaps.event.removeListener(this.clickListener);
  }

  ngAfterViewInit(): any {
    this.getGoogleMaps()
    .then((googleMaps) => {
      this.googleMaps = googleMaps;
      const mapDiv = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapDiv, {
        center: this.center,
        zoom: 8
      });

      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapDiv, 'visible');
      });

      if(this.selectable) {
        this.clickListener = map.addListener('click', (event) => {
          const coordinates = {lat: event.latLng.lat(), lng: event.latLng.lng()};
          this.modalContoller.dismiss(coordinates);
        });
      }else {
        const marker = new googleMaps.Marker({
          position: this.center,
          map: map,
          title: 'Picked Location'
        });
        marker.setMap(map);
      }

    })
    .catch(error => {
      console.log(error);
    });
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if(googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googlemapsKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleMaps = win.google;
        if(loadedGoogleMaps && loadedGoogleMaps.maps) {
          resolve(loadedGoogleMaps.maps);
        } else {
          reject('Google Maps SDK not loaded');
        }
      };

    });

  }
}
