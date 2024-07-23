// authRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dbConfig = require('../dbConfig'); 
const Users=require('../models/users');
const empresas=require('../models/empresas')
const bcrypt=require('bcrypt');
const jwt=require('jwt-simple');
const moment=require('moment');
const middleware = require('./middleware');
const users = require('../models/users');
const connection = mysql.createConnection(dbConfig);
const ticket = require('../models/ticket')
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});
router.get('/roles', (req, res) => {
  const query = `SELECT id, rolename FROM roles`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    res.json(results);
  });
});
router.get('/nombre-empresa',middleware.checkToken,(req, res) => {
  
  const empresa=req.empresa;
  if(empresa === -1){
    const query = `SELECT id, nombre FROM empresa`;
  
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
  
      res.json(results);
    });
  }
  else{
  const query = `SELECT id, nombre FROM empresa
  WHERE id=?`;

  connection.query(query,empresa, (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    res.json(results);
  });
}
});
const createToken=(user)=>{
  console.log(user.empresa,'s')
  let payload={
      userEmpresa:user.empresa,
      userId:user.id,
      userRole: user.userrole,
      createdAt:moment().unix(),
      expiresAt:moment().add(60,'minutes').unix()
  }
  return jwt.encode(payload,process.env.TOKEN_KEY)};





router.post('/login',async(req,res)=>{
  console.log('prueba',req.body.username)
const user = await Users.getByUsername(req.body.username)
if(user===undefined){
  res.status(403).json({
    error:'Username or password is incorrect'
  })
}else{
  const equals = bcrypt.compareSync(req.body.password,user.password);
  if(!equals){
    res.status(401).json ({
      error: 'Username or password is incorrect'
    });
} else {
  const token = createToken(user);
  users.saveTokenInDB(token, user.id, moment().format('YYYY-MM-DD HH:mm:ss'));
  res.json({
      token: token,
      done: 'Login correcto'
  });
}
}
});


router.get('/get-user',middleware.checkToken, (req, res) => {
  const empresa=req.empresa;
  if(empresa != -1){
  const query = `SELECT users.id,users.username,users.email,users.password,empresa.nombre, roles.rolename AS roleName
  FROM users
  INNER JOIN roles ON users.userrole = roles.id
  LEFT JOIN empresa ON users.empresa = empresa.id
  WHERE empresa = ?;`;

  connection.query(query,[empresa], (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    res.json(results);
  });
}
else{
  const query = `SELECT users.id,users.username,users.email,users.password,empresa.nombre, roles.rolename AS roleName
  FROM users
  INNER JOIN roles ON users.userrole = roles.id
  LEFT JOIN empresa ON users.empresa = empresa.id`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    res.json(results);
  });

}
});
router.post('/register',middleware.checkToken,async(req,res)=>{
console.log(req.userRole,'mondongo');
empresa=req.empresa;
empresa1=req.body.empresa;
console.log('ESTA EMPRESA ES:',empresa,req.body.empresa)
if(empresa1 === -1){
  if (req.userRole !== 1) {
    return res.status(405).json({ error: 'Unauthorized: Only admin users can access this endpoint' });
  }
  else{
    try {  
    const userId = req.userId;
  req.body.password=bcrypt.hashSync( req.body.password,10);
  const result=await Users.insert(req.body);
  users.updateLastChange(userId);
  res.json(result);
    }catch (error) {
      console.error('Error al insertar usuario:', error.message);
      res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
  }
  }
}
else{
  if(empresa1 != empresa){
    console.error('no coinciden las empresas');
    return res.status(405).json({ error: 'Unauthorized: Only users from same empresa can add users' });
  }
  else{
    console.error('SI coinciden las empresas');
    if (req.userRole !== 1) {
      console.error('no es admin ');
      return res.status(405).json({ error: 'Unauthorized: Only admin users from empresa can access this endpoint' });
    }
    else{
      try {  
      const userId = req.userId;
    req.body.password=bcrypt.hashSync( req.body.password,10);
    const result=await Users.insert(req.body);
    users.updateLastChange(userId);
    res.json(result);
      }catch (error) {
        console.error('Error al insertar usuario:', error.message);
        res.status(error.status || 500).json({ message: error.message || 'Error interno del servidor' });
    }
    }
  }
}

});

router.post('/post-ticket',middleware.checkToken,(req,res)=>{
  
  const userId=req.userId;
  console.log(userId,'jejegod')
  const result = ticket.insert({
    title: req.body.title,
    description: req.body.description,
    userId: userId
});

});

router.post('/add-empresas',middleware.checkToken,async(req,res)=>{
  console.log(req.userRole,'mondongo');
  if (req.userRole !== 1) {
    return res.status(405).json({ error: 'Unauthorized: Only admin users can access this endpoint' });
  }
  else{
    
    if(req.empresa !== -1){
      return res.status(405).json({ error: 'Unauthorized: ONLY GENERAL ADMINS CAN ACCESS' });
    }
    else{
      const result=await empresas.insert(req.body);
    }
  }
  });
  router.put('/edit-usuario',middleware.checkToken,async(req,res)=>{
    console.log(req.userRole,'si,te hemos llamado');
    if (req.userRole !== 1) {
      return res.status(405).json({ error: 'Unauthorized: Only admin users can access this endpoint' });
    }
    else {
      const userId = req.userId;
      if(req.body[0].id===null){return res.status(123).json({error:'No han habido cambios'});}

      else{
      
      console.log('gilipollas',req.body[0]);
      

    const result=await users.edit(req.body[0]);
    users.updateLastChange(userId);
    res.json(result);
    }
   
    
  }
    });
router.put('/edit-empresas',middleware.checkToken,async(req,res)=>{
    console.log(req.userRole,'si,te hemos llamado');
    if (req.userRole !== 1) {
      return res.status(405).json({ error: 'Unauthorized: Only admin users can access this endpoint' });
    }
    else{
    
      if(req.empresa !== -1){
        return res.status(405).json({ error: 'Unauthorized: ONLY GENERAL ADMINS CAN ACCESS' });
      }
      else {
        if(req.body[0].id===null){return res.status(123).json({error:'No han habido cambios'});}
  
        else{
          const userId = req.userId;
        console.log('gilipollas',req.body[0])
  
      const result=await empresas.edit(req.body[0]);
      users.updateLastChange(userId);
      res.json(result);
      }
     
      
    }
    }
   
    });
    
router.delete('/delete-empresas/:id',middleware.checkToken,async(req,res)=>{
  
  const id = req.params.id;
  if(id){
  console.log(req.userRole,'mondongo');
  if (req.userRole !== 1) {
    return res.status(405).json({ error: 'Unauthorized: Only admin users can access this endpoint' });
  }
   else{
    
      if(req.empresa !== -1){
        return res.status(405).json({ error: 'Unauthorized: ONLY GENERAL ADMINS CAN ACCESS' });
      }
      else{ 
        const userId = req.userId;
        console.log(id,'aqui y ahoras')
        const result=await empresas.borrar(id);
        users.updateLastChange(userId);
        res.json(result);
        }
    }
 
  }
  else{return res.status(123).json({error:'No han habido cambios'});

  }
  });

  router.get('/getTickets',middleware.checkToken,(req, res) => {
    console.log('appel recu')
    const empresa=req.empresa;
    if(empresa === -1){
      const query = `SELECT * FROM ticket`;
    
      connection.query(query, (error, results) => {
        if (error) {
          console.error('Error al consultar la base de datos:', error);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }
    
        res.json(results);
      });
    }
    else{
    const query = `SELECT u.username,e.nombre,ticket.id, title, description,user,state,creationtime FROM ticket
    LEFT JOIN users u ON ticket.user=u.id
    LEFT JOIN empresa e ON u.empresa=e.id
    where e.id=?`;
  
    connection.query(query,empresa, (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
  
      res.json(results);
    });
  }
  });
router.get('/',async (req,res)=>{
  const users=await Users.getAll();
  res.json(users);
});
router.use(middleware.checkToken);
router.get('/mainUser',(req,res)=>{
  console.log('me han llegado cosas')
  Users.getById(req.userId)
  .then(rows=>{
    res.json(rows);
  })
  .catch(err=> console.log(err))
});
router.get('/getEmpresas',(req,res)=>{
  empresas.getEmpresas().then(rows=>{
    res.json(rows); 
  })
  .catch(err=> console.log(err))
})

router.delete('/delete-user/:id',middleware.checkToken,async(req,res)=>{
  
  const id = req.params.id;
  if(id){
  console.log(req.userRole,'mondongo');
  if (req.userRole !== 1) {
    return res.status(405).json({ error: 'Unauthorized: Only admin users can access this endpoint' });
  }
  else{ 
    const userId = req.userId;
  console.log(id,'aqui y ahoras')
  const result=await users.borrar(id);
  users.updateLastChange(userId);
  res.json(result);
  }
  }
  else{return res.status(123).json({error:'No han habido cambios'});

  }
  });


module.exports = router;