'use strict'
var bcrypt = require('bcrypt-nodejs');//Para encrptar la contraseña
var User = require('../models/user');//Llamamos al modelo de usuario que hemos creado anteriormente
var jwt = require('../services/jwt'); //Llamamos el método que hemos creado para general el token
var fs = require('fs');//Importamos FileSystem
var path = require('path');//Importamos el módulo path que nos permite acceder a rutas concretas



function pruebas(req, res){
    res.status(200).send({
        message: 'Probando una acción del controlador del api rest con Node y MongoDB'

    });
}

function saveUser(req, res){
    //creamos la variable user
    var user = new User();

    //recogemos en params lo que se nos envía por POST
    var params = req.body;

    console.log(params);
    //Metemos en cara parámetro de user lo que nos llega por POST
    //para poder almacenarlo después en la base de datos.
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if(params.password){
        //Encriptar contraseña y guardar datos
        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null){
                //Guardar usuario
                user.save((err, userStored) => {
                    if(err){
                        res.status(500).send({message: 'Error al guardar al usuario'});
                    }else{
                        if(!userStored){
                            res.status(404).send({message:'No se ha guardado al usuario'});
                        }else{
                            res.status(200).send({user: userStored});
                        }
                    }
                })


            }else{
                res.status(200).send({message: 'Introduce todos los datos'});
            }

        });

    }else{
        res.status(200).send({message: 'Introduce la contraseña'});
    }


}

function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password= params.password;
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
            res.status(500).send({message: 'Error en la petición'});

        }else{
            if(!user){
                res.status(404).send({message: 'El usuario no existe'});
            }else{
                //Comprobar la contraseña
                bcrypt.compare(password, user.password, function(err, check){
                    if(check){
                        //devolver los datos del usuario logueado
                        if(params.gethash){
                            //devolver un token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            })
                        }else{
                            res.status(200).send({user});
                        }
                    }else{
                        res.status(404).send({message: 'El usuario no ha podido loguearse'});
                    }
                })
            }
        }
    });

  


}
function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdate) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar el usuario.'});
        }else{
            if(!userUpdate){
                res.status(404).send({message: "No se ha podido actualizar el usuario."});
            }else{
                res.status(200).send({user: userUpdate})
            }
        }
        

    });
}
function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){//sacamos el nombe de la imagen creada a través de la ruta
        var file_path = req.files.image.path;//guardamos la ruta
        var file_split = file_path.split('/');//partimos la ruta por las barras en un string
        var file_name = file_split[2];//seleccionamos la posición 2, que es donde se ha almacenado el nombre
        var ext_split = file_name.split('.');
        var file_ext = ext_split[1];
        console.log(file_ext);

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){

            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdate) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar el usuario.'});
                }else{
                    if(!userUpdate){
                        res.status(404).send({message: "No se ha podido actualizar el usuario."});
                    }else{
                        res.status(200).send({image: file_name, user: userUpdate})
                    }
                }
            });

        }else{
            res.status(200).send({message: "Extención de archivo no válida."});
        }
    }else{
        res.status(200).send({message: "No ha subido ninguna imágen."});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/'+imageFile;

    fs.exists(pathFile, function(exists){
        if(exists == true){//Si existe devolvemos la imagen
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message: "No existe la imagen."});
        }
    });
}

module.exports = { //exportamos los métodos que hemos creado.
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};