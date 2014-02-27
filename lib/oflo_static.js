/*global exports:true module require*/
var connect = require('connect');
var path = require('path');
var statik = connect['static'];
var mime = connect.mime;

exports = module.exports = function(root, options) {
	options = options || {};
	options.maxAge = options.dev ? (120 * 60000) : 0; // 2 hrs cache, or no cache in dev mode
	options.hidden = true;
	
	

/* To run the oflo client code, we need the following resource mapping, plus the mappings required for 'orion_static'.
 * The Orionode client code selectively "overrides" some resource from orion_static to provide its own implementation (eg. defaults.pref)
 *
 * Web path      File path                           Comment
 * -----------------------------------------------------------------------------------
 *   /           browser                 Mounts Orionode's plugin setup, and plugin code.
 *                                                    into a single middleware.
 */
	return connect()
		.use(statik(root, options));
};