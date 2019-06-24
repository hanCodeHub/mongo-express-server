const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');
const Users = require('../models/user');
const Favorites = require('../models/dishes');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

// ROUTE FOR /favorites
favoriteRouter.route('/') 
.get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .populate('user').populate('dishes.dish')
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
        if (favorite != null) { // if favorite exists
            req.body.forEach(dish => {
                favorite.dishes.id(dish._id)
                .populate('dishes.dish')
                .then(dish => {
                    if (dish == null) {
                        favorite.dishes.push(dish._id);
                }}, err => next(err))
            })
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, err => next(err));
        } else { // if favorite does not exist
            req.body.user = req.user._id;
            console.log('This is the req body:', req.body)
            // Favorites.create(req.body)
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
    res.end(`PUT operation not supported on /favorites`)
}) 
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({})
    .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, (err) => next(err))
    .catch(err => next(err));
});

module.exports = favoriteRouter;