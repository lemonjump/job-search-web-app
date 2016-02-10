// app/models/projectSchema.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model

// role 0 - freelancer
// role 1 - employer
// role 2 - admin
var userSchema = mongoose.Schema({

        user         : {
        email        : String,
        password     : String,
        name         : String,
        description  : String,
        role         : Number,
        last_ip      : String,
        agent        : String,
        browser      : String,
        os           : String,
        engine       : String,
        resolution   : String,
        device       : String,
        id           : String,
        token        : String,
        education    : String,
        language     : String,
        site         : String,
        viewsCount   : Number,
        jobsDone     : Number,
        location     : String,
        rating       : Number,
        goodReviews  : Number,
		badReviews   : Number,
        resume       : String,
		comments: [{commentID: String,
                    reviewerEmail: String,
                    reviewerName: String,
                    timeStamp: Date,
                    reviewRating: Number,
                    comment: String}]
    }
});


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);