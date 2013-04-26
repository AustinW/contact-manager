/*
|--------------------------------------------------------------------------
| Global App View
|--------------------------------------------------------------------------
*/
App.Views.App = Backbone.View.extend({

	el: 'body',

	initialize: function() {
		vent.on('contact:edit', this.editContact, this);

		this.addContactView = new App.Views.AddContact({ collection: App.contacts });

		var allContactsView = new App.Views.Contacts({ collection: App.contacts}).render();

		$('#allContacts').append(allContactsView.el);

		this.viewStyle = $('#view-style button.active').attr('id');
		console.log(this.viewStyle);
	},

	events: {
		'click #addContactFormButton': 'openContactForm',
	},

	openContactForm: function() {

		var modal = new Backbone
			.BootstrapModal({
				content: this.addContactView,
				animate: true,
				title: 'Add Contact'
			}).open();

	},

	editContact: function(contact) {

		var editContactView = new App.Views.EditContact({model: contact});

		var modal = new Backbone
			.BootstrapModal({
				content: editContactView,
				animate: true,
				title: contact.get('first_name') + ' ' + contact.get('last_name')
			}).open();
	}
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

	render: function() {
		var template = this.template({data: {}});
		this.$el.html( template );

		return this;
	},

	events: {
	},

	addContact: function() {

		var newContact = this.collection.create({
			first_name:  this.$('#first_name').val(),
			last_name:   this.$('#last_name').val(),
			email:       this.$('#email').val(),
			description: this.$('#description').val()
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
	},

	updateTitle: function() {
		$('.modal-header h3').html(this.$('#first_name').val() + ' ' + this.$('#last_name').val());
	},

	submit: function() {
		// Grab the related model
		this.model.save({
			first_name: this.$('#first_name').val(),
			last_name: this.$('#last_name').val(),
			email: this.$('#email').val(),
			description: this.$('#description').val()
		}, {validate: true});
	}
});

/*
|--------------------------------------------------------------------------
| All Contacts View
|--------------------------------------------------------------------------
*/

App.Views.Contacts = Backbone.View.extend({
	tagName: 'tbody',

	initialize: function() {
		this.collection.on('add', this.addOne, this);
	},

	render: function() {
		this.collection.each( this.addOne, this );
		return this;
	},

	addOne: function(contact) {
		var contactView = new App.Views.Contact({ model: contact });
		this.$el.append(contactView.render().el);
	}
});

/*
|--------------------------------------------------------------------------
| Single Contact View
|--------------------------------------------------------------------------
*/

App.Views.Contact = Backbone.View.extend({
	tagName: 'tr',

	template: template('allContactsTemplate'),

	initialize: function() {
		this.model.on('destroy', this.unrender, this);
		this.model.on('change', this.render, this);
	},

	events: {
		'click button.delete': 'deleteContact',
		'click button.editContactFormButton': 'editContactTrigger'
	},

	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );

		return this;
	},

	editContactTrigger: function() {
		vent.trigger('contact:edit', this.model);
	},

	deleteContact: function() {
		this.model.destroy();
	},

	unrender: function() {
		this.remove();
	}
});