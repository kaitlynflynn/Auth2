const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const User = require('../users/User');
const secret = 'got a secret... can you keep it?'; //PLL reference :) 

const localStrategy = new LocalStrategy(function(username, password, done) {
  User.findOne({ username })
    .then(user => {
      if (!user) {
        done(null, false);
      } else {
        user
          .isPasswordValid(password)
          .then(isValid => {
            if (isValid) {
              const { _id, username } = user;
              return done(null, { _id, username }); // ends in req.user
            } else {
              return done(null, false);
            }
          })
          .catch(err => {
            return done(err);
          });
      }
    })
    .catch(err => done(err));
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};

const jwtStrategy = new JwtStrategy(jwtOptions, function(payload, done) {
  // token decoded successfully!!
  User.findById(payload.sub)
    .then(user => {
      if (user) {
        done(null, user); // req.user
      } else {
        done(null, false);
      }
    })
    .catch(err => {
      done(err);
    });
});

// PASSPORT GLOBAL MIDDLEWARE
passport.use(localStrategy);
passport.use(jwtStrategy);

// PASSPORT LOCAL MIDDLEWARE
const passportOptions = { session: false };
const authenticate = passport.authenticate('local', passportOptions);
const protected = passport.authenticate('jwt', passportOptions);

// HELPERS
function makeToken(user) {
  const timestamp = new Date().getTime();
  const payload = {
    sub: user._id,
    iat: timestamp,
    username: user.username,
  };
  const options = {
    expiresIn: '12h',
  };

  return jwt.sign(payload, secret, options);
}

// ROUTES
module.exports = function(server) {
  //http://localhost:5000/ Postman Test ok!  
  server.get('/', function(req, res) {
    res.send({ api: 'up and running' });
  });
  //http://localhost:5000/register Postman Test ok!
  server.post('/register', function(req, res) {
    User.create(req.body) // new User + user.save
      .then(user => {
        const token = makeToken(user);
        res.status(201).json({ user, token });
      })
      .catch(err => res.status(500).json(err));
  });
  //http://localhost:5000/login Postman Test ok! 
  server.post('/login', authenticate, (req, res) => {
    // user logged in correctly
    res.status(200).json({ token: makeToken(req.user), user: req.user });
  });
  //http://localhost:5000/users Postman Test ok! 
  // take user token and under authorize in postman, select 'Bearer Token' from dropdown and paste token code and hit send
  server.get('/users', protected, (req, res) => {
    User.find()
      .select('username')
      .then(users => {
        res.json(users);
      })
      .catch(err => {
        res.status(500).json(err);
      });
  });
};