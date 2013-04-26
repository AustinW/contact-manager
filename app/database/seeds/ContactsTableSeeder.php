<?php

class ContactsTableSeeder extends Seeder {

    public function run()
    {
        DB::table('contacts')->insert(array(
        	'first_name'  => 'John',
        	'last_name'   => 'Doe',
        	'email'       => 'john@example.com',
        	'description' => 'My friend',
        ));

        DB::table('contacts')->insert(array(
        	'first_name'  => 'Jane',
        	'last_name'   => 'Doe',
        	'email'       => 'jane@example.com',
        	'description' => 'My friend\'s wife',
        ));

        DB::table('contacts')->insert(array(
        	'first_name'  => 'Jeffrey',
        	'last_name'   => 'Way',
        	'email'       => 'jeffrey@envato.com',
        	'description' => 'Developer',
        ));

        // Uncomment the below to run the seeder
        // DB::table('contacts')->insert($contacts);
    }

}