const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/') 
.get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .populate('user').populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite != null) { 
            req.body.forEach(dish => {
                if (favorite.dishes.indexOf(dish._id) === -1) {
                    favorite.dishes.push(dish._id);
                }
            })
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, err => next(err));
        } else { 
            Favorites.create({ "user": req.user._id, "dishes": req.body })
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch(err => next(err));
}) 
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ "user": req.user._id })
    .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, (err) => next(err))
    .catch((err) => next(err));   
});

favoriteRouter.route('/:dishId')
.get(authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.dishId}`);
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {            
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
            }
        }
        else {
            Favorites.create({"user": req.user._id, "dishes": req.body })
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {            
            index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                err = new Error(`Dish ${req.params.dishId} not found`);
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;