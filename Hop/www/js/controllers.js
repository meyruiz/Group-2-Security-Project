angular.module('starter.controllers', [])

.controller('MapCtrl',function($scope,$interval,MarkersFactory,TimeTableFactory){
  initiateMap();
  var locations = MarkersFactory.locations();
  mapupdate(locations); 
  // returns 
  $scope.locations = locations;

  var timetable = TimeTableFactory.timetable();
  $scope.timetable = timetable;

  $scope.location = function (id){
    for(var i = 0; i < locations.length; i++){
      if (locations[i].ID == id){
        return locations[i];
        break;
      }
    }
  }
  function isNextStop(stops){
  for(var i = 0; i < stops.length; i++){
      if (moment(stops[i].Time,"HH:mm:ss").isAfter(new Date())){
        break;
      }
    }
    return stops[i];
  }
  $scope.nextStop = isNextStop(timetable); 
})

.controller('TimeTableCtrl', function($scope,$interval,TimeTableFactory,MarkersFactory) {
  var locations = MarkersFactory.locations();
  $scope.locations = locations;

  var timetable = TimeTableFactory.timetable();
  $scope.timetable = timetable;
  // returns 
  $scope.location = function (id){
  	for(var i = 0; i < locations.length; i++){
  		if (locations[i].ID == id){
  			return locations[i];
  			break;
  		}
  	}
  }

})

.controller('LocationCtrl',function($scope,$interval,$stateParams,TimeTableFactory,MarkersFactory){
  var locations = MarkersFactory.locations();
  $scope.locations = locations;
  var timetable = TimeTableFactory.timetable();
  $scope.timetable = timetable;
  $scope.id = $stateParams.id;
  $scope.location = function (id){
    for(var i = 0; i < locations.length; i++){
      if (locations[i].ID == id){
        return locations[i];
        break;
      }
    }
  }
})

.controller('AboutCtrl', function($scope) {
 
});
