var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

//Room is declared as an class with it's own variables for tracking game progress within each room
class Room {
  constructor(id,arrX, arrO,turn,count,p1,p2,pc) {
  	    this.id = id;		//Room ID
	    this.arrX = arrX;		//Stores positions of X on the screen
	    this.arrO = arrO;		//Stores positions of O on the screen
	    this.turn = turn;		//Used to toggle chances between players
	    this.count = count;		//Records the total number of moves happening in a game. When equal to 9 signifies game end.
	    this.p1 = p1;		//Stores username of player1
	    this.p2 = p2;		//Stores username of player2
	    this.pc = pc;  		//Stores player count in a room. Max allowed to play a game is 2. Others can view the match.
	}
}

//Creating a new Room object and adding to Rooms array
var room1 = new Room('room1',[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],0,0,'p1','p2',0);
var rooms = [room1];

//roomcount is used to keep track of the number of rooms
var roomcount = 1;

//username array contains the list of users who have connected to the server
var usernames = {};

//Requesting static homepage of the clients - index.html
app.use(express.static(__dirname + '/bower_components'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

//Module executes when a new connection is initiated
io.sockets.on('connection', function(socket) {  

    console.log('Client connected...');

   	// module to add an user
	socket.on('adduser', function(username) {
		socket.username = username; 	// Storing client name
		socket.room = room1;		//adding socket to room1
		
		//pc tracks the count of players till it reaches 2
		room1.pc++;	
		if(room1.pc <= 2){
			initializePlayers(username);
		}
		usernames[username] = username;		// add the client's username to the global list
		socket.join(room1);			// send client to room 1
		socket.emit('updatechat', 'SERVER', 'you have connected to room1'); // echo to client they've connected
		socket.broadcast.to(room1).emit('updatechat', 'SERVER', username + ' has connected to this room'); //echo to room1 abt the new user
		socket.emit('updaterooms', rooms, room1);	//Update the number of rooms
		socket.emit('refreshGame',room1);		// Refresh status of the room
    });

	// when the client emits 'sendchat', this module listens and executes
	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data); //Sends chat message through the chat box
	});
	
	socket.on('switchRoom', function(roomid,clientname) {
		//Mapping roomid to the rooms array to obtain the target room to which the socket is to be switched.
		for(var i = 0; i < rooms.length; i++) {
			if(rooms[i].id == roomid) {
				var newroom = rooms[i];		//newroom is the target room.
			}
		}
		socket.leave(socket.room.id);		// leave the current room (stored in session)
		socket.join(newroom.id);		// join new room, received as function parameter
		newroom.pc++;	//increment the user count in new room
		//initialize players in new room
		if(newroom.pc <= 2) {
			initializePlayers(clientname);
		}
		//send message to the new room saying you have connected to it
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom.id);
		//sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room');
		//Update the current socket.room position to new room
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
		socket.emit('updaterooms', rooms, newroom);		//update the count of the rooms
		socket.emit('refreshGame',newroom);			//update status of the rooms
	});

	// when the user disconnects this module executes
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});

	//This module initiates the changes made by each player and reflects in on screen
	socket.on('changeValue', function(id,clientname){
		var currentroom = socket.room;
		if(currentroom.turn == 0 && clientname == currentroom.p1 )	//condition to allow only player1 to play
		{
			io.in(currentroom).emit('updategame', id, 'x');	//update X move
			currentroom.count += 1;				//increment total steps in the game
	    		currentroom.arrX[id] = Math.pow(2,id);		//Assign Value to X move
			checkWin(currentroom.arrX,'X wins');		//Check for winning combinations
	    		checkDraw();					//Check for Tie condition
			currentroom.turn = 1;				//Toggle player turn
		}	
		if(currentroom.turn == 1 && clientname == currentroom.p2 ) 	//condition to allow only player2 to play
		{
			io.in(currentroom).emit('updategame', id, 'o');	//Update O move
			currentroom.count += 1;				//increment total steps in the game
	    		currentroom.arrO[id] = Math.pow(2,id);		//Assign Value to X move
			checkWin(currentroom.arrO, 'O wins');		//Check for winning combinations
    			checkDraw();					//Check for Tie condition
			currentroom.turn = 0;				//Toggle player turn
		}
	});

	//This module creates a new room and initialises the room properties
	socket.on('createNewRoom', function(){
		roomcount++;
		var e = "room" + roomcount;
		var x = this['room' + roomcount] = new Room(e,[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],0,0);
		rooms.push(x);
		socket.emit('refreshGame',x);
		io.sockets.emit('updateRoomCount', x);
		io.sockets.emit('updatechat', 'SERVER', e + ' has been created');
	});

	/* This module checks if any of the winning combinations is achieved in arrX or arrO. 
	If true it alerts who wins and the game ends else the game continues */
	function checkWin(arr,str)
	{
	    var winCombinations = [7,56,448,73,146,292,273,84];
	    if((arr[0] + arr[1] + arr[2] == 7) || (arr[3] + arr[4] + arr[5] == 56) ||
	    (arr[6] + arr[7] + arr[8] == 448) || (arr[0] + arr[3] + arr[6] == 73) ||
	    (arr[1] + arr[4] + arr[7] == 146) || (arr[2] + arr[5] + arr[8] == 292) ||
	    (arr[0] + arr[4] + arr[8] == 273) || (arr[2] + arr[4] + arr[6] == 84)) {
	    	io.sockets.in(socket.room).emit('onWin', str);
	    }
	}

	//This checks if the total moves in a game has reached 9. If true it declares Tie or the game proceeds.
	function checkDraw() {
		var str = "It's a tie!";
		if (socket.room.count == 9) {
	    		io.sockets.in(socket.room).emit('onTie', str);
	    	}
	}

	//Module to initialize all elements in an array to 0
	function setAll(a, v) {
	    var i, n = a.length;
	    for (i = 0; i < n; ++i) {
	        a[i] = v;
	    }
	}

	//Module to enter details of players in each room
	function initializePlayers(username)
	{
		if(room1.p1 == 'p1')
			room1.p1 = username;
		else
			room1.p2 = username;
	}

});

server.listen(3000, function () {
  	console.log('Example app listening on port 3000!');
});
