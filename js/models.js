App.Models.Contact = Backbone.Model.extend({
	// validate

	validate: function(attrs) {
		if ( ! attrs.first_name || ! attrs.last_name ) {
			return "First and last name are required.";
		}

		if ( ! attrs.email ) {
			return "A valid email is required.";
		}
	},

	// MongoDB uses "_id" instead of id for primary key
	// parse: function(response) {
	// 	if (App.storageEngine == 'mongo') {
	// 		response.id = response._id.$oid;
	// 		return response;
	// 	}
	// },
});