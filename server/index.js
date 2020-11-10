require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const massive = require('massive');

const app = express();

app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

massive({
  connectionString: CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
}).then(db => {
  app.set('db', db);
});

//async goes in front of the function
app.post('/auth/signup', async (req, res, next) =>{
  const db = req.app.get('db');
  const {email, password} = req.body;
  const [foundUser] = await db.check_user_exists(email);
  //if you wrap in array brackets it's the same thing as foundUser[0]
  //cant use await unless you have async
  if(foundUser){ //if foundUser exists
    res.status(403).send("Email already exists") //this will stop if the email already exists
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  //[createdUser] is equivalent to createdUser[0]
  const [createdUser] = await db.create_user([email, hashedPassword])
  req.session.user = {
    id: createdUser.id,
    email: createdUser.email
  } 
  res.status(200).send(req.session.user)//this sends to the frontend
})


app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`);
});
