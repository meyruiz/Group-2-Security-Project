angular.module('starter.controllers', [])

.controller('MapCtrl',function($scope,MarkersFactory){
  initiateMap();
  mapupdate(MarkersFactory.locations()); 
})

.controller('TimeTableCtrl', function($scope,TimeTable,MarkersFactory) {
  TimeTable().success(function(data){
  	$scope.timetable = data.TimeTable;
  });
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

.controller('AboutCtrl', function($scope) {
 
});
