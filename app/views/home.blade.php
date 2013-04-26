<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Contact Manager</title>
	<link rel="stylesheet" href="css/style.css">
	<link rel="author" href="humans.txt">

	<link href="/css/cerulean/bootstrap.min.css" rel="stylesheet">
  <link href="/css/font-awesome.min.css" rel="stylesheet">
	<style>
	body {
		padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
	}
	</style>
	<link href="/css/bootstrap-responsive.css" rel="stylesheet">

	<!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
          <script src="../assets/js/html5shiv.js"></script>
          <![endif]-->

          <!-- Fav and touch icons -->
          <link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
          <link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
          <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
          <link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">
          <link rel="shortcut icon" href="../assets/ico/favicon.png">

      </head>
      <body>

      	<div class="navbar navbar-fixed-top">
      		<div class="navbar-inner">
      			<div class="container">
      				<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
      					<span class="icon-bar"></span>
      					<span class="icon-bar"></span>
      					<span class="icon-bar"></span>
      				</button>
      				<a class="brand" href="#">Contact Manager</a>
      				<div class="nav-collapse collapse">
      					<ul class="nav">
      						<li class="active"><a href="#">Home</a></li>
      						<li><a href="#about">About</a></li>
      						<li><a href="#contact">Contact</a></li>
                  <li><a id="addContactFormButton"><i class="icon-plus-sign"></i> Add Contact</a></li>
      					</ul>
      				</div><!--/.nav-collapse -->

              <div class="btn-group" id="view-style">
                <button class="btn" id="view-th-large"><i class="icon-th-large"></i></button>
                <button class="btn" id="view-th"><i class="icon-th"></i></button>
                <button class="btn active" id="view-list"><i class="icon-list"></i></button>
              </div>
      			</div>
      		</div>
      	</div>

      	<div class="container">

      		<h1>Contacts</h1>
          <div id="allContacts">

          </div>
          <!-- <table id="allContacts" class="table">
            <thead>
              <tr>
                <th>First Name:</th>
                <th>Last Name:</th>
                <th>Email:</th>
                <th>Description:</th>
                <th>Options</th>
              </tr>
            </thead>
          </table> -->

      	</div> <!-- /container -->



        <!--
        ----------------------------------------------------
        Templates and Hidden Fields
        ----------------------------------------------------
        -->

        <script id="view-th-large-template" type="text/template">
        <li>
          <div class="contact-name"><%= first_name %> <%= last_name %></div>
          <div class="contact-email"><%= email %></div>
          <div class="contact-description"><%= description %></div>
        </li>
        </script>

        <script id="contactFormModal" type="text/template">
        <!-- Modal -->
        <form id="contactForm">
          <div class="control-group">
            <label for="first_name">First Name: </label>
            <input id="first_name" type="text" class="personName" name="first_name" value="<%= data.first_name %>" />
          </div>
          <div class="control-group">
            <label for="last_name">Last Name: </label>
            <input id="last_name" type="text" class="personName" name="last_name" value="<%= data.last_name %>" />
          </div>
          <div class="control-group">
            <label for="email">Email: </label>
            <input id="email" type="text" name="email" value="<%= data.email %>" />
          </div>
          <div class="control-group">
            <label for="description">Description: </label>
            <textarea id="description" name="description"><%= data.description %></textarea>
          </div>
        </form>
        </script>

        <script id="thLargeContactsTemplate" type="text/template">
          <div class="thumbnail">
            <i class="icon-user" style="font-size:280px"></i>
            <div class="caption">
              <h3><%= first_name %> <%= last_name %></h3>
              <div class=""><i class="icon-envelope"></i> <a href="mailto:<%= email %>"><%= email %></a></div>
              <p><i class="icon-align-left"></i> <%= description %></p>
              <p>
                <button class="editContactFormButton btn btn-success"><i class="icon-edit"></i> Edit</button>
                <button class="delete btn btn-danger"><i class="icon-trash"></i> Delete</button>
              </p>
            </div>
          </div>
        </script>

        <!-- Template from: http://www.w3resource.com/twitter-bootstrap/thumbnails-tutorial.php -->
        <script id="thContactsTemplate" type="text/template">
          <div class="thumbnail">
            <i class="icon-user" style="font-size:150px"></i>
            <div class="caption">
              <h5><%= first_name %> <%= last_name %></h5>
              <div class=""><i class="icon-envelope"></i> <a href="mailto:<%= email %>"><%= email %></a></div>
              <p><i class="icon-align-left"></i> <%= description %></p>
              <p>
                <button class="editContactFormButton btn btn-success"><i class="icon-edit"></i> Edit</button>
                <button class="delete btn btn-danger"><i class="icon-trash"></i> Delete</button>
              </p>
            </div>
          </div>
        </script>

        <script id="listContactsTemplate" type="text/template">
          <td><%= first_name %></td>
          <td><%= last_name %></td>
          <td><%= email %></td>
          <td><%= description %></td>
          <td>
            <button class="editContactFormButton btn"><i class="icon-edit"></i> Edit</button>
          </td>
          <td>
            <button class="delete btn"><i class="icon-trash"></i> Delete</button>
          </td>
        </script>

      	<script src="js/jquery-2.0.0.js"></script>
      	<script src="js/underscore.js"></script>
      	<script src="js/backbone.js"></script>
        <script src="js/backbone.bootstrap-modal.js"></script>
      	<script src="js/bootstrap.js"></script>
        <!-- From Juan Pablo Bottaro: https://github.com/linkedin/Backbone.TableView -->
        <script src="js/Backbone.TableView/backbone.tableview.js"></script>

      	<script src="js/main.js"></script>
      	<script src="js/models.js"></script>
      	<script src="js/collections.js"></script>
      	<script src="js/views.js"></script>
      	<script src="js/router.js"></script>

      	<script>
      	new App.Router;
      	Backbone.history.start();

      	App.contacts = new App.Collections.Contacts;
      	App.contacts.fetch().then(function() {
      		new App.Views.App({ collection: App.contacts });
      	});
      	</script>
      </body>
      </html>