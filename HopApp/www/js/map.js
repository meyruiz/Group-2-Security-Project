  var map;
  var markers;

  function initiateMap() {
  	var DefaultView = new google.maps.LatLng(-33.776059,151.113467)
  	var opts = {
		    	center: DefaultView,
		    	zoom: 19,
		    	streetViewControl: false,
		    	disableDefaultUI: true,
		    	zoomControl: true
		    };
    map = new google.maps.Map(document.getElementById("map"), opts);
  }
  