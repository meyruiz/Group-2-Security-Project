{	var appInfo = {"api_url":"http:\/\/showcase.nbcs.nsw.edu.au\/wp-json\/wp\/v2\/"};
	var wpApp = new angular.module('NBCSShowcase',['ui.router','ngCookies','ngResource','angularMoment']);

	wpApp.run(function run($cookies,$location){
		$location.path($cookies.get('location'));
	});

	wpApp.factory('Posts', function( $resource ) {
		return $resource(appInfo.api_url + 'posts/:ID',{
			ID: '@id'
		});
	});

	wpApp.factory('PostsWithCategory', function($resource){
		return $resource(appInfo.api_url + 'posts/?filter[category_name]=:ID',{
			ID: '@id'
		});
	});

	wpApp.factory('Pages', function($resource){
		return $resource(appInfo.api_url + 'pages/?filter[title]=:ID',{
			ID: '@id'
		});
	});

	wpApp.factory('Categories', function( $resource ) {
		return $resource(appInfo.api_url + 'categories/:ID',{
			ID: '@id'
		});
	});

	wpApp.controller('MyCtrl', function($scope, $location) { 
	    $scope.isActive = function(route) {
	        return ($location.path().indexOf(route) > -1)
	    }
	});

	wpApp.controller('HomeCtrl', ['$timeout','$location','$cookies','$scope','Posts','Categories',function($timeout,$location,$cookies,$scope, Posts, Categories){
		
		var Retrieve = function (){
			Posts.query(function(res){
				var postarray = [];
				for (i= 0; i < res.length; i++){
					if (res[i].acf.time != '' & (moment(res[i].acf.time, 'hh:mm:ss')).add('minutes', 5).isAfter(moment()))
					{
						postarray.push(res[i]);
					}
				}
				$scope.posts = postarray;

			});
			Categories.query(function(res){
				$scope.categories = res;
			});
			$scope.getCategoryName = function (id) {
			for (i = 0; i < $scope.categories.length; i++){
				if ($scope.categories[i].id == id){
					var category = $scope.categories[i].name;
					return category.replace('/','-');
					}
				}
			};
			// check for item changes
	        //$timeout(Retrieve, 5000);
		};

		Retrieve();
		var expireDate = new Date();
	  	expireDate.setDate(expireDate.getDate() + 100);
		$cookies.put('location', $location.url(),{expires: expireDate});

		if (window.DeviceMotionEvent != undefined) {
			window.ondeviceorientation = function(event) {
				alpha = Math.round(event.alpha);
				beta = Math.round(event.beta);
				gamma = Math.round(event.gamma);
				//console.log('gamma: ' . gamma);
				//jQuery('header.logo h1').css('background-position-x' gamma);
			}
		}
	}]);

	wpApp.controller('EventCtrl', ['$location','$cookies','$scope','$stateParams','Posts',function($location,$cookies,$scope, $stateParams, Posts){
		Posts.get({ID:$stateParams.id},function(res){
			$scope.post = res;
			var location = res.acf.marker; 
			location.title = res.title.rendered;
			location.content = null;
			NBCSMap.initiate(location);
			NBCSMap.addmarkers([location]);
		})
		var expireDate = new Date();
	  	expireDate.setDate(expireDate.getDate() + 100);
		$cookies.put('location', $location.url(),{expires: expireDate});
	}]);

	wpApp.controller('PageCtrl', ['$cookies','$scope','$location','$stateParams','Pages',function($cookies,$scope, $location, $stateParams ,Pages){
		Pages.query({ID: $location.path().replace('/','')},function(res){
			$scope.posts = res;
		})
		var expireDate = new Date();
	  	expireDate.setDate(expireDate.getDate() + 100);
		$cookies.put('location', $location.url(),{expires: expireDate});
	}]);


	wpApp.controller('EventsCtrl', ['$timeout','$location','$cookies','$scope','$stateParams','Categories','PostsWithCategory',function($timeout,$location,$cookies,$scope,$stateParams,Categories,PostsWithCategory){

		var Retrieve = function (){

			Categories.query(function(res){
			$scope.categories = res;
			});
			$scope.getCategoryName = function (id) {
				for (i = 0; i < $scope.categories.length; i++){
					if ($scope.categories[i].id == id){
						var category = $scope.categories[i].name;
						return category.replace('/','-');
					}
				}
			};

			if ($stateParams.name == 'all'){
				PostsWithCategory.query({ID: ''},function(res){
				$scope.posts = res;
			})
			}
			else{
				PostsWithCategory.query({ID: window.decodeURIComponent($stateParams.name).replace('/','')},function(res){
				$scope.posts = res;
			})
			}

			// check for item changes
	        //$timeout(Retrieve, 5000);
		};


	    $scope.isActiveMenu = function(route) {
	        	return (window.decodeURIComponent($location.path()).indexOf(route) > -1)
	    }	
		Retrieve();
		var expireDate = new Date();
	  	expireDate.setDate(expireDate.getDate() + 100);
		$cookies.put('location', $location.url(),{expires: expireDate});
	}]);

	wpApp.controller('mapCtrl', ['$timeout','$location','$cookies','$scope','$stateParams','Posts',function($timeout,$location,$cookies,$scope,$stateParams,Posts){
		NBCSMap.initiate();
		Posts.query(function(res){
			var markers = [];
			for (var i = 0; i < res.length; i++){
				if(res[i].acf.displayinmainmap){
					var marker = {
						title: res[i].title.rendered,
						content: '<a class="map-text" href="#/event/'+ res[i].id +'">' + res[i].title.rendered + '</a>',
						lat: res[i].acf.marker.lat,
						lng: res[i].acf.marker.lng
					};
				markers.push(marker);
				}	
			}
			NBCSMap.addmarkers(markers);
		});

	    $scope.isActiveMenu = function(route) {
	        	return (window.decodeURIComponent($location.path()).indexOf(route) > -1)
	    }	
		var expireDate = new Date();
	  	expireDate.setDate(expireDate.getDate() + 100);
		$cookies.put('location', $location.url(),{expires: expireDate});
	}]);

	wpApp.config (function ($stateProvider,$urlRouterProvider){
		$urlRouterProvider.otherwise('/home');
		$stateProvider
			.state('home',{
				url:'/home',
				controller: 'HomeCtrl',
				templateUrl: 'templates/home.html'
			})
			.state('event',{
				url:'/event/:id',
				controller: 'EventCtrl',
				templateUrl: 'templates/event.html'
			})
			.state('events',{
				url:'/events/:name',
				controller: 'EventsCtrl',
				templateUrl: 'templates/events.html'
			})
			.state('map',{
				url:'/map',
				controller: 'mapCtrl',
				templateUrl: 'templates/map.html'
			})
			.state('about',{
				url:'/about',
				controller: 'PageCtrl',
				templateUrl: 'templates/about.html'
			})
			.state('offline',{
				url:'/offline',
				controller: 'PageCtrl',
				templateUrl: 'templates/offline.html'
			})

	});

	wpApp.directive('appfooter',function(){
		return{
			templateUrl: 'templates/footer.html'
		};
	});

	wpApp.directive('scrollheight', ['$timeout', function($timeout){
		return {
			link: function(scope,element,attr){
				var runHeight = function() {
					var h = jQuery('nav.menu-primary-container').height();
					var w = jQuery(window).height();
					var o = jQuery(element).offset().top;
					console.log('window height: ' . w);
					console.log('nav height: ' . h);
					console.log('element offset: ' . o);
					element.css('height',w-h-o-5);
				}
				$timeout(runHeight,0);
			}
		}
	}]);

	wpApp.directive('history',function(){
		return {
			link: function(scope, element, attrs, $window) {
			    element.on('click', function() {
			        window.history.back();
			    });
			}
		}
	});

	wpApp.directive('shine',function(){
		return {
			link: function(scope, element, attrs, $window) {
				if (window.DeviceMotionEvent != undefined) {
					window.ondeviceorientation = function(event) {
						// Get gyroscope values
						alpha = Math.round(event.alpha);
						beta = Math.round(event.beta);
						gamma = Math.round(event.gamma);
						// Move beta value to match 0-1 opacity
						gloss = ((beta-40)*42)*0.001;
						//console.log(Math.abs(gloss));
						jQuery('header.logo h1').css('background-position-x', gamma*4);
						jQuery('header.logo .gloss').css('opacity', Math.abs(gloss));
					}
				}
			}
		}
	});

	wpApp.filter('to_trusted',['$sce',function( $sce){
		return function(text){
			return $sce.trustAsHtml (text);
		}
	}]);
}