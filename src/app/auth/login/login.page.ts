import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  logForm!:FormGroup
  constructor(public _route:Router) { }

  ngOnInit() {
  this.logForm = new FormGroup({
    mobileNumber: new FormControl('')
  })
  }
  logFormData(){
     this._route.navigateByUrl('/otp')
  }
}
