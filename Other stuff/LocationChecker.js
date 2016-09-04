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
var myloc;
var closedplaces = [];
var previousResult = []; // stores array of last ajax call
var markers = []; // array used to store markers
var labels = []; // array used to store labels
var polygons = []; // array used to store polygons
var layers = []; // array used to store layers
var me;
var schedule =[];
var currentDuty;
var updatedDuty;
var year;
var month;
var day;
var min;
var hour; 
var currentcheckedin = []; 
jQuery(document).ready(function($) {
var NBCSMap = { //getdata function gets data from WP and then passes it on to user.
		getdata: function() {

			this.clear();
			var polygonlocations = this.getpolygonlocations();
			var permission = this.getpermission();
			schedule = this.getdutytimes();
			this.theClock(); 

			if (permission == "duty-manager"){
            this.openplaces();	
            this.addpolygons(polygonlocations,currentcheckedin); // dutyzone polygons
            var polygonlabels = this.getpolygonlabeldata();
            this.addlabels(polygonlabels,18); // dutyzone labels
            this.updatemap(map);
            }

            else if (permission == "teacher" || "map-moderator"){
            var polygondata = this.getpolygondata();
            this.addpolygons(polygonlocations,polygondata); //dutyzone polygons
            }  
		},

		initiate: function() { // sets up map object, adds theme, and geolocation of user
		    //NBCSLocation
		    NBCSLocation = new google.maps.LatLng(-33.67355553680444,151.20143140608218);

		    var opts = {
		        center: NBCSLocation,
		        zoom: 18,
		        styles:[{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ffffff"},{"saturation":-100},{"lightness":100}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"hue":"#ffffff"},{"saturation":-100},{"lightness":100}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#e9ebed"},{"saturation":10},{"lightness":69}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#2c2e33"},{"saturation":7},{"lightness":19}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"},{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#dbdbdb"}]}],
		        streetViewControl: false,
		        disableDefaultUI: true,
		        zoomControl: true
		    };
			  map = new google.maps.Map(document.getElementById("nbcs-map"), opts);
			  map.overlayMapTypes.insertAt(0, maptiler);

			//mylocation
		    myloc = new google.maps.Marker({
		    title: "You Are Here",  
		    clickable: true,
		    icon: new google.maps.MarkerImage('/wp-content/plugins/nbcs-map/location.png',
		        new google.maps.Size(50,50)),
		    shadow: null,
		    zIndex: 999,
		    map: map
		    });
		},

		locate: function() {
		    //GeoLocation

		    function success(pos) {
			    me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
				if (permission == "duty-manager"){myloc.setPosition(me);}
				else{updatepolygonlocation();}
			    };
			function error(err) {
			    //alert("Please Enable Location Services to Validate Check-in")
			    if (permission != "duty-manager"){updatepolygonlocation();}	
				};

			var options = {
			    	enableHighAccuracy: true,
  					timeout: 5000,
  					maximumAge: 0
				};

		    if (navigator.geolocation) {
			    navigator.geolocation.getCurrentPosition(success,error,options);
			}
		    else{
			    //alert("Please Enable Location Services to Validate Check-in")
			    if (permission == "duty-manager"){updatepolygonlocation();}
		    }	
		    },

		addpolygons: function(plocations,pdata) { // adds new polygons to polygon array with info window (O*2)
		    //polygonMaker
		    var polygon, i,j;
		    for (i = 0; i < plocations.length; i++){
		   		var closed = true;
		    	for (j = 0; j < pdata.length; j++){
		    	 	if (pdata[j].title == plocations[i].title && pdata[j].closed==false){
				    	closed = false;
				    }
				}
				    if (closed  == true){
						polygon = new google.maps.Polygon({
							title: plocations[i].title,  
							paths: plocations[i].location,
							strokeColor: '#000000',
							strokeOpacity: 1 ,
							strokeWeight:0,
							fillColor: '#FF0000',
							fillOpacity: 0.5});
						}
						else{
						polygon = new google.maps.Polygon({
							title: plocations[i].title,  
							paths: plocations[i].location,
							strokeColor: '#000000',
							strokeOpacity: 1 ,
							strokeWeight:0,
							fillColor: '#00FF00',
							fillOpacity: 0.5});	
						}
				    	polygons.push(polygon);
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
		      border: "2px solid rgba(78, 78, 78)",
		      textAlign: "center",
		      backgroundColor: "rgba(93, 93, 93,0.7)",
		      fontSize: "7pt",
		      color: "white",
		      fontFamily: "'Open Sans',sans-serif",
		      padding: "0.0em 0.2em",
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

		updatemap: function(Map){ // update arrays onto map
			for(var x = 0; x < polygons.length; x++){
			polygons[x].setMap(Map);
			}
			for(var x = 0; x < labels.length; x++){
			if (map.getZoom() >= labels[x].boxStyle_.zoomlimit){labels[x].open(map);}
			}
		},

   		theClock: function() {
            var self = this;
            var today=new Date();
            hour=today.getHours();
            min=today.getMinutes();
            year=today.getFullYear();
            var dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday" ];
            var da=dayNames[today.getDay()];
            day=today.getDate();
            var monthNames = [ "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December" ];
            month=monthNames[today.getMonth()];
            min = this.checkTime(min);
            hour= this.checkTime(hour);
            $('.clock').html(hour+":"+min);
            $('.day').html(da+" "+day+" "+month);
            currentDuty = this.checkDuty(hour,min);

        		// if a teacher
            	if (permission != 'map-moderator' && permission != 'duty-manager'){
            		if (currentDuty == null){
            			jQuery( "#checkinform :input").prop( "disabled", true );
             			$('.duty').html("No Current Duty");
            		}
            		else if (this.alreadyCheckedIn() != null){
            			jQuery( "#checkinform :input").prop( "disabled", true );
            			$('.duty').html("You are Checked into " + this.alreadyCheckedIn() + " for " + currentDuty);
            		}
            		else{
        			$('.duty').html("Duty: "+currentDuty);
            		jQuery( "#checkinform :input").prop( "disabled", false );
        			}
        		}
        		// if a map-moderator
        		else if (permission == 'map-moderator'){
        			if (currentDuty == null){$('.duty').html("Map Moderator Checkin:<br><br>Duty: No Current Duty");}
        			else{$('.duty').html("Map Moderator Checkin:<br><br>Duty: "+currentDuty);}
        			jQuery( "#checkinform :input").prop( "disabled", false );
        		}
        		else if (permission == 'duty-manager'){
        			if (currentDuty == null){$('.duty').html("Duty: No Current Duty");}
        			else{$('.duty').html("Duty: "+currentDuty);}
        			jQuery( "#checkinform :input").prop( "disabled", false );
        		}
            var t = setTimeout(function(){self.theClock()},500);
        },

        checkTime: function(i) {
            if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
            return i;
        },

        checkDuty: function(h,m){
        	for (var i = 0; i < schedule.length; i++){
        		if ((h <= schedule[i].endHour) && (h >= schedule[i].startHour)) // hour correct
        		{
        			if ((h == schedule[i].endHour) && (m > schedule[i].endMin)){}
        			else if ((h == schedule[i].startHour) && (m < schedule[i].startMin)){}
        			else {return schedule[i].name;}
        		}
        	}
        	return null;
        },

        alreadyCheckedIn : function(){
        	if (last_checkin === undefined || last_checkin === null) return null;
        	if ((last_checkin[5] == year) && (last_checkin[4] == day) && (last_checkin[3] == month)){
        		if (this.checkDuty(last_checkin[1],last_checkin[2]) == currentDuty){
        			return last_checkin[0];
        		}
        	}
        	else {return null;} 
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

		openplaces: function(){
			jQuery("#duty-manager-table > tbody").html("");
			currentcheckedin = [];
			var checkedInDuties = this.getcheckins();
			for (var i = 0; i < checkedInDuties.length; i++){
				if ((checkedInDuties[i].day == day) && (checkedInDuties[i].month == month) && (checkedInDuties[i].year == year)){ // post is from current day
					if (currentDuty == this.checkDuty(checkedInDuties[i].hour,checkedInDuties[i].min)){
						currentcheckedin.push(checkedInDuties[i]);
						var form = "<center><form action='' method='post' id='checkoutform' onSubmit='return NBCSMap.areyousure();'><input type='hidden' name='id' value="+checkedInDuties[i].id+"'><input id='removeduty' class='submissionButton' type='submit' value='X'></form></center>"
						jQuery('#duty-manager-table').append('<tr><td>'+checkedInDuties[i].title+'</td><td>'+checkedInDuties[i].username+'</td><td>'+checkedInDuties[i].hour+': '+checkedInDuties[i].min+'</td><td>'+ form +'</td></tr>');
					}
				}
			}
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

		getpolygonlabeldata: function() { // gets polygons label and description data from WP
			return placePolygonName;
		},

		getpolygondata: function() { // gets polygon data from WP
		 	return placePolygon;
		},

		getroamingDutys: function() { // gets polygon data from WP
		 	return roamingdutys;
		},

		getpermission: function(){ // gets user permission from WP
			return permission;
		},

		getpolygonlocations: function() {  // gets polygon locations and name from JSon File
			return data;
		},
		getdutytimes: function() { // gets polygon data from WP
		 	return dutytimes;
		},
		getcheckins: function() { // gets polygon data from WP
		 	return checkins;
		},
		areyousure: function(){
		return confirm('Are you sure you want to remove this Checkin?');
		},

		areyousurecheckin: function(){
		var place = document.getElementById("selectLocation").value;
		return confirm('You have checked into ' + place);
		},

	}

	function isinsideapolygon(loc){
			if (loc === null | loc === undefined){
				
			}
			else{
				for(var x = 0; x < polygons.length; x++){
					if(google.maps.geometry.poly.containsLocation(loc, polygons[x]))
					{
						return x;
					}
				} 
			}
		}

	function ajaxcallUpdate(){
		if (permission != 'duty-manager'){
			NBCSMap.getdata();
			window.NBCSMap = NBCSMap;
		}
		NBCSMap.locate();
	}
	function updatepolygonlocation(){
		var select = document.getElementById("selectLocation");
		var currentpolygonlocation = isinsideapolygon(me);
		if (currentpolygonlocation != null){
			temp = polygons[currentpolygonlocation];
			polygons[currentpolygonlocation] = polygons[0];
			polygons[0] = temp;
		}
		jQuery( "#selectLocation" ).empty();
		for(var x = 0; x < polygons.length; x++){
		var opt = polygons[x].title;
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);	
		}
		var roamingdutys = NBCSMap.getroamingDutys();
		for(var x = 0; x < roamingdutys.length; x++){
		var opt = roamingdutys[x].title;
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
		jQuery( "#checkinform").prop( "disabled", false);		
		}		
	}

	
	function ajaxcallCheckins(){
			jQuery.ajax({
				url: '/wp-admin/admin-ajax.php',
				type: 'post',
				data: {
					action: 'load_checkin'
				},
				success: function( result ) {

					if ((result != previousResult) || (updatedDuty != currentDuty))
					{
						jQuery(result).insertAfter('.top-bar');
						previousResult = result;
						NBCSMap.getdata();
						window.NBCSMap = NBCSMap;
						updatedDuty = currentDuty;
					}
					setTimeout(function(){ajaxcallCheckins();}, 5000); // call every 5 seconds
				}
			});
	}	

	ajaxcallUpdate(); // only happens once

	if(permission == 'duty-manager'){
	ajaxcallCheckins();
	NBCSMap.initiate();
	}

});

jQuery('#selectLocation').on('change', function() {
  for(var i = 0; i < placePolygon.length; i++){
  	if (placePolygon[i].title == this.value && placePolygon[i].closed == true){
  		alert(placePolygon[i].closedCheckinAlert);
  		var selectedDuty = jQuery("#selectLocation").prop("selectedIndex");
  		if (selectedDuty == 0){
  			selectedDuty = 1;
  		}
  		else{
  			selectedDuty = 0;
  		}
  		jQuery( "#selectLocation").prop("selectedIndex", selectedDuty);
  	}
  }
});