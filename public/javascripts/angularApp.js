var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', function($http) {
	var o = {
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post).success(function(data) { 
			o.posts.push(data);
		});
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
			post.upvotes += 1;
		});
	};
	
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) { 
			return res.data;
		});
	};

	o.addComment = function(post, comment) {
		return $http.post('/posts/' + post._id + '/comments', comment).success(function(data) {
			post.comments.push(data);
		});
	};

	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data) { 
			comment.upvotes += 1;
		});
	};

	return o;
}]);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	function($scope, posts) {
		$scope.posts = posts.posts;

		
		$scope.addPost = function() {

			// prevent empty posts
			if (!$scope.title || $scope.title === '') {return;}

			posts.create({
				title: $scope.title,
				link: $scope.link,
			});
			
			$scope.title = '';
			$scope.link = '';
		};

		$scope.incrementUpvotes = function(post) {
			posts.upvote(post);
		};
	}
]);

app.controller('PostsCtrl', [
	'$scope',
	'posts',
	'post',
	function($scope, posts, post) {
		$scope.post = post;

		$scope.addComment = function() {

			//prevent empty comments
			if (!$scope.body || $scope.body === '') {return;}

			posts.addComment(post, {
				author: 'user', 
				body: $scope.body,
				upvotes: 0
			});

			$scope.body = '';
		};

		$scope.incrementUpvotes = function(comment) {
			posts.upvoteComment(post, comment);
		};
	}
]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['posts', function(posts) {
						return posts.getAll();
					}]
				}
		});

		$stateProvider
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				resolve: {
					post: ['$stateParams', 'posts', function($stateParams, posts) {
						return posts.get($stateParams.id);
					}]
				}
		});

		$urlRouterProvider.otherwise('home');
}]);

