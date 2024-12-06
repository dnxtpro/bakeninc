const { connect, use } = require('../Routes/authRoutes');
const dbConfig = require('../dbConfig'); 
const mysql = require('mysql2');
const connection = mysql.createConnection(dbConfig);
const moment = require('moment');


const getAll=()=>{
    return new Promise ((resolve,reject)=>{
        connection.query('SELECT * FROM users',(err,rows)=>{
            if(err) reject(err)
            resolve(rows);
        });
    });
};
const getByUsername = (username)=>{
    console.log(username)
    return new Promise((resolve,reject)=>{
connection.query('SELECT * FROM users WHERE username=? ',[username],(err,rows)=>{
    if(err) reject(err)
    resolve(rows[0])

        });
    });
};
const saveTokenInDB = (token, userId, creationTime) => {
    const query = `INSERT INTO registro (userId, token, creationtime, lastchange) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), lastchange = VALUES(lastchange)`;
    connection.query(query, [userId, token, creationTime, creationTime], (error, results) => {
        if (error) {
            console.error('Error al guardar el token en la base de datos:', error);
        } else {
            console.log('Token guardado en la base de datos correctamente');
        }
    });
};

const edit =({id,username,email,roleName,nombre})=>{
   
    console.log(username,email,roleName,nombre,'editar usuario:')
    return new Promise((resolve,reject)=>{
        connection.query(`UPDATE users SET username =?,email=?,userrole=?,empresa=? WHERE id=?`,[username,email,roleName,nombre,id],(err,result)=>{
            if(err) resolve(err)
            if(result){
                resolve(result)
            };
        });

    });
};
const registro =()=>{
    
console.log('registro???',payload)

}
const insert = ({ username, email, password, userrole, empresa }) => {
    console.log(username, email, password, userrole, empresa, 'alpanpanyalvinovinoi');
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO users (username, email, password, userrole, empresa) VALUES (?, ?, ?, ?, ?)`, [username, email, password, userrole, empresa], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    reject({
                        error: err,
                        message: `Duplicate entry: '${username}' already exists.`
                    });
                } else {
                    console.error(err);
                    reject({
                        error: err,
                        message: 'Error inserting user'
                    });
                }
            } else {
                resolve({
                    message: 'User inserted successfully'
                });
            }
        });
    }).catch(error => {
        // Handle any uncaught promise rejections here
        console.error('Unhandled Promise Rejection:', error);
        throw error; // Re-throw the error to propagate it further if needed
    });
};
const getById=(pId)=>
{
    return new Promise((resolve,reject)=>{
        connection.query('SELECT username,email,userrole,r.rolename,empresa,e.nombre FROM users RIGHT JOIN roles r ON users.userrole=r.id LEFT JOIN empresa e ON users.empresa=e.id WHERE users.id=? ',[pId],(err,rows)=>{
            console.log(pId)
            if (err) reject(err)
            resolve(rows[0])
        });

    });
};
const borrar=(id)=>{
    console.log(id)
    return new Promise((resolve,reject)=>{
        connection.query('DELETE FROM users WHERE id = ?',(id),(err,result)=>{
        if(err) resolve(err)
            if(result){
                resolve(result)
            };
    });
    });
};
const updateLastChange = (userId) => {
    console.log('id para guardar la fecha:', userId);
    const lastChangeTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // First, find the row with the latest creationDate for the given userId
    const findLatestRowQuery = `SELECT id FROM registro WHERE userId = ? ORDER BY creationtime DESC LIMIT 1`;

    connection.query(findLatestRowQuery, [userId], (error, results) => {
        if (error) {
            console.error('Error al buscar la fila más reciente:', error);
            return;
        }

        if (results.length === 0) {
            console.log('No se encontraron filas para el userId:', userId);
            return;
        }

        const latestRowId = results[0].id;

        // Now update the lastchange field of the found row
        const updateLastChangeQuery = `UPDATE registro SET lastchange = ? WHERE id = ?`;

        connection.query(updateLastChangeQuery, [lastChangeTime, latestRowId], (error, results) => {
            if (error) {
                console.error('Error al actualizar la última fecha de modificación:', error);
            } else {
                console.log('Última fecha de modificación actualizada en la base de datos', lastChangeTime);
            }
        });
    });
};

module.exports ={
    getAll: getAll,
    getByUsername:getByUsername,
    insert:insert,
    getById:getById,
    borrar:borrar,
    edit:edit,
    registro:registro,
    saveTokenInDB:saveTokenInDB,
    updateLastChange:updateLastChange,
}