const { connect, use } = require('../Routes/authRoutes');
const dbConfig = require('../dbConfig'); 
const mysql = require('mysql2');
const connection = mysql.createConnection(dbConfig);
const moment = require('moment');


const insert = ({ title, description, userId }) => {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log('Inserting ticket:', title, description, userId, time);

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO ticket (title, description, user, creationtime) VALUES (?, ?, ?, ?)`,
            [title, description, userId, time],
            (err, result) => {
                if (err) {
                    console.error('Error inserting ticket:', err);
                    reject(err); // Reject the promise with the error
                } else {
                    console.log('Ticket inserted successfully:', result);
                    resolve(result);
                }
            }
        );
    });
};
const get=()=>{
    return new Promise ((resolve,reject)=>{
        connection.query('SELECT * FROM ticket',(err,rows)=>{
            if(err) reject(err)
            resolve(rows);
        });
    });
};


module.exports ={
insert:insert,
get:get,
}