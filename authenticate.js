var User = require('./models/user');
const Dishes = require('./models/dishes');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(
        user, 
        config.secretKey, 
        { expiresIn: 3600 }
    )
}

var opts = {};
// define options for JwtStrategy
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// the done callback passes info back to passport
exports.jwtPassport = passport.use('jwt', new JwtStrategy(
    opts, 
    (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    }
))

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

exports.verifyFavoriter = (req, res, next) => {
    Favorites.findById(req.params.dishId)
    .populate('comments.author')
        .then((dish) => dish.comments.id(req.params.commentId))
        .then((comment) => {
            if (req.user._id.equals(comment.author._id)) {
                next();
            } else {
                var err = new Error('You are not the author of this comment!');
                err.status = 403;
                return next(err);
            }
        })
        .catch(err => next(err));
}

exports.verifyAuthor = (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
        .then((dish) => dish.comments.id(req.params.commentId))
        .then((comment) => {
            if (req.user._id.equals(comment.author._id)) {
                next();
            } else {
                var err = new Error('You are not the author of this comment!');
                err.status = 403;
                return next(err);
            }
        })
        .catch(err => next(err));
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy(
    {
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (!err && user !== null) {
                return done(null, user);
            } else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err) return done(err, false);
                    else return done(null, user);
                })
            }
        })
    }
));