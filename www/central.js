var net = require('net');
const spawn = require('child_process').spawn;
var io = require('socket.io-client')('http://localhost:3000');
var fs = require('fs');

var _this = this;

// change it! Note line 3 may need to change!
var playlist = '/etc/ices/playlist.txt';
var host = '127.0.0.1';
var port = 9001;
// end of change it!

module.exports.ListenSync = function(){

	net.createServer(function(sock){
		
		var tmpStr = "",serve;
		var id = sock.remoteAddress + ":" + sock.remotePort;

		console.log('tcp client Connected : ' +
					sock.remoteAddress + ":" + sock.remotePort + "\n");
	
		sock.on('data',function(data){
			
			if(data.toString().substring(0,9) == "Serveinfo"){
				console.log('serve info arrives');
				serve = data.toString().substring(12,data.toString().indexOf("}")+1);
				var tmp = data.toString().substring(data.toString().indexOf("}")+2,data.toString().length);
				tmpStr += tmp;
				io.emit('serveInfo',[serve,id]);
			}
			else if(data.toString().length > 27 && data.toString().substring(data.toString().length - 27, data.toString().length) == "Done with sending snapshot."){
				tmpStr += data.toString().substring(0,data.toString().length - 27);
				io.emit('snap',{ data: tmpStr , id : id });
				tmpStr = "";
			} 
			else{
				tmpStr += data.toString();
			}
		});
	
		sock.on('close',function(data){
			console.log('socket lost');
			io.emit('Resnap',id);
		});
	}).listen(port,host);

	console.log('listen on '+ host + ':' + port);
};

module.exports.Rappend = function(list,songname,path,OK,io){
	var stream = fs.createReadStream(list);
	var found = false;
	var flag = 0;
	stream.on('data',function(d){
		  if(!found) 
		  	  found = !!(''+d).match(path)
		  else{
			console.log('song already on list!');
			flag = 1;
		  }
	});
	stream.on('error',function(err){
		startAppend(list,songname,path,"IO error",io);
	});
	stream.on('close',function(err){
		    if(flag == 1){
		    	startAppend(list,songname,path,"Already in Queue",io);
			}
		    else{
		    	startAppend(list,songname,path,OK,io);
		    }
	});

	function startAppend(list,songname,path,OK,io){
		if(OK == "All Green"){
			fs.appendFile(list, path + '\n\n', function (err) {
				if(err){
					io.emit('Rback',songname + " : IO Error" );
				}
				else{
					io.emit('Rback',songname + " : " + "All Green");
				}
			});
		}else{
			io.emit('Rback',songname + " : " + OK);
		}
		console.log('leaving Rappend');
	}
};
module.exports.Rsong = function(serverpos,songname,songfcs,io){
	
	var opt = [
				'../client.py', 
				serverpos.host+":"+serverpos.port, 
				songname,
				songfcs
		];
	const ls = spawn('python',opt);

	console.log('spawning python... opts = {'+ serverpos.host + ":" + serverpos.port+','+ songname+','+ songfcs+'}'); 

	ls.stdout.on('data', function(data){
		console.log('return ' + data.toString());		
		_this.Rappend(playlist,songname,__dirname + "/Storage/" + songname, data.toString().substring(0,data.toString().length-1),io);
	});

	ls.on('close', function(code){
		console.log('child process exited.');
	});
};

