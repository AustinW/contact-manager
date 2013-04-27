<?php namespace App\Repositories;

use App\Repositories\ContactRepositoryInterface;
use Contact;

class EloquentContactRepository implements ContactRepositoryInterface {

	public function all()
	{
		return Contact::all();
	}

	public function find($id)
	{
		return Contact::find($id);
	}

	public function create($input)
	{
		return Contact::create($input);
	}

	public function update($id, $input)
	{
		$contact = Contact::find($id);

		$contact->fill($input)->save();

		return $contact;
	}

	public function delete($id)
	{
		return Contact::find($id)->delete();
	}
}