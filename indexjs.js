var socket = io.connect('http://localhost:3000');
var height = 0;
// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit('adduser', prompt("What's your name?"));
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    $('#conversation').append('<p><b>' + username + ':</b> ' + data + '</p>');
    $('#conversation').animate({scrollTop: height});
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on('updaterooms', function(rooms, current_room) {
    
    $('#rooms').empty();
    $.each(rooms, function(key, value) {
            
        if(value == current_room){
            $('#rooms').append('<div><a href="#" class="selected">' + value + '</a></div>');
        } else {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+ value +'\')">' + value + '</a></div>');
        }
    });
});

socket.on('updateroomcount', function(newroom){
    $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+ newroom +'\')">' + newroom + '</a></div>');
});

function switchRoom(room){
    socket.emit('switchRoom', room);
}

socket.on('updategame', function (id, v) {
    $('#'+id).text(v);
});


socket.on('onWin', function (who){
    window.alert(who);
});

socket.on('onTie', function (res){
    window.alert(res);
});

socket.on('restartgame', function(){
    for ( var i = 0; i < 9; i++){
        $('#'+i).text('');
    }
});

// on load of page
$(function(){
    // when the client clicks SEND
    $('#datasend').click( function() {
        
        var message = $('#data').val();
        $('#data').val('');
        socket.emit('sendchat', message );
    });

    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
    $('#conversation').each(function(i, value){
        height += parseInt($(this).height());
    });
    height += '';
});

function change(id){
    socket.emit('changeValue', id);
}

function startnew(){
    socket.emit('startover');
}

function createroom(){
    socket.emit('createNewRoom');
}







