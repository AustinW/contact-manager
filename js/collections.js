App.Collections.Contacts = Backbone.Collection.extend({
	// Specify which model we are going to use for the collection
	model: App.Models.Contact,

	// Specify the endpoint where we can interact with a backend service
	url: '/contacts'
});