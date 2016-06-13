var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var request = require('./central');
// var ms = require('mediaserver');
// line 88
var io = require('socket.io')(http);
var sr = require('string-similarity');
var fs = require('fs');

var playlist = '/etc/ices/playlist.txt'
// remind that main.js do not share same var playlist with central.js
var str = "";

var Container = {};
//  Container = { name : { 'info':  (host+":"+port) , data:  jsondata } };

var NameContainer = [];
//  NameContainer = [ name ];

var bkContainer = {};
//  bkContainer = { name: [{ info: (host+":"+port) }, data: jsondata }] };
//  name -> list of { info, data }

var mapping = {};
//  mapping = {
//		(host+":"+port) : (host+":"+port) 
//	}

function resnap(id){
	// id = node tcp client socket host:id
	// id = string(host+":"+port)
	
	var flag = 0;
	var removeName = [];
	var newNameContainer = [];

	for(a in Container){
		flag = 0;
		if(Container[a].info == id){
			for(b in bkContainer[a]){
				if(bkContainer[a][b].info == id){
					delete bkContainer[a][b];
				}
			}
			for(b in bkContainer[a]){
				if(typeof bkContainer[a][b] != "undefined"){
					// retsore entry
					console.log('set active to ' + JSON.stringify(bkContainer[a][b],null,4) + ' to restore data!');
					Container[a] = bkContainer[a][b];
					flag = 1;
					break;
				}
			}
			if(flag == 0){
				// songname a is not available in any server
				console.log('song ' + a + ' is no nore available' );
				delete bkContainer[a];
				removeName.push(a);
			}
		}
	}
	for(a in NameContainer){
		if(removeName.indexOf(NameContainer[a]) < 0 )
			newNameContainer.push(NameContainer[a]);
	}
	NameContainer = newNameContainer;
	console.log("Container Remerged!");
}

function onServe(){
	
	// Open for beta testing
	app.use('/Storage', express.static('public'));
	app.use(express.static('files'));

	app.get('/', function(req, res){
		res.sendFile(__dirname + '/index.html');
	});
	
	app.get('/stat', function(req, res){
		res.sendFile(__dirname + '/stat.php');
	});
	
	app.get('/Assets/*', function(req, res){
		res.sendFile(__dirname + '/Assets/'+req.params[0]);
	});

	// if you want to direct access Storage!
	/*app.get('/Storage/*',function(req,res){
		var songname = req.params[0];
		ms.pipe(req,res,'Storage/' + songname);
	});*/

	io.on('connection', function(socket){
	
		var handshake = socket.handshake;
		console.log('a user connected: ' + handshake.address + ", id = " + socket.id);
		
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	
		socket.on('snap',function(infos){
			// data structure of infos = { data: jsonstr, id: clientid (tcp node socket connect addr:port) }
			console.log('detect snapshot send by client [' + infos.id + '] need to merge!');

			var type = 'song';
			if(type == 'song'){
				var tmpjson = JSON.parse(infos.data);

				for(a in tmpjson){
					// typeof a = string
					
					// deal with bkContainer
					if(typeof bkContainer[a] == "undefined"){
						// create new entry
						bkContainer[a] = [{"info": infos.id, "data": tmpjson[a]}];
					}
					else{
						bkContainer[a].push({"info": infos.id, "data": tmpjson[a]});
					}

					// deal with Container
					if(typeof Container[a] == "undefined"){
						Container[a] = { "info": infos.id, "data": tmpjson[a] };
						NameContainer.push(a);
						//console.log('add ' + a + '!');
					}
					else{
						console.log("Found Duplicate data on " + a);
					}
				}
			}
			console.log('snapped.');
		});
	
		socket.on('serveInfo',function(infos){
			console.log('mapping ' + infos[1] + ' to ' + infos[0]);
			mapping[infos[1]] = infos[0];
		});

		socket.on('Resnap',function(id){
			console.log('client [' + mapping[id] + '] abort.');
			console.log('Snapshot of [' + mapping[id] + '] need to Remerge!');
		
			resnap(id);
			delete mapping[id];
		});
	
		socket.on('Rsong',function(name){
			// pass socket for Rsong() to emit when it finished.
			
			if(name == "") return;
			
			// check if it exists
			var paths = __dirname + "/Storage/" + name + "";
			
			fs.exists(paths,function(exists){
				if(exists){
					console.log('Quick abort Rsong due to ' + name + ' exists.');
					request.Rappend(playlist,name,paths,"All Green",io);
				}
				else{
					console.log('Cache(?) miss, start requesting song ' + name );
					request.Rsong(JSON.parse(mapping[Container[name].info]),name,Container[name].data.FCS,io);
				}
			});
		});

		socket.on('RLsong',function(name){
			console.log("get list of " + name);
			
			if(name == "") return;

			var res = sr.findBestMatch(name,NameContainer);
			res = res.ratings;
			res = res.sort(function(a,b){
				return parseFloat(b.rating) - parseFloat(a.rating);
				// big to small
			});
			var ret = [];
			for(a in res){
				if(ret.length > 10) break;
				if(res[a].rating > 0.3 ) ret.push({ "name": res[a].target, "data": Container[res[a].target].data});
				else break;
			}
			io.emit('RLback',JSON.stringify(ret,null,4));
		});
	});

	http.listen(3000, function(req,res){
		console.log('listening on *:3000');
		request.ListenSync();
	});
}

onServe();
