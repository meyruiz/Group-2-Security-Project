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
        $scope.nextStop = "Next Stop:  " + isNextStop(timetable);
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

  function isNextStop(stops){
  for(var i = 0; i < stops.length; i++){
      if (moment(stops[i].Time,"HH:mm:ss").isAfter(new Date())){
        break;
      }
    }
    return $scope.location(stops[i].LocationID).Name;
  } 
  updateBusLocation(-33.77286630035477,151.11149289416505); 
})

.controller('TimeTableCtrl', function($scope,$interval,$stateParams,TimeTableFactory,MarkersFactory) {

  var locations = MarkersFactory.locations();
  $scope.locations = locations;

  var timetable = TimeTableFactory.timetable();
  $scope.timetable = timetable;

  $scope.id = $stateParams.id;

  $interval(function(){
    $scope.timetable = timetable;
    if(inService()){
        $scope.inService = "";
    }
    else{
        $scope.inService = "- Currently not In Service";
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
})

.controller('AboutCtrl', function($scope) {
 
});
