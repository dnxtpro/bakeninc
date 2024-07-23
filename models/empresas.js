const { connect } = require('../Routes/authRoutes');
const dbConfig = require('../dbConfig'); 
const mysql = require('mysql2');
const connection = mysql.createConnection(dbConfig);

const insert =({nombre,ciudad,sector,responsable})=>{
    console.log(nombre,ciudad,sector,responsable,'me has jodido el dia')
    return new Promise((resolve,reject)=>{
        connection.query(`INSERT INTO Empresa (nombre,ciudad,sector,responsable) VALUES (?,?,?,?)`,[nombre,ciudad,sector,responsable],(err,result)=>{
            if(err) resolve(err)
            if(result){
                resolve(result)
            };
        });

    });
};
const borrar=(id)=>{
    console.log(id)
    return new Promise((resolve,reject)=>{
        connection.query('DELETE FROM empresa WHERE id = ?',(id),(err,result)=>{
        if(err) resolve(err)
            if(result){
                resolve(result)
            };
    });
    });
};
const edit =({id,nombre,ciudad,sector,responsable})=>{
   
    console.log(id,'me has jodido el dia')
    return new Promise((resolve,reject)=>{
        connection.query(`UPDATE empresa SET nombre = ?,ciudad=?,sector=?,responsable=? WHERE id=?`,[nombre,ciudad,sector,responsable,id],(err,result)=>{
            if(err) resolve(err)
            if(result){
                resolve(result)
            };
        });

    });
};
const getEmpresas=()=>
{
    return new Promise((resolve,reject)=>{
        connection.query('SELECT id,nombre,ciudad,sector,responsable FROM Empresa',(err,rows)=>{
            if (err) reject(err)
            resolve(rows)
        });

    });
};


module.exports={
    borrar:borrar,
    edit:edit,
    insert:insert,
    getEmpresas:getEmpresas,
}