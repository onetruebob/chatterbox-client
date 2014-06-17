// YOUR CODE HERE:

// parkpigz" onmouseover="alert('pownage!')
// parkpigz' onmouseover='alert("pownage!")   Breaks ours from the user form

var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  username: null,
  room: 'lobby',
  rooms: {},
  friends: {},
  $roomSelect: null,
  $nameField: null,
  $msgField: null,
  $messages: null
};

app.init = function(){
  if(app.$messages) { //If we've been able to get jQuery nodes in previous calls
    return;
  }

  app.username = app._getLocalUsername();
  app.$roomSelect = $('#roomSelect');
  app.$nameField = $('#username');
  app.$nameField.val(app.username);
  app.$msgField = $('#message');
  app.$messages = $('#chats');
  app.fetch();
  setInterval(app.fetch, 2000);

  app.$nameField.on('change',function(e){
    app.username = app.$nameField.val() || 'anonymous';
    var newSearch = 'username=' + app.username;
    window.location.search = newSearch;
  });

  $('#send .submit').on('click', function(e){
    e.preventDefault();
    $(this).trigger('submit');
  });

  $('#send .submit').on('submit', function(e){
    app.handleSubmit();
  });

};

app.send = function(message){
  $.ajax({
    // always use this url
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent'); ////////////////////////////////////////////////
      app.$msgField.val('');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message'); ////////////////////////////////////////////////
    }
  });
};

app.fetch = function(){
  $.ajax({
    url: app.server,
    type: 'GET',
    data: {order: '-updatedAt',
           limit: 50},
    success: function (data) {
      console.dir(data); ////////////////////////////////////////////////
      console.log('chatterbox: fetch completed.'); ////////////////////////////////////////////////

      app._renderMessages(data.results);
    },
    error: function (data){
      console.log('chatterbox: fetch failed.'); ////////////////////////////////////////////////
    }
  });
};

app.handleSubmit = function (){
  var messageText = app.$msgField.val();
  app.send({ roomname: app.room, text: messageText, username: app.username});
};

app.addRoom = function (uRoomName) {
  var sRoomName = app._htmlEncode(uRoomName);
  if(!app.rooms[sRoomName]) {
    var roomHtml = '<option value="'+sRoomName+'">'+sRoomName+'</option>';
    app.rooms[sRoomName] = $(roomHtml);
    app.$roomSelect.append(app.rooms[sRoomName]);
  }
};

app.addMessage = function(msgObj){
  var $msgNode = $(app._htmlFromMsgObj(msgObj));
  var $userNameNode = $msgNode.find('.username');
  if(app.friends[$userNameNode.text()]) {
    $userNameNode.addClass('friend');
  }
  app.$messages.append($msgNode);
  $userNameNode.on('click', function(e){
    e.preventDefault();
    app.addFriend($(this).text());
  });
  app.addRoom(msgObj.roomname);
};

app.addFriend = function (friendName){
  app.friends[friendName] = true;
};

app.clearMessages = function(){
  app.$messages.empty();
};

// message object returned by GET
//     createdAt: "2013-10-07T16:22:03.280Z"
//     objectId: "teDOY3Rnpe"
//     roomname: "lobby"
//     text: "hello"
//     updatedAt: "2013-10-07T16:22:03.280Z"
//     username: "gary"

app._getLocalUsername = function(){
  return decodeURI(window.location.search.split('=')[1]);
};

app._renderMessages = function(messages){
  app.clearMessages();
  _(messages).each(function(msgObj){
    app.addMessage(msgObj);
  });
};

app._htmlEncode = function(unencodedString){
  return $('<div>').text(unencodedString).html();
};

// Given a message object, return an HTML string formatted for our app.
app._htmlFromMsgObj = function(msgObj){
  return '<div class="message"><p>'+
      '<span class="username">'+app._htmlEncode(msgObj.username)+'</span>'+
      ' said: '+app._htmlEncode(msgObj.text)+
      '<br>On: '+app._htmlEncode(msgObj.createdAt)+
      '</p></div>';
};

//app.init();
