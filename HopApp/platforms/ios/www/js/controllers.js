angular.module('starter.controllers', [])

.controller('MapCtrl',function($scope,$interval,MarkersFactory,TimeTable){
  initiateMap();
  var locations = MarkersFactory.locations();
  mapupdate(locations); 
  $scope.timetable = [{"LocationID":"0","Time":"00:00:00","RunNo":"0"}];
  $interval(function(){
    TimeTable().success(function(data){
      $scope.nextStop = isNextStop(data.TimeTable);
    })
  },1000);
  // returns 
  $scope.locations = locations;
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
})

.controller('TimeTableCtrl', function($scope,$interval,TimeTable,MarkersFactory) {

  $scope.timetable = [{"LocationID":"0","Time":"00:00:00","RunNo":"0"}];

  $interval(function(){
    TimeTable().success(function(data){
      $scope.timetable = data.TimeTable;
    });
  },1000);
  var locations = MarkersFactory.locations();
  $scope.locations = locations;
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

.controller('LocationCtrl',function($scope,$interval,$stateParams,TimeTable,MarkersFactory){
  $scope.timetable = [{"LocationID":"0","Time":"00:00:00","RunNo":"0"}];
  $interval(function(){
    TimeTable().success(function(data){
      $scope.timetable = data.TimeTable;
    });
  },1000);
  var locations = MarkersFactory.locations();
  $scope.locations = locations;
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
