<?php

use Illuminate\Database\Migrations\Migration;

class AddFbField extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('contacts', function($table) {
			$table->integer('fb_id')->nullable();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('contacts', function($table) {
			$table->dropColumn('fb_id');
		});
	}

}