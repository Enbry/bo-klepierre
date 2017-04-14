var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, PlaylistProvider = require('./playlistprovider').PlaylistProvider
, exec = require('child_process').exec
, os = require('os')
, get_ip = require('ipware')().get_ip
, qs = require('querystring')
, requestIp = require('request-ip')
, ip = require("ip");

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var playlistProvider= new PlaylistProvider('localhost', 27017);

//Routes

//index
app.get('/', function(req, res){

  var hostName = os.hostname();
  var postHostName; 
  if (req.method == 'POST') {
    var body = '';

    req.on('data', function (data) {
      body += data;

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
      req.connection.destroy();
    });

    req.on('end', function () {
      var post = qs.parse(body);
      // use post['blah'], etc.
      console.log(post.hostName);
      var postHostName = post.hostName;
    });
  }
  var clientIp = req.ip;
  //  var testip = ip.address();
  console.log(clientIp);
  res.render('index', {
    title: 'Accueil',
    rasp: hostName,
    raspIp: clientIp,
    log: postHostName
  });
});

app.get('/playlist', function(req, res){

  playlistProvider.findAll(function(error, emps){
    res.render('playlist_list', {
      title: 'Playlists',
      playlists:emps
    });
  });
});

//new playlist
app.get('/playlist/new', function(req, res) {
  res.render('playlist_new', {
    title: 'New Playlist'
  });
});

//save new playlist
app.post('/playlist/new', function(req, res){
  playlistProvider.save({
    title: req.param('title'),
    description: req.param('description'),
    date: req.param('date'),
  }, function( error, docs) {
    res.redirect('/')
  });
});

//update an playlist
app.get('/playlist/:id/edit', function(req, res) {
  playlistProvider.findById(req.param('_id'), function(error, playlist) {
    res.render('playlist_edit',
    {
      title: playlist.title,
      playlist: playlist
    });
  });
});

//save updated playlist
app.post('/playlist/:id/edit', function(req, res) {
  playlistProvider.update(req.param('_id'),{
    title: req.param('title'),
    description: req.param('description'),
    date: req.param('date'),
  }, function(error, docs) {
    res.redirect('/')
  });
});

//delete an playlist
app.post('/playlist/:id/delete', function(req, res) {
  playlistProvider.delete(req.param('_id'), function(error, docs) {
    res.redirect('/')
  });
});

app.listen(process.env.PORT || 3000);
