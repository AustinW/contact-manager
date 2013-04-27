<?php

App::bind(
	'App\Repositories\ContactRepositoryInterface',
	'App\Repositories\MongoContactRepository'
);

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
	return View::make('home');
});

Route::get('/test', function() {
	$contacts = new App\Repositories\MongoContactRepository();

	// $newContact = $contacts->create(array(
	// 	'first_name'  => 'Neil',
	// 	'last_name'   => 'Gulati',
	// 	'email'       => 'twistmaster9000@gmail.com',
	// 	'description' => 'Trampolinist'
	// ));

	// var_dump($newContact);

	// $allContacts = $contacts->all();

	// foreach ($allContacts as $contact) {
	// 	var_dump($contact);
	// }

	// $contact = $contacts->update('517b60804c84a3fe3b000000', array('email' => 'a.white@homefree.com'));
	// var_dump($contact);


	var_dump($contacts->delete('517b877b4c84a3fe3b000004'));

});

Route::resource('contacts', 'ContactsController');