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

app.post('/auth/login', async (req, res, next) =>{
  const db = req.app.get('db');
  const {email, password} = req.body;

  //before we can compare passwords, we need to check the email to see if the user actually exists
  const [foundUser] = await db.check_user_exists(email);
  if(!foundUser){ //if the user DOES NOT exist, then they cant log in
    res.status(401).send('Incorrect email/password')
  }
  //if the if statement is falsy and the email DOES EXIST, then it skips it and goes to the next thing
  let authenticated = bcrypt.compareSync(password, founderUser.user_password)
  if(authenticated){ //if this is true, then put that found information into my user session object with id and email 
    req.session.user = { //in this case, we know we need id email and user_password bc we were given a table - refer back to the select statement above db.check_user_exists(email)
      id: foundUser.id,
      email: foundUser.email
    }
    res.status(200).send(req.session.user) //send the session to the front
  }else{
    return res.status(401).send("Incorrect email/password") //if the password and foundUser.user_password do not match
  }

})

app.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
})

app.get('/auth/user', (req, res) => {
  if(req.session.user){
    res.status(200).send(req.session.user);
  }else{
    res.status(401).send('Please log in')
  }
})


app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`);
});
