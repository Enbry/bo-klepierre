var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, bodyParser = require('body-parser')
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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
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
  res.send('Accueil');
});

app.post('/rasp', function(req,res){
  var hostName = req.body.hostName;
  var raspIp = req.body.raspIP;
  console.log(hostName + ' ' + raspIp);
  res.send(req.body);
});

app.get('/rasp', function(req, res){
  //var hostName = req.body.hostName;
  //var raspIp = req.body.raspIP;
  console.log(req.params);
  /*res.render('index', {
    hostName: hostName,
    raspIp: raspIP
  });*/
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
