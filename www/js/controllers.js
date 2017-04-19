angular.module('starter.controllers', [])

.controller('MapCtrl',function($scope,$interval,MarkersFactory,TimeTableFactory){
  initiateMap();

  var locations = MarkersFactory.locations();
  $scope.locations = locations;

  var timetable = TimeTableFactory.timetable();
  $scope.timetable = timetable;

  mapupdate(locations); 

  $interval(function(){
      if(inService()){
        $scope.nextStop = "Next Stop:  " + isNextStop(timetable, locations);
      }
      else{
        $scope.nextStop = "Currently not In Service";
      }
  },1000);
  // returns 
  $scope.location = function (id){
    for(var i = 0; i < locations.length; i++){
      if (locations[i].ID == id){
        return locations[i];
        break;
      }
    }
  }

  function inService(){
    var day = moment().format('ddd')
    if (day == 'Sat' | day == 'Sun')
    {
      return false;
    }
    // add more code here for other types of non-service days
    return true; 
  }

  function isNextStop(stops, locations){
  for(var i = 0; i < stops.length; i++){
      if (moment(stops[i].Time,"HH:mm:ss").isAfter(new Date())){
        break;
      }
    }
    
    // Get location id based on current timetable stop
    var id = stops[i].LocationID;
    if (i == 1) {
        updateBusLocation(locations[10].Lat,locations[10].Lng);
    } else updateBusLocation(locations[id-1].Lat,locations[id-1].Lng);
      
    return $scope.location(stops[i].LocationID).Name;
      
  }  
})

.controller('TimeTableCtrl', function($scope,$interval,TimeTableFactory,MarkersFactory) {

  var locations = MarkersFactory.locations();
  $scope.locations = locations;

  var timetable = TimeTableFactory.timetable();
  $scope.timetable = timetable;

  $interval(function(){
    $scope.timetable = timetable;
  },1000);
  // returns 
  $scope.location = function (id){
  	for(var i = 0; i < locations.length; i++){
  		if (locations[i].ID == id){
  			return locations[i];
  			break;
  		}
  	}
  }
  function inService(){
    var day = moment().format('ddd')
    if (day == 'Sat' | day == 'Sun')
    {
      return false;
    }
    // add more code here for other types of non-service days
    return true; 
  }
})

.controller('AboutCtrl', function($scope) {
 
});
