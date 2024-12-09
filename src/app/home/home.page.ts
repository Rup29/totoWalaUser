import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild, NgZone, OnDestroy, asNativeElements } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { MapServiceService } from 'src/services/map-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { ToastController } from '@ionic/angular';
register();
 declare const google: any; // Declare the google variable
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mapLoad:boolean = false
  yourlocation:string =  'Your Location';
  sitNumber:number = 0;
  liveDuration:any;
  liveKm:any;
  selectSit:boolean = false;
  livePrice:any;
  pkLocation:any;
  drpLocation:any;
  tripConfirm:boolean = false
  tripStart:boolean = true;
  tripSearch:boolean = false
  googleMaps: any;
  sourceIcon:any;
  sourceLatLog:any;
  destLatLog:any;
  source: any = { lat: '', lng: ''};
  dest: any = { lat: '', lng: '' }
  directionsService: any;
  directionsDisplay: any;
  findDriver:boolean = false;
  modalIsOpen:boolean = false
  searchForm!:FormGroup;
  searchPopForm!:FormGroup
  map!: google.maps.Map;
  pickUp:boolean = false;
  dropOf:boolean = false;
  @ViewChild('map', {static: true}) mapElementRef!: ElementRef;
  @ViewChild('setpick', {static: true}) setpickInput!: ElementRef;
  seacrh:any;
   // Array of marker positions
   private markers: Array<{ lat: number; lng: number; label: string }> = [
    { lat: 40.7128, lng: -74.0060, label: 'Marker 1' }, // NYC
    { lat: 34.0522, lng: -118.2437, label: 'Marker 2' }, // LA
    { lat: 41.8781, lng: -87.6298, label: 'Marker 3' }   // Chicago
  ];
// place API Variable
places:any = [];
datetime:any
query!: string;
placesSub!: Subscription;
private _places = new BehaviorSubject<any[]>([]);

get search_places() {
  return this._places.asObservable();
}
  constructor(private toastController: ToastController,private alertController: AlertController,private maps: MapServiceService,private zone: NgZone, public _rout:Router,  private renderer: Renderer2) {
  }


  ngOnInit(){
  
   // palce Api
   this.placesSub = this.search_places.subscribe({
    next: (places) => {
      this.places = places;
    },
    error: (e) => {
      console.log(e);
    }
  });
  //initilize
  this.searchForm = new FormGroup({
    pickUp: new FormControl('Your Location',[Validators.required]),
    dropUp: new FormControl('',[Validators.required]),
  });
  this.searchPopForm  = new FormGroup({
    pkValue: new FormControl('Your Location'),
    drValue: new FormControl ('')
  });
  this.loadMap()
  }
  // getLocation
  getCurrentLocation(){
    this.loadMap()
  }
  // get Place User Input
  async onChangepk(event: any) {
  this.pickUp = true;
  this.dropOf = false;
    this.query = event.target.value;
    if(this.query.length > 0) await this.getPlaces();
  }
  async onChangedp(event: any) {
    this.pickUp = false;
    this.dropOf = true;
    this.query = event.target.value;
    if(this.query.length > 0) await this.getPlaces();
  }
  async loadMap() {

   
    try{
      const coordinates = await Geolocation.getCurrentPosition();
      localStorage.setItem('currentLoc', JSON.stringify(coordinates))
      // maps Style
      const mapStyles = [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#2d2c2c"
            }
          ]
        },
        
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#ffc409"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
           
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ffffff"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#7285a3"
            }
          ]
        }
      ];
      
      
      let googleMaps: any = await this.maps.loadGoogleMaps();
      const mapEl = this.mapElementRef.nativeElement;
      // if(mapEl){
      //   this.mapLoad = false;      
      // }
      // else{
      //   this.mapLoad = true;
      // }
     this.map = new googleMaps.Map(mapEl, {
        center: new google.maps.LatLng( coordinates.coords.latitude, coordinates.coords.longitude ),
        disableDefaultUI: true,
        mapTypeControl: false,
        fullscreenControl:false,
        zoom: 15,
        zoomControl: false,
        styles: mapStyles, // Apply the custom styles here
      });
    
       if(this.searchForm.valid){
        this.directionsService = new googleMaps.DirectionsService;
        this.directionsDisplay = new googleMaps.DirectionsRenderer;
        this.directionsDisplay = new googleMaps.DirectionsRenderer();
        const source_position = new googleMaps.LatLng(this.source.lat, this.source.lng);
        const destination_position = new googleMaps.LatLng(this.dest.lat, this.dest.lng);
  
        this.sourceIcon = {
          url: "../../assets/images/placeholder.png",
          scaledSize: new googleMaps.Size(30, 30), // scaled size
          origin: new googleMaps.Point(0, 0), // origin
          anchor: new googleMaps.Point(10, 20) // anchor
        };
        const destination_icon = {
          url: "../../assets/images/placeholder.png",
          scaledSize: new googleMaps.Size(30, 30), // scaled size
          origin: new googleMaps.Point(0, 0), // origin
          anchor: new googleMaps.Point(10, 20) // anchor
        };
        const source_marker = new googleMaps.Marker({
          map: this.map,
          position: source_position,
          animation: googleMaps.Animation.DROP,
          icon: this.sourceIcon,
        });
  
        const destination_marker = new googleMaps.Marker({
          map: this.map,
          position: destination_position,
          animation: googleMaps.Animation.DROP,
          icon: destination_icon
        });
  
        source_marker.setMap(this.map);
        destination_marker.setMap(this.map);
  
        this.directionsDisplay.setMap(this.map);
        this.directionsDisplay.setOptions({
          polylineOptions: {
            strokeWeight: 6,
            strokeOpacity: 1,
            strokeColor: '#ffcd0b'
          },
          suppressMarkers: true
        });
  
        await this.drawPolyline();
  
        // this.map.setCenter(source_position);
        this.renderer.addClass(mapEl, 'visible');
       }
      else{
        const source_icon = {
          url: "../../assets/images/current.png",
          // url: "../../assets/images/toto.png",
          scaledSize: new googleMaps.Size(100, 100), // scaled size
          origin: new googleMaps.Point(0, 0), // origin
          anchor: new googleMaps.Point(10, 20) // anchor
        };
        new google.maps.Marker({
           position: { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude },
           map: this.map,
           icon: source_icon,
     
       });

        //  this.markers.forEach(marker =>{
        //   console.log(marker.lat);
          
        //   new google.maps.Marker({
        //     position: { lat: marker.lat, lng: marker.lng },
        //     map: this.map,
        //     title: marker.label,
        //     icon: source_icon,
        //   })
        //  })
 
      }
   
      
    }
    catch(error) {
      this.presentAlert();
      console.error('Error getting location', error);
      console.error('ok');
    }
   
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: '! Network Error',
      message: 'Plese check your network connection and re open the application',
      buttons: [
        {
          text: 'OK',
          role: 'cancel', // Optional: sets the role for the button
          handler: () => {
             this.loadMap();
          }
        }
      ]
    });

    await alert.present();
  }
  async getPlaces() {
    try {
      let service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: this.query,
        componentRestrictions: {
          country: 'IN'
        }
      }, (predictions:any) => {
        let autoCompleteItems:any = [];
        this.zone.run(() => {
          if(predictions != null) {
            predictions.forEach(async(prediction:any) => {
              console.log('prediction: ', prediction);
              let latLng: any = await this.geoCode(prediction.description);
              const places = {
                title: prediction.structured_formatting.main_text,
                address: prediction.description,
                lat: latLng.lat,
                lng: latLng.lng
              };
              console.log('places: ', places);
              autoCompleteItems.push(places);
            });
            // this.places = autoCompleteItems;
            // console.log('final places', this.places);
            // rxjs behaviorSubject
            this._places.next(autoCompleteItems);
          }
        });
      });
    } catch(e) {
      console.log(e);
    }
  }

  geoCode(address:any) {
    let latlng = {lat: '', lng: ''};
    return new Promise((resolve, reject) => {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address' : address}, (results:any) => {
        console.log('results: ', results);
        latlng.lat = results[0].geometry.location.lat();
        latlng.lng = results[0].geometry.location.lng();
        resolve(latlng);
      });
    });
  }


  ngOnDestroy(): void {
    if(this.placesSub) this.placesSub.unsubscribe();
  }
  serchDeriction(){

   if(localStorage.getItem('pickUpLocation')){
    const getSorce:any = localStorage.getItem('pickUpLocation')
    this.sourceLatLog = JSON.parse(getSorce)
    this.source = { lat:+this.sourceLatLog.lat, lng:+this.sourceLatLog.lng};
  }
   else{
    const getSorce:any = localStorage.getItem('currentLoc')
    this.sourceLatLog = JSON.parse(getSorce)
    this.source = { lat:+this.sourceLatLog.coords.latitude, lng:+this.sourceLatLog.coords.longitude};
   }
    const destSorce:any = localStorage.getItem('dropOfLocation')
    this.destLatLog = JSON.parse(destSorce)
    this.dest = { lat:+this.destLatLog.lat, lng:+this.destLatLog.lng}
    this.loadMap();
    setTimeout(()=>{
      localStorage.removeItem('pickUpLocation')
      localStorage.removeItem('dropOfLocation')
    },2000)
    this.tripConfirm = true;
    this.tripSearch = false
    // this._rout.navigate(['/map'])

    
  }
  selectPickup(place: any) {
   this.modalIsOpen = false;
   this.pkLocation = place.title
    localStorage.setItem('pickUpLocation', JSON.stringify(place))
    // Do something with the selected place, e.g., set it to the form
    this.searchForm.patchValue({
      pickUp: place.title,
    });
    this.searchPopForm.patchValue({
      pkValue: place.title
    });
    this.places = []; // Clear the suggestions
  }
  selectDrop(place: any){
    this.modalIsOpen = false;
    this.drpLocation = place.title
    
    localStorage.setItem('dropOfLocation', JSON.stringify(place))
    // Do something with the selected place, e.g., set it to the form
    this.searchForm.patchValue({
      dropUp: place.title // Optionally clear the drop-up field
    });
    this.searchPopForm.patchValue({
      drValue: place.title
    });
    this.places = []; // Clear the suggestions
  }
  openModal(){
   console.log("ok");
   
    this.modalIsOpen = true
  }

  drawPolyline() {
    this.directionsService.route({
      origin: this.source,
      destination: this.dest,
      travelMode: 'DRIVING',
      provideRouteAlternatives: true
    }, (response:any, status:any) => {
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
        console.log('response: ', response);
        const directionsData = response.routes[0].legs[0];
        const distance = directionsData.distance.text;
        const duration = directionsData.duration.text;
        this.liveDuration = duration;
        this.liveKm  = distance;
        const numericPart = distance.replace(/ km/g, '').trim();
        // Convert to number
        const distanceNumber = parseFloat(numericPart);
        this.livePrice = distanceNumber
      
      } else {
        console.log(status);
      }
    });
  }
  tripStartFun(){
    this.tripStart = false
   this.tripSearch =  true;
  }
  downPop(){
     document.getElementById('bottomSer')?.classList.toggle('customHeight')
     
  }
  back(){
     this.modalIsOpen = false
  }
  async pkupCurrentLocation() {
    try {
      localStorage.removeItem('pickUpLocation')
      const selectCurrentLocation = await Geolocation.getCurrentPosition();
      console.log(selectCurrentLocation);
      localStorage.setItem('currentLoc', JSON.stringify(selectCurrentLocation))
      this.searchPopForm.patchValue({
        pkValue: 'Your Location'
      })
      this.searchForm.patchValue({
        pickUp: 'Your Location',
      });

      // // Fetching location details
      // this.maps.getLocationDetailsPkup(selectCurrentLocation.coords.latitude, selectCurrentLocation.coords.longitude).subscribe(
      //   (data) => {
      //     console.log(data);
      //     this.searchForm.patchValue({
      //       pickUp: data.results[0].formatted_address,
      //     });
      //   },
      //   (error) => {
      //     console.error('Error fetching location details:', error);
      //   }
      // );
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }
  choosePrivate(){

  }
  chooseShare(){
  this.selectSit = true
  }
  removeSit(){
    if (this.sitNumber > 0) {
      this.sitNumber = this.sitNumber - 1;
    }
  }
  addSit(){
    this.sitNumber = this.sitNumber +1
  }
  async findingSit(){
    this.selectSit = false;
    this.findDriver = true;
    document.getElementById('bottomSer')?.classList.add('disable')
    console.log(  this.findDriver);
    
    setTimeout(async ()=>{
      const toast = await this.toastController.create({
        message: 'Accept by Driver',
        duration: 2000,
        position: 'bottom',
      });
  
      await toast.present();
      this.findDriver = false;
      document.getElementById('bottomSer')?.classList.remove('disable')
    },5000)
 
    console.log(  this.findDriver);
  }
}
