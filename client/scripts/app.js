// YOUR CODE HERE:


var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  username: null,
  room: 'lobby',
  $msgField: null,
  $messages: null
};

app.init = function(){
  app.username = app._getLocalUsername();
  app.$msgField = $('#message');
  app.$messages = $('#messages');
  app.fetch();
  setInterval(app.fetch, 2000);

  $('#submit').on('click', function(e){
    e.preventDefault();
    var messageText = app.$msgField.val();
    app.send({ roomname: app.room, text: messageText, username: app.username});
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

// message object returned by GET
//     createdAt: "2013-10-07T16:22:03.280Z"
//     objectId: "teDOY3Rnpe"
//     roomname: "lobby"
//     text: "hello"
//     updatedAt: "2013-10-07T16:22:03.280Z"
//     username: "gary"

app._getLocalUsername = function(){
  return window.location.search.split('=')[1];
};


app._renderMessages = function(messages){
  app.$messages.empty(); // TODO: Possibly make this less wasteful
  _(messages).each(function(msgObj){
    app.$messages.append($(app._htmlFromMsgObj(msgObj)));
  });
};

app._htmlEncode = function(unencodedString){
  return $('<div>').text(unencodedString).html();
};

// Given a message object, return an HTML string formatted for our app.
app._htmlFromMsgObj = function(msgObj){
  return '<div class="message"><p>'+app._htmlEncode(msgObj.username)+
      ' said: '+app._htmlEncode(msgObj.text)+
      '<br>On: '+app._htmlEncode(msgObj.createdAt)+
      '</p></div>';
};

app.init();
