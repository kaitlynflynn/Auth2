# Auth JWT Mini Notes

Modules:
* server side auth using JWTs with passport and jsonwebtoken npm modules.
* client side auth with JWT/local storage.
* JWTs https://jwt.io/
* An open standard.
* No need for session store or cookies.

Token is sent every time, because now we're stateless (no session storage on the server) like HTTP.

The token will be stored on the client, possibly inside local storage (key-value store for the browser).


# Overview of the Process:
* user signs up.
* server hashes user password and store the user in the database.
* server creates JWT token (encrypted and signed using secret).
* send JWT token back to the client as part of the response.
* client stores the token.
* client sends token on every request.
* server verifies token and denies or provide access to resource.

Many different ways of doing this with Express and MongoDB.

We'll use Mongoose models. We could use schema.methods. We could use schema.statics. We could use middleware (tied to lifecycle events).

We'll use middleware to hash the passwords. We'll hash them on schema.pre('save', function(next) { //here }.

Passport is the go to library for auth in Node.js.


# Authentication
* client sends credentials
* server verify credentials
* server sends back token
* client stores the token
* client sends token on every request
* server verifies that token is valid
* server provides access to resource


# Cookies
* automatically included on every request
* unique to each domain + device pair
* cannot be sent to a different domain
* sent in the cookey header
* has a body that can have extra identifying information
* max size around 4KB


# Tokens
* have to be wire them up manually on both server and client
* sent inside the Authentication header
* can be sent to any domain. Important when your client and server are deployed to different servers/domains.
* larger site limit than cookies (research the size)


# JWTs
* on successful register or login, take user id + server secret to generate jwt.
* on request for protected resource, take jwt + server secret to decode token and optain user id.
* the tree methods we'll use are: sign, verify and decode.

When signing the token, sub refers to the subject (who is this token about) and iat means issued at time and will be included by default.


# Passport
Authentication middleware. More of an ecosystem of strategies.

* install passport and strategies(passport-local, passport-jwt, etc).
* configure and use a strategy (a kind of plugin)
    * in the case of passport-jwt we need to tell the strategy where to find the payload and the secret
* use passport to generate express middleware for the protected routes
    * const protected = passport.authenticate('jwt', { session: false });
* payload comes from the token payload
* Add the protected middleware to any endpoints that need it.

for users: `server.get('/api/users', protected, function(homies...) {}`

To test it:

* sign up.
* copy the returned toke (without the quotes)
* add the token to the Authorization header. Note that removing the Bearer part will make it fail. Seems like postman normalizes the casing, so Bearer or bearer + space + token both work.
* hitting the users route should now need the token.


# Login
* add a local strategy to let the user authenticate using username and password.
* install passport-local strategy module/po
* inside the the local strategy config function use the method to verify password against database (not written yet)
* add the method to the .methods object on the user model.
* tell passport to use that strategy for login: `passport.use(localStrategy)`.
* define another middleware for the local strategy: `const authenticate = passport.authenticate('local', { session: false });`
* add it to the login route `server.post('/api/login', authenticate, (req, res) => {});`. Here we just need to provide the token, because by the time they hit this route, they already authenticated.
* test it on postman and the token should be returned

Three scenarios:

* register
* login
* access protected resource

The players:

* Register uses `jsonwebtoken` module.
* Login uses the local strategy (passport-local) to verify username and password on login, add the user to the `req` object and provide a token on success.
* access a protected resource: The `jwt` strategy is used to extract token from header and decode it and use the payload to get the user information from the database and add it to `req.user`.
* For jwt signing and decoding the tokens we use `jsonwebtoken`.


# Client Auth

For routes:

* /
* /signup
* /signin
* /users

Configure router

* add react-router-dom
* add routes

Build the forms.