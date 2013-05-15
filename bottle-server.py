import os
from sys import argv
import bottle
from bottle import route, run, static_file, redirect, request, error, template, get, post, put, delete, install
from bottle_mongo import MongoPlugin
import json
from pymongo import Connection
from bson import json_util
from bson.objectid import ObjectId

bottle.debug(True)


'''
MongoDB Connection
'''
if os.environ.get('MONGOHQ_URL') is None:
    install(MongoPlugin(uri=os.environ.get('MONGOHQ_URL'), db='contacts', json_mongo=True))
else:
    install(MongoPlugin(uri='localhost', db='contacts', json_mongo=True))

# static files (js,css,partials) set up

@route('/favicon.ico')
def favicon():
    return static_file('favicon.ico', root='./app/')

@route('/css/:path#.+#')
def server_static(path):
    return static_file(path, root='./css/')

@route('/img/:path#.+#')
def server_static(path):
    return static_file(path, root='./img/')

@route('/js/:path#.+#')
def server_static(path):
    return static_file(path, root='./js/')

@route('/font/:path#.+#')
def server_static(path):
    return static_file(path, root='./font/')


#
#--------------------------------------------------------------------------
# REST API
#--------------------------------------------------------------------------
#
@get('/contacts')
def get_contacts(mongodb):
    # Get all contacts

    return mongodb.contacts.find()

@get('/contacts/<id:re:[a-zA-Z0-9]+>')
def get_contact(id, mongodb):

    return mongodb.contacts.find_one({'_id': ObjectId(id)})

@post('/contacts')
def post_contacts(mongodb):

    # No validation on any data!
    contact_id = mongodb.contacts.insert({
        'first_name':  request.json.get('first_name', '').strip(),
        'last_name':   request.json.get('last_name', '').strip(),
        'email':       request.json.get('email', '').strip(),
        'phone':       request.json.get('phone', '').strip(),
        'description': request.json.get('description', '').strip(),
    })

    return { 'id': contact_id }

@put('/contacts/<id:re:[a-zA-Z0-9]+>')
def put_contact(id, mongodb):

    # No validation on any data!
    mongodb.contacts.update(
        { '_id': ObjectId(id) },
        {
            '$set': {
                'first_name':  request.json.get('first_name', '').strip(),
                'last_name':   request.json.get('last_name', '').strip(),
                'email':       request.json.get('email', '').strip(),
                'phone':       request.json.get('phone', '').strip(),
                'description': request.json.get('description', '').strip(),
                'fb_id':       request.json.get('fb_id', '').strip(),
            }
        }
    )

    return { 'message': 'Updated successfully' }

@delete('/contacts/<id:re:[a-zA-Z0-9]+>')
def delete_contact(id, mongodb):

    mongodb.contacts.remove({ '_id': ObjectId(id) })
    return { 'message': 'Deleted successfully' }

@route('/')
@route('/index.html')
def index():
    return template('./index.html')

# start application
if os.environ.get('PORT') is None:
    run(host='contacts.dev', port=argv[1], reloader=True)
else:
    run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
