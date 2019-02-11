'use strict'

var fs = require('fs');//Importamos FileSystem
var path = require('path');//Importamos el módulo path que nos permite acceder a rutas concretas
var mongoosePagination = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res){
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'});
        }else{
            if(!artist){
                res.status(404).send({message: 'El artista no ha sido encontrado'});
            }else{
                res.status(200).send({artist});
            }
        }
    })
}

function saveArtist(req, res){
    //creamos la variable user
    var artist = new Artist();

    //recogemos en params lo que se nos envía por POST
    var params = req.body;

    console.log(params);
    //Metemos en cara parámetro de user lo que nos llega por POST
    //para poder almacenarlo después en la base de datos.
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'});
        }else{
            if(!artistStored){
                res.status(404).send({message: 'El artista no ha sido guardado'});
            }else{
                res.status(200).send({artist: artistStored});
            }
        }
    });
}

function getArtists(req, res){
    if(req.params.page){
        var page = req.params.page;
    }else{
        var page =1;
    }
    var ItemsPerPAges = 3;
    

    Artist.find().sort('name').paginate(page, ItemsPerPAges, (err, artists, total) => {
        if(err){
            res.status(500).send({message: 'Error en la petición'});
        }else{
            if(!artists){
                res.status(404).send({message: 'No hay artistas'});
            }else{
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                })
            }
        }
    })

}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar al artista.'});
        }else{
            if(!artistUpdated){
                res.status(404).send({message: "No se ha podido actualizar al artista."});
            }else{
                res.status(200).send({artist: artistUpdated})
            }
        }
        

    });
}

function deleteArtist(req, res){
    var artistId = req.params.id;
    
    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if(err){
            res.status(500).send({message: 'Error al eliminar al artista.'});
        }else{
            if(!artistRemoved){
                res.status(404).send({message: "No se ha podido eliminar al artista."});
            }else{
                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
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
                                        res.status(200).send({artistRemoved})
                                    }

                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){//sacamos el nombe de la imagen creada a través de la ruta
        var file_path = req.files.image.path;//guardamos la ruta
        var file_split = file_path.split('/');//partimos la ruta por las barras en un string
        var file_name = file_split[2];//seleccionamos la posición 2, que es donde se ha almacenado el nombre
        var ext_split = file_name.split('.');
        var file_ext = ext_split[1];
        console.log(file_ext);

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){

            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar al artista.'});
                }else{
                    if(!artistUpdated){
                        res.status(404).send({message: "No se ha podido actualizar al artista."});
                    }else{
                        res.status(200).send({image: file_name, artist: artistUpdated})
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
    var pathFile = './uploads/artists/'+imageFile;

    fs.exists(pathFile, function(exists){
        if(exists == true){//Si existe devolvemos la imagen
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message: "No existe la imagen."});
        }
    });
}



module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
};