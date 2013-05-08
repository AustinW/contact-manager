/*
|--------------------------------------------------------------------------
| Global App View
|--------------------------------------------------------------------------
*/
App.Views.App = Backbone.View.extend({

	el: 'body',

	initialize: function() {
		this.mainLoadingIndicator = new App.Views.MainLoadingIndicator();
		this.contactViewStyle = new App.Views.ContactViewStyle();
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
	el: '#main-loading-indicator',

	initialize: function() {
		vent.on('show-main-loading-indicator', this.showLoading, this);
		vent.on('hide-main-loading-indicator', this.hideLoading, this);
	},

	showLoading: function() {
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
		vent.on('contact:edit', this.editContact, this);
		vent.on('contact:syncFB', this.addFBInfo, this);

		vent.on('close:addModal', function() {this.addModal.close();}, this);
		vent.on('close:editModal', function() {this.editModal.close();}, this);

		this.addContactView = new App.Views.AddContact({ collection: App.contacts });

		loginWithFacebookContainer = this.$('#login-with-facebook-container');
		syncWithFacebookContainer = this.$('#sync-with-facebook-container');

		App.facebookUser.on('facebook:connected', function(response) {
			loginWithFacebookContainer.remove();
			syncWithFacebookContainer.show();
		});

	},

	events: {
		'click #add-contact-form-button': 'openContactForm',
		'click #login-with-facebook': function(event) {
			App.facebookUser.login(function(response) {
				$('.fb-self-pic').attr('src', 'https://graph.facebook.com/' + response.authResponse.userID + '/picture');
			});
		},
		'click #sync-with-facebook': function(event) {
			vent.trigger('show-main-loading-indicator');

			var syncedContacts = 0;
			FB.api('/me', function(self_response) {
				self_name = self_response.name;

				FB.api('/me/friends', {fields: 'name,id,birthday,email'}, function(friends_response) {

					_.each(friends_response.data, function(fbUser) {
						_.each(App.contacts.models, function(contact) {

							if (fbUser.name == contact.get('first_name') + ' ' + contact.get('last_name')) {
								++syncedContacts;
								contact.trigger('addFBInfo', fbUser);
							} else if (self_name == contact.get('first_name') + ' ' + contact.get('last_name')) {
								++syncedContacts;
								contact.trigger('addFBInfo', self_response);
							}
						})
					});

					vent.trigger('hide-main-loading-indicator');
				});
			});
		}
	},

	openContactForm: function() {

		this.addModal = new Backbone
			.BootstrapModal({
				content: this.addContactView,
				animate: true,
				title: 'Add Contact'
			}).open();

	},

	editContact: function(contact) {

		var editContactView = new App.Views.EditContact({model: contact});

		this.editModal = new Backbone
			.BootstrapModal({
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
	el: '#view-style',

	initialize: function() {
		console.log('Setting initial view');

		this.changeStyle();
	},

	events: {
		'click .btn': 'changeStyle'
	},

	readPersistedStyle: function() {
		return _.cookie('view-style') || 'view-list';
	},

	persistStyle: function(style) {
		_.cookie('view-style', style);
	},

	changeStyle: function(e) {

		if (typeof e !== 'undefined' && e != null) {
			this.viewStyle = this.$(e.currentTarget).attr('id');
		} else {
			this.viewStyle = this.readPersistedStyle();
		}

		this.persistStyle(this.viewStyle);

		this.setActiveButton(this.viewStyle);

		if (this.viewStyle == 'view-th-large') {
			var allContactsView = new App.Views.ThLargeContacts({ collection: App.contacts }).render();
		} else if (this.viewStyle == 'view-th') {
			var allContactsView = new App.Views.ThContacts({ collection: App.contacts }).render();
		} else {
			var allContactsView = new App.Views.ListContacts({ collection: App.contacts}).render();
		}

		$('#allContacts').html(allContactsView.el);
	},

	setActiveButton: function(activeId) {
		this.$('.btn').removeClass('active');
		this.$('#' + activeId).addClass('active');
	},
});

/*
|--------------------------------------------------------------------------
| Add Contact View
|--------------------------------------------------------------------------
*/
App.Views.AddContact = Backbone.View.extend({
	template: template('contactFormModal'),

	initialize: function() {
		this.bind('ok', this.addContact, this);

		this.render();
	},

	events: {
		'keyup form input': function(e) {
			if (e.keyCode == 13) {
				this.trigger('ok');
				vent.trigger('close:addModal');
			}
		}
	},

	render: function() {
		var template = this.template({data: {}});
		this.$el.html( template );

		return this;
	},

	addContact: function() {

		var newContact = this.collection.create({
			first_name:  this.$('#first_name').val(),
			last_name:   this.$('#last_name').val(),
			email:       this.$('#email').val(),
			description: this.$('#description').val(),
			phone:       this.$('#phone').val()
		}, {wait: true, validate:true });
	}
});

/*
|--------------------------------------------------------------------------
| Edit Contact View
|--------------------------------------------------------------------------
*/
App.Views.EditContact = Backbone.View.extend({
	template: template('contactFormModal'),

	initialize: function() {
		this.bind('ok', this.submit, this);

		this.render();
	},

	render: function() {
		var template = this.template({ data: this.model.toJSON() });
		this.$el.html( template );

		return this;
	},

	events: {
		'keyup form .personName': 'updateTitle',
		'keyup form input': function(e) {
			if (e.keyCode == 13) {
				this.trigger('ok');
				vent.trigger('close:editModal');
			}
		}
	},

	updateTitle: function() {
		$('.modal-header h3').html(this.$('#first_name').val() + ' ' + this.$('#last_name').val());
	},

	submit: function() {
		// Update the model
		this.model.save({
			first_name:  this.$('#first_name').val(),
			last_name:   this.$('#last_name').val(),
			email:       this.$('#email').val(),
			description: this.$('#description').val(),
			phone:       this.$('#phone').val()
		}, {validate: true});
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