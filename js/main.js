// function:
(function(){
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {},
		facebookUser: new FacebookUser(null, {scope: ['email']})
	};

	window.vent = _.extend({}, Backbone.Events);

	window.template = function(id, data) {
		if (typeof data === 'undefined') {
			return _.template( $('#' + id).html() );
		} else {
			return _.template( $('#' + id).html(), data );
		}
	};

	FB.init({

    // Facebook App built in Facebook Developer section <https://developers.facebook.com/apps>
		appId: '386499554797554'
	});
})();

/*
|--------------------------------------------------------------------------
| Underscore cookie mixin from @wookiehangover https://github.com/wookiehangover/underscore.cookie
|--------------------------------------------------------------------------
|
| A port of the ever popular $.cookie as an underscore mixin.
| All credit goes to @carhartl, the maintainer of jQuery.cookie, of which this is a derivative work.
|
| https://github.com/wookiehangover/underscore.cookie
|
*/

/*jshint onevar: false */
(function( root ){

  var toString = Object.prototype.toString;

  var _c = function( key, value, options ) {

    options = options || {};

    if( arguments.length > 1 && toString.call( value ) !== "[object Object]" ) {

      if( value === null || typeof value == "undefined" ) {
        options.expires = -1;
      }

      if( toString.call( options.expires ) == "[object Number]" ) {
        var days = options.expires,
            t = options.expires = new Date();
        t.setDate( t.getDate() + days );
      }

      value = String( value );

      return ( document.cookie = [
        encodeURIComponent( key ), "=",
        options.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''
      ].join('') );
    }

    options = value || {};

    var result,
        decode = options.raw ? function (s) { return s; } : decodeURIComponent;

    return ( result = new RegExp('(?:^|; )' + encodeURIComponent( key ) + '=([^;]*)').exec( document.cookie ) ) ?
            decode( result[1] ) :
            null;
  };

  // Attach to underscore as a mixin
  if( typeof root._ !== "undefined" ) {
    root._.mixin( { cookie: _c } );

  // Or just assign it to window._
  } else {
    root._ = _c;
  }

})( this );
