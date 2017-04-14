var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

PlaylistProvider = function(host, port) {
  this.db= new Db('node-mongo-playlist', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


PlaylistProvider.prototype.getCollection= function(callback) {
  this.db.collection('playlists', function(error, playlist_collection) {
    if( error ) callback(error);
    else callback(null, playlist_collection);
  });
};

//find all playlists
PlaylistProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, playlist_collection) {
      if( error ) callback(error)
      else {
        playlist_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//find an playlist by ID
PlaylistProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, playlist_collection) {
      if( error ) callback(error)
      else {
        playlist_collection.findOne({_id: playlist_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


//save new playlist
PlaylistProvider.prototype.save = function(playlists, callback) {
    this.getCollection(function(error, playlist_collection) {
      if( error ) callback(error)
      else {
        if( typeof(playlists.length)=="undefined")
          playlists = [playlists];

        for( var i =0;i< playlists.length;i++ ) {
          playlist = playlists[i];
          playlist.created_at = new Date();
        }

        playlist_collection.insert(playlists, function() {
          callback(null, playlists);
        });
      }
    });
};

// update an playlist
PlaylistProvider.prototype.update = function(playlistId, playlists, callback) {
    this.getCollection(function(error, playlist_collection) {
      if( error ) callback(error);
      else {
        playlist_collection.update(
					{_id: playlist_collection.db.bson_serializer.ObjectID.createFromHexString(playlistId)},
					playlists,
					function(error, playlists) {
						if(error) callback(error);
						else callback(null, playlists)
					});
      }
    });
};

//delete playlist
PlaylistProvider.prototype.delete = function(playlistId, callback) {
	this.getCollection(function(error, playlist_collection) {
		if(error) callback(error);
		else {
			playlist_collection.remove(
				{_id: playlist_collection.db.bson_serializer.ObjectID.createFromHexString(playlistId)},
				function(error, playlist){
					if(error) callback(error);
					else callback(null, playlist)
				});
			}
	});
};

exports.PlaylistProvider = PlaylistProvider;
