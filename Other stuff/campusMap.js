var map; //map object and setup
var mapBounds = new google.maps.LatLngBounds(
	new google.maps.LatLng(-33.675172, 151.199384),
	new google.maps.LatLng(-33.672149, 151.203021));
var mapMinZoom = 16;
var mapMaxZoom = 21;
var maptiler = new google.maps.ImageMapType({
	getTileUrl: function(coord, zoom) { 
		var proj = map.getProjection();
		var z2 = Math.pow(2, zoom);
		var tileXSize = 256 / z2;
		var tileYSize = 256 / z2;
		var tileBounds = new google.maps.LatLngBounds(
			proj.fromPointToLatLng(new google.maps.Point(coord.x * tileXSize, (coord.y + 1) * tileYSize)),
			proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * tileXSize, coord.y * tileYSize))
			);
		var y = coord.y;
		var x = coord.x >= 0 ? coord.x : z2 + coord.x
		if (mapBounds.intersects(tileBounds) && (mapMinZoom <= zoom) && (zoom <= mapMaxZoom))
			return '/wp-content/plugins/nbcs-map/'+ zoom + "/" + x + "/" + y + ".png";
		else
			return "https://www.maptiler.org/img/none.png";
	},
	tileSize: new google.maps.Size(256, 256),
	isPng: true,
	opacity: 1.0
});
var previousResult = []; // stores array of last ajax call
var markers = []; // array used to store markers
var labels = []; // array used to store labels
var polygons = []; // array used to store polygons
var layers = []; // array used to store layers
var closedplaces = [];

jQuery(document).ready(function($) {

	var NBCSMap = { //getdata function gets data from WP and then passes it on to user.
		getdata: function() {

			this.clear();
			var polygonlocations = this.getpolygonlocations();
			var polygondata = this.getpolygondata();
			var polygonlabels = this.getpolygonlabeldata();
			var classroomlabels = this.getclassroomlabeldata();
			var permission = this.getpermission();
			var visitorlabels = this.getvisitorinfo();
			closedplaces = this.getclosedplaces();

            if (permission == "teacher"){ //teacher shows duty zones and classes on zoomin
            this.addpolygons(polygonlocations,polygondata); //dutyzone polygons
            this.addlabels(polygonlabels,19); // dutyzone labels
            this.addlabels(classroomlabels,20); // classroom labels 
        }
        if (permission == "student"){
            this.addlabels(classroomlabels,20); // classroom labels
            map.setZoom(20); // changes zoom for students to 20 instead of 19
        } 
        if (permission == "visitor"){
            this.addlabels(visitorlabels,19); // visitor labels 
        }
        if (permission == "map-moderator"){
            this.addpolygons(polygonlocations,polygondata); //dutyzone polygons
            this.addlabels(polygonlabels,19); // dutyzone labels
            this.addlabels(classroomlabels,20); // classroom labels	
        }
            this.updatemap(map); // shows added labels,markers & polygons on the map
            this.search();//setupsearch
        },

		initiate: function() { // sets up map object, adds theme, and geolocation of user
		    //NBCSLocation
		    NBCSLocation = new google.maps.LatLng(-33.67355553680444,151.20143140608218)

		    var opts = {
		    	center: NBCSLocation,
		    	zoom: 19,
		    	styles:[{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ffffff"},{"saturation":-100},{"lightness":100}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"hue":"#ffffff"},{"saturation":-100},{"lightness":100}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#e9ebed"},{"saturation":10},{"lightness":69}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#2c2e33"},{"saturation":7},{"lightness":19}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"},{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#dbdbdb"}]}],
		    	streetViewControl: false,
		    	disableDefaultUI: true,
		    	zoomControl: true
		    };
		    map = new google.maps.Map(document.getElementById("nbcs-map"), opts);
		    map.overlayMapTypes.insertAt(0, maptiler);

			//mylocation
			var myloc = new google.maps.Marker({
				title: "You Are Here",  
				clickable: true,
				icon: new google.maps.MarkerImage('/wp-content/plugins/nbcs-map/location.png',
					new google.maps.Size(50,50)),
				shadow: null,
				zIndex: 999,
				map: map
			});

		    //GeoLocation

		    function success(pos) {
		    	var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
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
		    }
		},

		addmarkers: function(locations) {  // adds new locations to marker array with infowindow  (O) 
		    //MarkerMaker
		    var marker, i;
		    var infowindow = new google.maps.InfoWindow({maxWidth: 400, zIndex: 999});
		    google.maps.event.addListener(map, 'click', function() {
		    	infowindow.close();
		    });

		    for (i = 0; i < locations.length; i++) {
		    	marker = new google.maps.Marker({
		    		title: locations[i].title,
		    		position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
		    		map: map,
		    		icon: new google.maps.MarkerImage(locations[i].icon),
		    		zIndex: 999
		    	});

		    	google.maps.event.addListener(marker, 'click', (function(marker, i) {
		    		return function() {
		    			infowindow.setContent('<div class="map-content"><div id="siteNotice"></div><h1 id="firstHeading" class="firstHeading">'+ locations[i].title +'</h1> <div class="map-bodyContent">' + locations[i].description + '</div></div>');
		    			infowindow.open(map, marker);
		    		}
		    	})(marker, i));
		    	markers.push(marker);  
		    }
		}, 

		addpolygons: function(polygonlocations,polygondata) { // adds new polygons to polygon array with info window (O*2)
		    //polygonMaker
		    var polygon, i;
		    var infowindow = new google.maps.InfoWindow({maxWidth: 400, zIndex: 999});
		    for (i = 0; i < polygonlocations.length; i++){
		    var closed = false; // see if open
		    for(var x = 0; x < polygondata.length; x++){
		    	if (polygonlocations[i].title == polygondata[x].title){	
		    		closed = polygondata[x].closed;
		    	}}	

		    	if (closed){ // closed look
		    		var polygon = new google.maps.Polygon({
		    			title: polygonlocations[i].title,  
		    			paths: polygonlocations[i].location,
		    			strokeColor: 0,
		    			strokeOpacity: 0,
		    			strokeWeight: 0,
		    			fillColor: 0,
		    			fillOpacity: 0});
		    		google.maps.event.addListener(map, 'click', function() {
		    			infowindow.close();
		    		});
		    	}

		    	else{ // open look
		    		var polygon = new google.maps.Polygon({
		    			title: polygonlocations[i].title,  
		    			paths: polygonlocations[i].location,
		    			strokeColor: polygonlocations[i].strokeColor,
		    			strokeOpacity: polygonlocations[i].strokeOpacity,
		    			strokeWeight: polygonlocations[i].strokeWeight,
		    			fillColor: polygonlocations[i].fillColor,
		    			fillOpacity: polygonlocations[i].fillOpacity});
		    		google.maps.event.addListener(map, 'click', function() {
		    			infowindow.close();
		    		});
		    	}  	

		    	polygon.addListener('click', (function(polygon,i){
		    		return function(event){
		    			var description;
		    			var title;
		    			var form;
		    			for(var x = 0; x < polygondata.length; x++){
		    				if (polygon.title == polygondata[x].title){	

		      		if(polygondata[x].closed){ // if closed, show closed description
		      			if (polygondata[x].closedDescription == false) polygondata[x].closedDescription = '';
		      			description = polygondata[x].closedDescription;
		      			form = '<form action="" method="post" onSubmit="return NBCSMap.areyousureopen();"><input type="hidden" name="place" value="'+ polygondata[x].id +'"></input><input type="submit" value="Open Zone"></form>';
		      			title = polygon.title + " - Closed!";
		      		} 
		      		else // if open show regular description
		      		{
		      			description = polygondata[x].description;
		      			title = polygon.title;	
		      			form = '<form action="" method="post" onSubmit="return NBCSMap.areyousureclose();"><input type="hidden" name="place" value="'+ polygondata[x].id +'"></input><input type="submit" value="Close Zone"></form>';
		      		}

		      		if (permission == "map-moderator"){
		      			description = description + form;
		      		}
		      	}
		      }
		      infowindow.setContent('<div class="map-content"><h2 id="firstHeading" class="firstHeading">'+ title +'</h1> <div class="map-bodyContent"><p>' + description + '</p></div></div>');
		      infowindow.setPosition(event.latLng);
		      infowindow.open(map, polygon);}})(polygon,i));
		    	polygons.push(polygon);
		    }
		},

   		removepolygon: function(polygondata){ // finds corresponding polygons and removes them (O^2)
   			for (var i = 0; i < polygons.length; i++){
   				for (var j = 0; j < polygondata.length; j++){
   					if (polygons[i].title == polygondata[j].title)
   					{
   						polygons[i].setMap(null);
   						polygons.splice(i,1);
   					}
   				}
   			}
   		},

   		addlabels: function(labeldata,zoomcutoff) { // adds new labels to labels array (O)
		    //labels
		    for (i = 0; i < labeldata.length; i++){

		    	if (closedplaces != null){
		    		for (j = 0; j < closedplaces.length; j++)
		    		{
			    		if (closedplaces[j].title == labeldata[i].text){ // if closed
			    			labeldata[i].text = labeldata[i].text + ' - Closed';
			    		}
			    	}
			    }
			    
			    label = new InfoBox({
			    	content: labeldata[i].text,
			    	boxStyle: {
			    		border: "2px solid rgb(78, 78, 78)",
			    		textAlign: "center",
			    		backgroundColor: "rgb(93, 93, 93)",
			    		fontSize: "10pt",
			    		color: "white",
			    		fontFamily: "'Open Sans',sans-serif",
			    		padding: "0.1em 0.2em",
			    		zIndex: '10',
			    		zoomlimit: zoomcutoff
			    	},
			    	disableAutoPan: true,
			    	pixelOffset: new google.maps.Size(-25, 0),
			    	position: new google.maps.LatLng(labeldata[i].lat,labeldata[i].lng),
			    	closeBoxURL: "",
			    	isHidden: false,
			    	enableEventPropagation: true
			    });

			    if (map.getZoom() >= label.boxStyle_.zoomlimit){label.open(map);}
			    else{label.close(map);}
			    labels.push(label);
			}

			map.addListener('zoom_changed', function() {
				for(var x = 0; x < labels.length; x++){	
					if (map.getZoom() < labels[x].boxStyle_.zoomlimit){
						labels[x].close(map);}
						else{
							labels[x].open(map);}
						}});
		},

		removelabels: function(labeldata){  // finds corresponding labels and removes them (O^2)
			for (var i = 0; i < labels.length; i++){
				for (var j = 0; j < labeldata.length; j++){
					if (labels[i].content_ == labeldata[j].text)
					{
						labels[i].close(map);
						labels.splice(i,1);
					}
				}
			}
		},

		dropmarker: function(){ // used for testing/admin outputs X,Y location to console on click. NBCSMap.dropmarker();
			map.setCenter(new google.maps.LatLng(-33.673435,151.201764));
			var draggablemarker = new google.maps.Marker({
				draggable: true,
				position: new google.maps.LatLng(-33.673435,151.201764), 
				map: map,
				animation: google.maps.Animation.DROP,
				title: "New Marker"
			});
			google.maps.event.addListener(draggablemarker, 'click', function (event) {
				console.log('{"lat": ' + this.getPosition().lat() + ', "lng": ' + this.getPosition().lng() +'},');
			});
		},

		clear: function(){ // remove everything from map
			this.updatemap();
			markers = [];
			for(var x = 0; x < labels.length; x++){labels[x].close(map);}
				labels = [];
			polygons = [];
		},

		updatemap: function(Map){ // update arrays onto map
			for(var x = 0; x < polygons.length; x++){
				polygons[x].setMap(Map);
			}
			for(var x = 0; x < labels.length; x++){
				if (map.getZoom() >= labels[x].boxStyle_.zoomlimit){labels[x].open(map);}
			}
		},

		getpolygondata: function() { // gets polygon data from WP
			return placePolygon;
		},

		getpermission: function(){ // gets user permission from WP
			return permission;
		},
		
		getpolygonlabeldata: function() { // gets polygons label and description data from WP
			return placePolygonName;
		},
		getpolygonlocations: function() {  // gets polygon locations and name from JSon File
			return data;
		},
		getclassroomlabeldata: function() { // gets classroom label locations data from JSon File
			return classrooms;
		},
		getvisitorinfo: function() { // gets visitor label locations data from JSon File
			return visitorinfo;
		},
		getclosedplaces: function() { // gets visitor label locations data from JSon File
			return placeClosed;
		},
		getdutytimes: function() { // gets polygon data from WP
			return dutytimes;
		},
		areyousureopen: function(){
			return confirm('Are you sure you want to open this location?');
		},
		areyousureclose: function(){
			return confirm('Are you sure you want to close this location?');
		},
		search: function(){
			var places = [];
			for (x = 0; x < labels.length; x++){
				places.push(labels[x].content_);	
			}
			jQuery( '#tags' ).autocomplete({source: places});
			return places;
		}
	}

	function ajaxcallUpdate(){
		jQuery.ajax({
			url: '/wp-admin/admin-ajax.php',
			type: 'post',
			data: {
				action: 'load_map'
			},
			success: function( result ) {

				if (result != previousResult)
				{
					jQuery(result).insertAfter('.container');
					previousResult = result;
					NBCSMap.getdata();
					window.NBCSMap = NBCSMap;
				}
			}
		});
			setTimeout(function(){ajaxcallUpdate();}, 10000); // call every 10 seconds
		}

	ajaxcallUpdate(); //start calls
	NBCSMap.initiate(); //initalize map!

});


jQuery( "#tags" ).keyup(function (e) {
	if (e.keyCode == 13) {
		var x = move();
		if (x != null){
			map.setZoom(21);
			map.panTo(new google.maps.LatLng(labels[x].position_.lat(), labels[x].position_.lng()));
		}
		else{
			alert("No Results found!")
		}
	}
});

function move(){
	if (jQuery( "#tags" ).val().toLowerCase() == ""){
		return null
	}
	for (var x = 0; x < labels.length; x++)
	{
		if (labels[x].content_.toLowerCase() == jQuery( "#tags" ).val().toLowerCase()){
			return x;
		}
	}
	return null;
}