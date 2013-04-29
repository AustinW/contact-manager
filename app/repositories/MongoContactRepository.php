<?php namespace App\Repositories;

use App\Repositories\ContactRepositoryInterface;

class MongoContactRepository implements ContactRepositoryInterface {

	protected $collection = 'contacts';
	protected $mongo;

	public function __construct()
	{
		$this->mongo = \LMongo::connection()->collection('contacts');
	}

	public function all()
	{
		$contacts = array();

		foreach ($this->mongo->get() as $contact) {
			$contacts[] = self::rewriteIdForRetrieve($contact);
		}

		return $contacts;
	}

	public function find($id)
	{
		return self::rewriteIdForRetrieve(
			$this->mongo->where('_id', new \MongoId($id))->first()
		);
	}

	public function create($input)
	{
		$contact = $this->mongo->insert($input);

		return $this->find($contact->{'$id'});
	}

	public function update($id, $input)
	{
		$this->mongo->where('_id', new \MongoId($id))->update($input);
		return $this->find($id);
	}

	public function delete($id)
	{
		return $this->mongo->where('_id', new \MongoId($id))->delete();
	}

	protected static function rewriteIdForRetrieve($data)
	{
		if (isset($data['_id']) && $data['_id'] instanceof MongoId) {
			$data['id'] = $data['_id']->{'$id'};
			unset($data['_id']);
		}

		return $data;
	}
}