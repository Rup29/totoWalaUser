import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
  logForm!:FormGroup
  constructor(private alertController: AlertController, public _route:Router) { }

  ngOnInit() {
    this.logForm = new FormGroup({
      otp1: new FormControl(''),
      otp2: new FormControl(''),
      otp3: new FormControl(''),
      otp4: new FormControl(''),
    })
  }
  logFormData(){
    this.presentAlert()
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Verification Successful',
      message: 'Your OTP is Sucessfully verified',
      buttons: [
        {
          text: 'OK',
          role: 'cancel', // Optional: sets the role for the button
          handler: () => {
             this._route.navigateByUrl('/home')
          }
        }
      ]
    });

    await alert.present();
  }
}
