// function:
(function(){
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {},
		storageEngine: 'mongo'
	};

	window.vent = _.extend({}, Backbone.Events);

	window.template = function(id, data) {
		if (typeof data === 'undefined') {
			return _.template( $('#' + id).html() );
		} else {
			return _.template( $('#' + id).html(), data );
		}
	}
})();
