'use strict'

var fs = require('fs');//Importamos FileSystem
var path = require('path');//Importamos el módulo path que nos permite acceder a rutas concretas
var mongoosePagination = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res){
    var songId = req.params.id;

    Song.findById(songId).populate({path: 'album'}).exec((err, song) => {
        if(err){
            res.status(500).send({message: 'Error al solicitar la canción'});
        }else{
            if(!song){
                res.status(404).send({message: 'La canción no ha sido encontrado'});
            }else{
                res.status(200).send({song});
            }
        }
    });
}

function saveSong(req, res){

    var song = new Song();

    //recogemos en params lo que se nos envía por POST
    var params = req.body;

    console.log(params);
    //Metemos en cara parámetro de user lo que nos llega por POST
    //para poder almacenarlo después en la base de datos.
    song.name = params.name;
    song.number = params.number;
    song.file = 'null';
    song.duration = params.duration;
    song.album = params.album;


    song.save((err, songStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar la canción'});
        }else{
            if(!songStored){
                res.status(404).send({message: 'La canción no ha sido guardada'});
            }else{
                res.status(200).send({song: songStored});
            }
        }
    });
}

function getSongs(req, res){
    var albumId = req.params.albumId;
    if(!albumId){
        var find = Song.find({}).sort('album');
    }else{
        var find = Song.find({album: albumId}).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs) =>{
        if(err){
            res.status(500).send({message: 'Error al solicitar canciones'});
        }else{
            if(!songs){
                res.status(404).send({message: 'No se han encontrado canciones'});
            }else{
                res.status(200).send({songs});
            }
        }
    })

}

function updateSong(req, res){
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if(err){
            res.status(500).send({message: 'Error en el servidor.'});
        }else{
            if(!songUpdated){
                res.status(404).send({message: "No se ha podido actualizar la canción."});
            }else{
                res.status(200).send({song: songUpdated});
            }
        }
        

    });
}

function deleteSong(req, res){
    var songId = req.params.id;
    
    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if(err){
            res.status(500).send({message: 'Error en el servidor.'});
        }else{
            if(!songRemoved){
                res.status(404).send({message: "No se ha podido eliminar la canción."});
            }else{
                res.status(200).send({songRemoved})
            }

        }
    });
}


function uploadFile(req, res){
    var songId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){//sacamos el nombe de la cancion creada a través de la ruta
        var file_path = req.files.file.path;//guardamos la ruta
        var file_split = file_path.split('/');//partimos la ruta por las barras en un string
        var file_name = file_split[2];//seleccionamos la posición 2, que es donde se ha almacenado el nombre
        var ext_split = file_name.split('.');
        var file_ext = ext_split[1];
        

        if(file_ext == 'mp3' || file_ext == 'ogg'){

            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error en el servidor.'});
                }else{
                    if(!songUpdated){
                        res.status(404).send({message: "No se ha podido actualizar la canción."});
                    }else{
                        res.status(200).send({song: songUpdated})
                    }
                }
            });

        }else{
            res.status(200).send({message: "Extensión de archivo no válida."});
        }
    }else{
        res.status(200).send({message: "No ha subido ninguna imágen."});
    }
}

function getSongFile(req, res){
    var songFile = req.params.imageFile;
    var pathFile = './uploads/songs/'+songFile;

    fs.exists(pathFile, function(exists){
        if(exists == true){//Si existe devolvemos la imagen
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message: "No existe la canción."});
        }
    });
}



module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
};