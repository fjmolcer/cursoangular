'use strict'

var fs = require('fs');//Importamos FileSystem
var path = require('path');//Importamos el módulo path que nos permite acceder a rutas concretas
var mongoosePagination = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res){
    var albumId = req.params.id;

    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if(err){
            res.status(500).send({message: 'Error al solicitar el album'});
        }else{
            if(!album){
                res.status(404).send({message: 'El album no ha sido encontrado'});
            }else{
                res.status(200).send({album});
            }
        }
    })
}

function saveAlbum(req, res){

    var album = new Album();

    //recogemos en params lo que se nos envía por POST
    var params = req.body;

    console.log(params);
    //Metemos en cara parámetro de user lo que nos llega por POST
    //para poder almacenarlo después en la base de datos.
    album.name = params.name;
    album.description = params.description;
    album.image = 'null';
    album.year = params.year;
    album.artist = params.artist;


    album.save((err, albumStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el album'});
        }else{
            if(!albumStored){
                res.status(404).send({message: 'El album no ha sido guardado'});
            }else{
                res.status(200).send({album: albumStored});
            }
        }
    });
}

function getAlbums(req, res){
    var artistId = req.params.artistId;
    if(!artistId){
        var find = Album.find({}).sort('title');
    }else{
        var find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path: 'artist'}).exec((err, albums) =>{
        if(err){
            res.status(500).send({message: 'Error al solicitar albums'});
        }else{
            if(!albums){
                res.status(404).send({message: 'No se han encontrado albums'});
            }else{
                res.status(200).send({albums});
            }
        }
    })

}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar el album.'});
        }else{
            if(!albumUpdated){
                res.status(404).send({message: "No se ha podido actualizar el album."});
            }else{
                res.status(200).send({album: albumUpdated});
            }
        }
        

    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;
    
    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if(err){
            res.status(500).send({message: 'Error al eliminar el album.'});
        }else{
            if(!albumRemoved){
                res.status(404).send({message: "No se ha podido eliminar el album."});
            }else{
                Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
                    if(err){
                        res.status(500).send({message: 'Error al eliminar la canción.'});
                    }else{
                        if(!songRemoved){
                            res.status(404).send({message: "No se ha podido eliminar la canción."});
                        }else{
                            res.status(200).send({albumRemoved})
                        }

                    }
                });
            }
        }
                
    });
}

function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){//sacamos el nombe de la imagen creada a través de la ruta
        var file_path = req.files.image.path;//guardamos la ruta
        var file_split = file_path.split('/');//partimos la ruta por las barras en un string
        var file_name = file_split[2];//seleccionamos la posición 2, que es donde se ha almacenado el nombre
        var ext_split = file_name.split('.');
        var file_ext = ext_split[1];
        console.log(file_ext);

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){

            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar el album.'});
                }else{
                    if(!albumUpdated){
                        res.status(404).send({message: "No se ha podido actualizar el album."});
                    }else{
                        res.status(200).send({image: file_name, album: albumUpdated})
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

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/albums/'+imageFile;

    fs.exists(pathFile, function(exists){
        if(exists == true){//Si existe devolvemos la imagen
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message: "No existe la imagen."});
        }
    });
}



module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
};