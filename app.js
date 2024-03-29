/*******************************************************************************
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global __dirname console module require*/
var connect = require('connect');
var statik = connect['static'];
var http = require('http');
var socketio = require('socket.io');
var path = require('path');
var url = require('url');
var AppContext = require('orion/lib/node_apps').AppContext;
var appSocket = require('orion/lib/node_app_socket');
var orionFile = require('orion/lib/file');
var orionNode = require('orion/lib/node');
var orionWorkspace = require('orion/lib/workspace');
var orionNodeStatic = require('orion/lib/orionode_static');
var orionStatic = require('orion/lib/orion_static');
var ofloStatic = require('./lib/oflo_static');

var LIBS = path.normalize(path.join(__dirname, 'node_modules/orion/lib/'));
var NODE_MODULES = path.normalize(path.join(__dirname, 'node_modules/orion/node_modules/'));
var ORION_CLIENT = path.normalize(path.join(__dirname, 'node_modules/orion/lib/orion.client/'));
var OFLO_CONTENT = path.normalize(path.join(__dirname, 'browser/'));

function handleError(err) {
	throw err;
}

function noop(req, res, next) { next(); }

function auth(options) {
	var pwd = options.password || (options.configParams && options.configParams.pwd) || null;
	if (typeof pwd === 'string' && pwd.length > 0) {
		return connect.basicAuth(function(user, password) {
			return password === pwd;
		});
	}
	return noop;
}

function logger(options) {
	return options.log ? connect.logger('tiny') : noop;
}

function startServer(options) {

	options = options || {};
	var workspaceDir = options.workspaceDir, configParams = options.configParams;
	try {
		var appContext = new AppContext({fileRoot: '/file', workspaceDir: workspaceDir, configParams: configParams});

		// HTTP server
		var app = connect()
			.use(logger(options))
			.use(connect.urlencoded())
			.use(auth(options))
			.use(connect.compress())
			// static code
			.use(ofloStatic(OFLO_CONTENT, {}))
			.use(orionNodeStatic(path.normalize(path.join(LIBS, 'orionode.client/')), {
				socketIORoot: path.resolve(NODE_MODULES, 'socket.io-client/')
			}))
			.use(orionStatic({
				orionClientRoot: ORION_CLIENT,
				dev: options.dev
			}))
			// API handlers
			.use(orionFile({
				root: '/file',
				workspaceDir: workspaceDir
			}))
			.use(orionWorkspace({
				root: '/workspace',
				fileRoot: '/file',
				workspaceDir: workspaceDir
			}))
			.use(orionNode({
				appContext: appContext,
				root: '/node'
			}))
			.listen(options.port);
		// Socket server

		app.on('error', handleError);
		return app;
	} catch (e) {
		console.log('War hier:'+e.toString());
		handleError(e);
	}
}

module.exports = startServer;
