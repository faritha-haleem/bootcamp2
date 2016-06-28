var socket = io.connect('http://localhost:3000');
var height = 0;
var clientname;
// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    clientname = prompt("What's your name?");
    socket.emit('adduser', clientname );
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    $('#conversation').append('<p><b>' + username + ':</b> ' + data + '</p>');
    $('#conversation').animate({scrollTop: height});
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on('updaterooms', function(rooms, current_room) {
    //alert(current_room.id);
    $('#rooms').empty();
    $.each(rooms, function(key, value) {
        if(value.id == current_room.id){
            $('#rooms').append('<div><a href="#" class="selected">' + value.id + '</a></div>');
        } 
        else{
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+ value.id +'\')">' + value.id + '</a></div>');
        }
    });
});

//Updates room count whenever new Room is created
socket.on('updateRoomCount', function(value){
    $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+ value.id +'\')">' + value.id + '</a></div>');
});

//This module reflects the changes made to the game on the screen
socket.on('updategame', function (id, v) {
    $('#'+id).text(v);
});

//Alerts when there is a win 
socket.on('onWin', function (who){
    window.alert(who);
});

//Alerts when there is a tie
socket.on('onTie', function (res){
    window.alert(res);
});

//Refreshes client board whenever he enters a new room
socket.on('refreshGame', function(room){
    for ( var i = 0; i < 9; i++){
        $('#'+i).text('');
    }
    for ( var i = 0; i < 9; i++){
        if(room.arrX[i] != '')
        $('#'+i).text('x');
        if(room.arrO[i] != '')
        $('#'+i).text('o');
    }
});

$(function(){

    //Sends data in textbox when SEND button is clicked
    $('#datasend').click( function() {
        
        var message = $('#data').val();
        $('#data').val('');
        socket.emit('sendchat', message );
    });

    //Executes when textbox character count exceeds 13
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    //Used to scroll the chatbox to the latest message sent
    $('#conversation').each(function(i, value){
        height += parseInt($(this).height());
    });
    height += '';

});

//Invoked whenever a box on the board is clicked
function change(id){
    socket.emit('changeValue', id, clientname);
}

//Refreshes page when new game button is clicked
function startnew(){
    location.reload();
}

//Calls createNweRoom function in the server
function createRoom(){
    socket.emit('createNewRoom');
}

//Calls switchRoom function in the server
function switchRoom(roomid){
    socket.emit('switchRoom',roomid, clientname);
}



