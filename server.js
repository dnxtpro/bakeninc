const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const dbConfig = require('./dbConfig'); 
const config = require('./config.js') 
require('dotenv').config()

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Crear la conexión a la base de datos
const connection = mysql.createConnection({
  host: config.SQL,
  user:config.USER,
  password: config.PASS,
  database: 'incidencias',
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err,config.SQL,config.USER);
  } else {
    console.log('Conexión exitosa a la base de datos',config.SQL,config.USER);
  }
});

// Rutas
const authRoutes = require('./Routes/authRoutes');
app.use('/auth', authRoutes);

// Otros middleware y rutas...


app.listen(config.PORT,config.HOST, () => {
    console.log(`Servidor en ejecución en http://${config.HOST}:${config.PORT}`);
});
