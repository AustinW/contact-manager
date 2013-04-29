import os
from os import environ as env
from sys import argv
import bottle
import pywapi
from bottle import route, run, static_file, redirect, request, error, template, get, post, put, delete
import json
from pymongo import Connection
from bson import json_util
from bson.objectid import ObjectId

bottle.debug(True)

# Initiate MongoDB Connection
pyMongoConnection = Connection('localhost', 27017)
# Connect to the contacts database
pyMongoDB = pyMongoConnection.contacts

# static files (js,css,partials) set up

@route('/favicon.ico')
def favicon():
    return static_file('favicon.ico', root='./app/')

@route('/css/:path#.+#')
def server_static(path):
    return static_file(path, root='./public/css/')

@route('/img/:path#.+#')
def server_static(path):
    return static_file(path, root='./public/img/')

@route('/js/:path#.+#')
def server_static(path):
    return static_file(path, root='./public/js/')

@route('/font/:path#.+#')
def server_static(path):
    return static_file(path, root='./public/font/')


#
#--------------------------------------------------------------------------
# Rest API
#--------------------------------------------------------------------------
#
# Straight 1:1 conversion from laravel implementation
#
@get('/contacts')
def get_contacts():
    # Get all contacts

    contacts = pyMongoDB.contacts
    all_contacts = contacts.find()
    return json_util.dumps(all_contacts)

@get('/contacts/<id:re:[a-zA-Z0-9]+>')
def get_contact(id):
    # Get one contact
    contacts = pyMongoDB.contacts

    contact = contacts.find_one({'_id': ObjectId(id)})
    return json.dumps(contact, default=json_util.default)

@post('/contacts')
def post_contacts():
    # Select the contacts collection
    contacts = pyMongoDB.contacts

    contact_id = contacts.insert(request.json)
    newContact = contacts.find_one({'_id': contact_id})

    return json.dumps(newContact, default=json_util.default)

@put('/contacts/<id:re:[a-zA-Z0-9]+>')
def put_contact(id):
    contacts = pyMongoDB.contacts

    contact = contacts.find_one({'_id': ObjectId(id)})

    for key, value in request.json.iteritems():
        if (key != '_id'):
            contact[key] = value

    contacts.save(contact)

    return json.dumps(contact, default=json_util.default)

@delete('/contacts/<id:re:[a-zA-Z0-9]+>')
def delete_contact(id):
    contacts = pyMongoDB.contacts

    contacts.remove({'_id': ObjectId(id)})

    return {'message': 'success'}


@route('/')
@route('/index.html')
def index():
    return template('./app/views/index.html')

# start application
bottle.run(host='0.0.0.0', port=argv[1], reloader=True)
