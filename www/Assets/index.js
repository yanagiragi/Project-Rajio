var socket = io();
var nowname = "";
var kolor = ["red lighten-3",
			"pink lighten-3",
			"purple lighten-3",
			"deep-purple lighten-3",
			"indigo lighten-3",
			"blue lighten-3",
			"light-blue lighten-3",
			"cyan lighten-3",
			"teal lighten-3",
			"green lighten-3",
			"light-green lighten-3",
			"lime lighten-3",
			"yellow lighten-3",
			"orange lighten-3",
			"deep-orange lighten-3",
			"brown lighten-3"];
var kolor_pre = 4;

function tryget(errcount,name,ele){
	
	$(ele).html("<i class=\"material-icons\">loop</i>");
	
	if(errcount < 5){
		console.log('emitting '+ name);
		socket.emit('Rsong',name);
	}
	else{
		$(ele).html("<i class=\"material-icons\">error</i>");
		Materialize.toast('Timeout!', 4000) // 4000 is the duration of the toast
		$('.progress').addClass('nonactive');
		return false;
	}

	socket.removeListener('Rback').on('Rback',function(data){
		console.log("now err = " + errcount);
		console.log('Result : [' + data + "]");

		if(data.substring(data.length-9, data.length) == "All Green"){
			errcount = 0;
			var song = data.substring(0,data.toLowerCase().indexOf(".mp3")+4);
			$(ele).html("<i class=\"material-icons\">done</i>");
			$(ele).removeClass('rsong');
			$(ele).unbind('click');
			Materialize.toast('Success!', 4000) // 4000 is the duration of the toast
			$('.progress').addClass('nonactive');
		}
		else{
			tryget(errcount+1,name,ele);
		}
	});
}

$(document).ready(function(){
   $.ajaxSetup({ cache: false });
   // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered   
   $('.modal-trigger').leanModal();
   
   $('#titlebtn').unbind('click').click(function(event){
		$('#modal1').openModal();
		
		var r = Math.floor((Math.random() * kolor.length)); 
		$(this).removeClass(kolor[kolor_pre]).addClass(kolor[r]);
		kolor_pre = r;		
   });
   
	$.ajax({
		url:"http://192.168.1.131:8000/status-json.xsl",
		type : "GET",
		dataType: "text",
		success:function(data){  
			var title = data.substring(data.indexOf("title")+7,data.indexOf("dummy")-2);				
			nowname = title;
			$('#son').html(title);
		},error:function(err){                                                                 
			
		},timeout: 2000		
	}); 	
	
	$('#triggers').unbind('click').click(function(event){
		console.log('trigger!');
		$('.progress').removeClass('nonactive');
		socket.emit('RLsong',$('#Rname').val());		
	});
	
	setInterval(function(){
		getname();
	},3000);
	
	socket.removeListener('RLback').on('RLback',function(data){
		data = JSON.parse(data);
		var res = "";
		for(a in data){
			res += "<tr>" + 
				  "<td style=\"padding-left:7px;\"><a href=\"#!\" class=\"rsong btn-floating btn-small waves-effect waves-light  red darken-1\" value=\"" + data[a].name + "\"><i class=\"material-icons\">play_arrow</i></a></td>" +
				  "<td>"+data[a].name+"</td>" +
				  "<td>"+data[a].data.title+"</td>" +
				  "<td>"+data[a].data.artist+"</td>" +
				  "<td>"+data[a].data.album+"</td>" +
				  "<td>"+data[a].data.track+"</td></tr>";
		}
		if(res == "") 
			Materialize.toast('Not Found!', 4000) // 4000 is the duration of the toast
		else
			Materialize.toast('Found!', 4000) // 4000 is the duration of the toast
		$('#keyentry').html(res);
		$('.progress').addClass('nonactive');
		$('.rsong').unbind('click').click(function(event){
			var val = this.getAttribute("value");
			$('.progress').removeClass('nonactive');
			tryget(0,val,this);
		});
	});
});
  
function getname(){
	$.ajax({
		url:"http://192.168.1.131:8000/status-json.xsl",
		type : "GET",
		dataType: "text",
		success:function(data){  
			var title = data.substring(data.indexOf("title")+7,data.indexOf("dummy")-2);				
			$('#son').html(title);
			if(title != nowname){
				console.log('emit state-change!');
				//socket.emit('state-Change','');
				nowname = title;
			}
		},error:function(err){                                                                 
			
		}
	}); 	
}

