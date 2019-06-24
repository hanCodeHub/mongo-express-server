const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favDishSchema = new Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
})

var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [favDishSchema]
}, {
        timestamps: true,
        usePushEach: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema); 

module.exports = Favorites;