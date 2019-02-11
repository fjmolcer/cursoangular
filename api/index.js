'use strict'

var mongoose = require('mongoose');

var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.connect('mongodb://localhost:27017/cursomean2', (err,res) => {
    if(err){
        throw err;
    }else{
        console.log("La conexión a la base de datos está funcionando correctamente...");

        app.listen(port, function(){
            console.log("Servidor del api rest de música escuchando en http://localhost"+port);
            
        })
    }
});