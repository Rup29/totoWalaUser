declare namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts: MapOptions);
        // Add more members as needed
      }
  
      interface MapOptions {
        center: LatLng | LatLngLiteral;
        zoom: number;
      }
  
      class LatLng {
        constructor(lat: number, lng: number);
      }
  
      class Marker {
        constructor(options: MarkerOptions);
      }
  
      interface MarkerOptions {
        position: LatLng | LatLngLiteral;
        map: Map;
      }
  
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
    }
  }
  