/*
|--------------------------------------------------------------------------
| Global App View
|--------------------------------------------------------------------------
*/
App.Views.App = Backbone.View.extend({

	el: 'body',

	// Initialize the main view (attached to the <body> tag)
	initialize: function() {
		// Initialize the loading indicator (used to indicate when something is loading on the page)
		this.mainLoadingIndicator = new App.Views.MainLoadingIndicator();

		// Initialize the contact view
		this.contactViewStyle = new App.Views.ContactViewStyle();

		// Initialize the navbar view
		this.navBar = new App.Views.NavBar();
	},
});

/*
|--------------------------------------------------------------------------
| Main Loading Indicator
|--------------------------------------------------------------------------
|
| Shows the user that something is loading in the background
|
*/
App.Views.MainLoadingIndicator = Backbone.View.extend({
	// Attach this view to the element with id="main-loading-indicator"
	el: '#main-loading-indicator',

	initialize: function() {
		// Here, we're going to initialize some listeners so that anywhere
		// in the application, we can fire a show/hide event that will cause
		// this view to show/hide the loading indicator

		// Listen for the "show:main-loading-indicator" event
		vent.on('show:main-loading-indicator', this.showLoading, this);

		// Listen for the "hide:main-loading-indicator" event
		vent.on('hide:main-loading-indicator', this.hideLoading, this);
	},

	showLoading: function() {

		// this.$el refers to the jQuery wrapped element. In this case:
		// $("#main-loading-indicator"). Here we're going to show it
		this.$el.show();
	},

	hideLoading: function() {
		this.$el.hide();
	}
});

/*
|--------------------------------------------------------------------------
| Navigation Bar View
|--------------------------------------------------------------------------
*/
App.Views.NavBar = Backbone.View.extend({
	el: '#navigation-bar',

	initialize: function() {
		// Listen for the contact:edit event so we can load the editContact view.
		// This way, anywhere in the application can load the editing pane.
		vent.on('contact:edit', this.editContact, this);

		// Listen for the contact:syncFB event so that we can sync with facebook
		// from anywhere in the application
		vent.on('contact:syncFB', this.addFBInfo, this);

		// Setup some listeners for closing the modals
		vent.on('close:addModal', function() {this.addModal.close();}, this);
		vent.on('close:editModal', function() {this.editModal.close();}, this);

		// Initialize the addContactView so that we can refer to it later when
		// a user would like to add a contact
		this.addContactView = new App.Views.AddContact({ collection: App.contacts });

		// Respond to an event fired from the facebook-user package, letting us know
		// that the user has logged in with Facebook. Here we'll change the
		// "Login with Facebook" button to "Sync with Facebook"
		App.facebookUser.on('facebook:connected', function(response) {
			this.$('#login-with-facebook-container').remove();
			this.$('#sync-with-facebook-container').show();
		});
	},

	events: {
		'click #add-contact-form-button': 'openContactForm',

		'click #login-with-facebook': function(event) {

			// When the user clicks the login with facebook button, establish a
			// facebook-user listener that will insert their profile pic anywhere
			// with a .fb-self-pic class
			App.facebookUser.login(function(response) {
				$('.fb-self-pic').attr('src', 'https://graph.facebook.com/' + response.authResponse.userID + '/picture');
			});
		},

		'click #sync-with-facebook': function(event) {

			// Let the user know that something is loading...
			vent.trigger('show:main-loading-indicator');

			// Let's count how many syncedContacts we get (for now just console.log()'d)
			var syncedContacts = 0;

			// Query the official Facebook JS SDK for /me info
			FB.api('/me', function(self_response) {

				// Scan through each of the contacts in the collection. (foreach loop)
				_.each(App.contacts.models, function(contact) {

					// If the contact matches the facebook user (user has a contact for him/herself)
					if (self_response.name == contact.get('first_name') + ' ' + contact.get('last_name')) {

						++syncedContacts;

						// Add the facebook info to the contact model
						contact.trigger('addFBInfo', self_response);

						// Log which user was synced along with the count
						console.log(syncedContacts, self_response.name);
					}
				});

				// Query the Facebook JS SDK for the user's friends. Ideally, we could match
				// email addresses for a more precise match. However, the Facebook SDK doesn't
				// allow access to friends' email addresses (and for good reason).
				FB.api('/me/friends', {fields: 'name,id'}, function(friends_response) {

					// Scan through each of the user's Facebook friends
					_.each(friends_response.data, function(fbUser) {

						// Scan through each of the contacts in the collection. O(n^2) ouch.
						_.each(App.contacts.models, function(contact) {

							// Check to see if the facebook name matches
							if (fbUser.name == contact.get('first_name') + ' ' + contact.get('last_name')) {

								++syncedContacts;

								// Add the facebook info to the contact model
								contact.trigger('addFBInfo', fbUser);

								// Log which user was synced along with the count
								console.log(syncedContacts, fbUser.name);
							}
						});
					});

					// We're done loading XHR information, so hide the indicator
					vent.trigger('hide:main-loading-indicator');
				});
			});
		}
	},

	openContactForm: function() {

		// Initialize and open a bootstrap modal containing the addContactView
		this.addModal = new Backbone.BootstrapModal({
			content: this.addContactView,
			animate: true,
			title: 'Add Contact'
		}).open();

	},

	editContact: function(contact) {

		// Initialize an editContactView with the specified contact model
		var editContactView = new App.Views.EditContact({model: contact});

		// Initialize and open a bootstrap modal containing the editContactView
		this.editModal = new Backbone.BootstrapModal({
			content: editContactView,
			animate: true,
			title: contact.get('first_name') + ' ' + contact.get('last_name')
		}).open();
	},
});

/*
|--------------------------------------------------------------------------
| Contact View Style
|--------------------------------------------------------------------------
|
| Controls how we're going to display the contacts
*/

App.Views.ContactViewStyle = Backbone.View.extend({

	// Wrap the view selector (three button panel) in a view
	el: '#view-style',

	initialize: function() {
		console.log('Setting initial view');

		// Let's change the style with no parameters specified on initial load
		this.changeStyle();
	},

	events: {

		// Fire the changeStyle event whenever the user clicks one of the buttons
		'click .btn': 'changeStyle'
	},

	readPersistedStyle: function() {

		// On first load, we're going to check if there's a cookie set
		// with the user's view preference (view-list is the default)
		return _.cookie('view-style') || 'view-list';
	},

	persistStyle: function(style) {

		// Every time the view changes, we're going to persist the
		// preference with a cookie
		_.cookie('view-style', style);
	},

	changeStyle: function(e) {

		// Let's set the view style based on the user's preference (either
		// from a button click or an existing cookie)
		if (typeof e !== 'undefined' && e != null) {
			this.viewStyle = this.$(e.currentTarget).attr('id');
		} else {
			this.viewStyle = this.readPersistedStyle();
		}

		// Persist the preference
		this.persistStyle(this.viewStyle);

		// Set the preference as "active" so that the user can tell which one
		// is selected
		this.setActiveButton(this.viewStyle);

		// Initialize a view based on the preference. All of the views include the same
		// App.contacts collection. The only thing that will change is the display. All
		// actions and events specific to a single contact remain the same regardless of
		// the view preference. Cool.
		if (this.viewStyle == 'view-th-large') {

			var allContactsView = new App.Views.ThLargeContacts({ collection: App.contacts }).render();

		} else if (this.viewStyle == 'view-th') {

			var allContactsView = new App.Views.ThContacts({ collection: App.contacts }).render();

		} else {

			var allContactsView = new App.Views.ListContacts({ collection: App.contacts}).render();

		}

		// Dump the view contents into the #allContacts div
		$('#allContacts').html(allContactsView.el);
	},

	setActiveButton: function(activeId) {

		// Remove the .active class form all buttons
		this.$('.btn').removeClass('active');

		// Add the .active class to the specific "view style" button
		this.$('#' + activeId).addClass('active');
	},
});

/*
|--------------------------------------------------------------------------
| Add Contact View
|--------------------------------------------------------------------------
*/
App.Views.AddContact = Backbone.View.extend({

	// Instead of wrapping a specific #element, we're going to pull in a
	// template denoted: <script id="contactFormModal" type="text/template"></script>.
	// Here we're using a global template function (from main.js) that facilitates
	// an easier syntax for underscore templates. We could have just as easily
	// used Handlebars.js, Mustache.js, or any other templating engine.
	template: template('contactFormModal'),

	initialize: function() {

		// Fire the addContact() function when the user clicks "ok"
		this.bind('ok', this.addContact, this);

		// Immediately render the view
		this.render();
	},

	events: {

		// While the user is typing, if the user presses enter,
		// we will automatically submit the form by detecting the
		// keystroke
		'keyup form input': function(e) {
			if (e.keyCode == 13) {

				this.trigger('ok');

				vent.trigger('close:addModal');
			}
		}
	},

	render: function() {

		// Because here we're adding a new contact and the form is shared
		// between the add and edit view, we have to initialize it with an
		// empty data object, otherwise it would error out.
		var renderedTemplate = this.template({data: {}});

		// Inject the renderedTemplate into the DOM.
		this.$el.html( renderedTemplate );

		return this;
	},

	addContact: function() {

		// Create a new contact model and instantly add it to the collection.
		// This will automatically sync to the server.
		var newContact = this.collection.create({
			first_name:  this.$('#first_name').val(),
			last_name:   this.$('#last_name').val(),
			email:       this.$('#email').val(),
			description: this.$('#description').val(),
			phone:       this.$('#phone').val()
		},
		{
			// Backbone won't add it to the collection until it's received
			// a success response from the server
			wait: true,

			// We're denoting that we want to validate the model first,
			// however we don't have any rules setup so it submits.
			validate:true
		});
	}
});

/*
|--------------------------------------------------------------------------
| Edit Contact View
|--------------------------------------------------------------------------
*/
App.Views.EditContact = Backbone.View.extend({

	// Load the same template for the editContact view
	template: template('contactFormModal'),

	initialize: function() {

		// Fire the editContact() function when the user clicks "ok"
		this.bind('ok', this.editContact, this);

		this.render();
	},

	render: function() {

		// Because we're editing a contact, we're going to load the template
		// with a specified contact's details set in the "data" parameter
		var template = this.template({ data: this.model.toJSON() });

		// Inject the renderedTemplate into the DOM.
		this.$el.html( template );

		return this;
	},

	events: {

		// Let's have some fun and change the title to match the user's
		// name when they type in the first_name or last_name box
		'keyup form .personName': 'updateTitle',

		// While the user is typing, if the user presses enter,
		// we will automatically submit the form by detecting the
		// keystroke
		'keyup form input': function(e) {
			if (e.keyCode == 13) {

				this.trigger('ok');

				vent.trigger('close:editModal');
			}
		}
	},

	updateTitle: function() {

		// Update the title of the modal with the contact's name
		$('.modal-header h3').html(this.$('#first_name').val() + ' ' + this.$('#last_name').val());
	},

	editContact: function() {

		// Edit the contact model and instantly sync to the server.
		// Trivial but worth explaining: the App.contacts collection
		// contains a reference to this model, so no need to update
		// the collection.
		this.model.save({
			first_name:  this.$('#first_name').val(),
			last_name:   this.$('#last_name').val(),
			email:       this.$('#email').val(),
			description: this.$('#description').val(),
			phone:       this.$('#phone').val()
		},
		{
			// The model is already a part of the collection, so we don't
			// need to specify 'wait: true' here.

			// We're denoting that we want to validate the model first,
			// however we don't have any rules setup so it submits.
			validate:true
		});
	}
});

/*
|--------------------------------------------------------------------------
| All Contacts in a *large thumbnail* view
|--------------------------------------------------------------------------
*/

App.Views.ThLargeContacts = Backbone.View.extend({
	tagName: 'ul',

	initialize: function() {
		this.collection.on('add', this.addOne, this);
	},

	render: function() {
		this.collection.each( this.addOne, this );
		$(this.el).addClass('thumbnails');

		return this;
	},

	addOne: function(contact) {
		// We have to manually adjust the tagName for the each individual row
		// before rendering
		App.Views.Contact.prototype.tagName = 'li';

		// Instantiate a new individual contact view for each item in the collection
		var contactView = new App.Views.Contact({ model: contact });

		// Set which type of view we'll be using and render it
		var renderedContactView = contactView.setThLargeView().render().$el

		// Append each individually rendered item to the main view
		this.$el.append(renderedContactView);
	}
});

/*
|--------------------------------------------------------------------------
| All Contacts in a *small thumbnail* view
|--------------------------------------------------------------------------
*/

App.Views.ThContacts = Backbone.View.extend({
	tagName: 'ul',

	initialize: function() {
		this.collection.on('add', this.addOne, this);
	},

	render: function() {
		this.collection.each( this.addOne, this );
		$(this.el).addClass('thumbnails');

		return this;
	},

	addOne: function(contact) {
		// We have to manually adjust the tagName for the each individual row
		// before rendering
		App.Views.Contact.prototype.tagName = 'li';

		// Instantiate a new individual contact view for each item in the collection
		var contactView = new App.Views.Contact({ model: contact });

		// Set which type of view we'll be using and render it
		var renderedContactView = contactView.setThView().render().$el

		// Append each individually rendered item to the main view
		this.$el.append(renderedContactView);
	}
});

/*
|--------------------------------------------------------------------------
| All Contacts in a *list* view
|--------------------------------------------------------------------------
*/

App.Views.ListContacts = Backbone.View.extend({
	tagName: 'table',

	initialize: function() {
		this.collection.on('add', this.addOne, this);
	},

	render: function() {
		this.collection.each( this.addOne, this );
		$(this.el).addClass('table');

		return this;
	},

	addOne: function(contact) {
		// We have to manually adjust the tagName for the each individual row
		// before rendering
		App.Views.Contact.prototype.tagName = 'tr';

		// Instantiate a new individual contact view for each item in the collection
		var contactView = new App.Views.Contact({ model: contact });

		// Set which type of view we'll be using and render it
		var renderedContactView = contactView.setTableView().render().$el;

		// Append each individually rendered item to the main view
		this.$el.append(renderedContactView);
	}
});

/*
|--------------------------------------------------------------------------
| Single Contact View
|--------------------------------------------------------------------------
*/

App.Views.Contact = Backbone.View.extend({

	tagName: 'tr',

	templateName: '',
	tagClass: '',

	initialize: function() {
		this.model.on('destroy', this.unrender, this);
		this.model.on('change', this.render, this);
		this.model.on('addFBInfo', this.addFBInfo, this);
	},

	events: {
		'click button.delete': 'deleteContact',
		'click button.editContactFormButton': 'editContactTrigger'
	},

	setThLargeView: function() {
		this.templateName = 'thLargeContactsTemplate';
		this.tagClass = 'span6';

		return this;
	},

	setThView: function() {
		this.templateName = 'thContactsTemplate';
		this.tagClass = 'span4';

		return this;
	},

	setTableView: function() {
		this.templateName = 'listContactsTemplate';

		return this;
	},

	render: function() {
		this.$el.html( template( this.templateName, {data: this.model.toJSON()} ) );

		if (this.tagClass != '')
			$(this.el).addClass(this.tagClass);

		var fb_id = this.model.get('fb_id');

		if (typeof fb_id !== 'undefined') {
			this.$('.fb-pic').html('<img src="https://graph.facebook.com/' + fb_id + '/picture?type=large" class="img-polaroid" />');
		}

		return this;
	},

	editContactTrigger: function() {
		vent.trigger('contact:edit', this.model);
	},

	deleteContact: function() {
		if (confirm('Are you sure you wish to delete this contact?'))
			this.model.destroy();
	},

	addFBInfo: function(fbUser) {
		this.model.set({fb_id: fbUser.id});
		this.model.save();
	},

	unrender: function() {
		this.remove();
	}
});