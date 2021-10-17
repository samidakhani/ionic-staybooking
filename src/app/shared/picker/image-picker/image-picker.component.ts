import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string>();
  userPicker: boolean;
  selectedImage: string;

  constructor(private platform: Platform) { }

  ngOnInit() {
    if(this.platform.is('desktop') ||
       (this.platform.is('mobile') && !this.platform.is('hybrid'))){
        this.userPicker = true;
    }
  }

  onPickImage() {
    if(!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }

    Camera.getPhoto({
        quality: 50,
        source: CameraSource.Photos,
        correctOrientation: true,
        height:320,
        width:200,
        resultType: CameraResultType.Base64
    }).then(image => {
        this.selectedImage = image.base64String;
        this.imagePick.emit(this.selectedImage);
    }).catch(error => {
        if(this.userPicker){
          this.filePicker.nativeElement.click();
        }
        return false;
    });
  }

  onImageSelected(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if(!pickedFile) {
      return;
    }

    const fr = new FileReader();
    fr.onload = () => {
        const dataUrl = fr.result.toString();
        this.selectedImage = dataUrl;
        this.imagePick.emit(this.selectedImage);
    };
    fr.readAsDataURL(pickedFile);
  }

}
