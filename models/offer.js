// app/models/jobOffer.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var offerSchema = mongoose.Schema({

        offer :{
            id :String,
            title: String,
            description: String,
            postedBy: String,
            viewCount: Number,
            acceptedBy: String,
            location: String,
            budget: Number,
            status : String,
            done : Number,
            postedAt:Date
        }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Offer', offerSchema);