// function:
(function(){
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {},
		storageEngine: 'mongo',
		facebookUser: new FacebookUser(null, {scope: ['email']})
	};

	window.vent = _.extend({}, Backbone.Events);

	window.template = function(id, data) {
		if (typeof data === 'undefined') {
			return _.template( $('#' + id).html() );
		} else {
			return _.template( $('#' + id).html(), data );
		}
	};

	FB.init({
		appId: '386499554797554'
	});
})();
