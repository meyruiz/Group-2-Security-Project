  var map;
  var markers = []; // array used to store markers
  var paths = []; // array used to store paths
  var me;
  var buslocation;
  var campusCoords = [
    {lat: -33.764072383997075, lng: 151.12569787310792},
    {lat: -33.76378696794087, lng: 151.09578587817384},
    {lat: -33.78169498379249, lng: 151.09557130145265},
    {lat: -33.78419182009234, lng: 151.1250112276001}
  ];

  function initiateMap() {
  	var DefaultView = new google.maps.LatLng(-33.77286630035477,151.11149289416505);
  	var opts = {
		    	center: DefaultView,
		    	zoom: 16,
		    	streetViewControl: false,
		    	disableDefaultUI: true,
		    	zoomControl: true
		    };
    map = new google.maps.Map(document.getElementById("map"), opts);

    //mylocation
    var myloc = new google.maps.Marker({
      title: "You Are Here",
      clickable: true,
      icon: new google.maps.MarkerImage('location.png',
            new google.maps.Size(50,50)),
      shadow: null,
      zIndex: 999,
      map: map
    });

    //GeoLocation
    function success(pos) {
      me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      myloc.setPosition(me);
    };
    function error(err) {
    };

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(success,error,options);
      navigator.geolocation.getCurrentPosition(CenterMap);
    }

  }

  function CenterMap(position){
    var campusBorder = new google.maps.Polygon({paths: campusCoords});
    var currentlocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if(google.maps.geometry.poly.containsLocation(currentlocation, campusBorder)){
      map.setCenter(currentlocation, 16);
    }
  }

  function mapupdate(data){
    addmarkers(data);
    addpaths(data);
  }


  function addmarkers(locations) {
      // clear markers
      remove(markers);
      markers = [];
      // adds new locations to marker array
      var marker, i;
      for (i = 0; i < locations.length; i++) {
          marker = new google.maps.Marker({
          title: locations[i].Name,
          position: new google.maps.LatLng(locations[i].Lat, locations[i].Lng),
          icon: 'img/' + locations[i].Icon
        });

      var infowindow = new google.maps.InfoWindow({maxWidth: 400, zIndex: 999});
      google.maps.event.addListener(map, 'click', function() {infowindow.close();});

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(locations[i].Name);
          infowindow.open(map, marker);
          }
        })(marker, i));

        markers.push(marker);
        marker.setMap(map);
      }
  }

  function remove(items){
     for(i = 0; i < items.length; i++){
      items[i].setMap(null);
    }
  }

  function addpaths(locations){
    remove(paths);
    paths = [];
    for (i = 0; i < locations.length; i++) {
      if (locations[i].Paths.length != 0){
        var path = new google.maps.Polyline({
          path: locations[i].Paths,
          geodesic: true,
          strokeColor: locations[i].Color,
          strokeOpacity: 1.0,
          strokeWeight: 7
        });
        path.setMap(map);
      }
      paths.push(path);
    }
  }

  function dropmarker(){ // used for testing/admin outputs X,Y location to console on click. NBCSMap.dropmarker();
      map.setCenter(new google.maps.LatLng(-33.776059,151.113467));
      var draggablemarker = new google.maps.Marker({
        draggable: true,
        position: new google.maps.LatLng(-33.776059,151.113467),
        map: map,
        animation: google.maps.Animation.DROP,
        title: "New Marker"
      });
      google.maps.event.addListener(draggablemarker, 'click', function (event) {
        console.log('{"lat": ' + this.getPosition().lat() + ', "lng": ' + this.getPosition().lng() +'},');
      });
    }
