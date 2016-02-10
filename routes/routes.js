// app/routes.js
    var u = require('url');
var bodyParser   = require('body-parser');
// load up the user model
var UserSchema          = require('../models/user');
var OfferSchema         = require('../models/offer');
var Message = require('../models/messageSchema');
var messageService = require('../services/messageService.js');

var uuid = require("uuid-v4");

module.exports = function(app,router, passport) {
app.use(bodyParser()); 
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {

        res.render('index', { title: 'Assignment 5', appname: 'Freelance network!'});
    });
    
    app.get('/admin', function(req, res) {

        res.render('admin', { title: 'Assignment 5', appname: 'Freelance network!'});
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup', { message: req.flash('signupMessage')});
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/users', isLoggedIn, function(req, res) {

        UserSchema.find(function(err, users) {
            if (err)
                done(err);
            res.render('users', {title:"Users",logged_user:req.user,userlist:users});
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
        // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    router.route('/users/:users_id')
    .get(isLoggedIn,function(req, res) {

        UserSchema.findOne({ 'user.email': req.params.users_id}, function(err, userf) {
            if (err)
                res.send(err);
            //res.json(user);
            if (userf){
              res.render('user',{title:userf.user.email,user:userf,logged_user:req.user});
            }else{
              var type = req.accepts([ "html", "json" ]);
              if ( type === "json" ) {
                res.status(404).end( );
              } else {
                res.redirect('/users');
              }
            }
        });
    });

    app.get('/edit', isLoggedIn, function(req, res) {
         UserSchema.findOne({ 'user.email': req.user}, function(err, userf) {

            if (userf){
                if (!userf.editviewed) userf.editviewed =0;

            userf.editviewed = userf.editviewed+1;
            userf.save(function(err){
                if (err)
                    console.log(err);
                
                });
        }
        });
            
        res.render('edit', {logged_user:req.user,user:req.user,message: req.flash('editMessage')});
    });

    app.post('/edit', isLoggedIn, function(req, res) {
        res.render('edit', {logged_user:req.user,message:req.flash('editMessage')});
    });

    // Post a new comment & rating to a specified freelancer from the logged in user
    app.post('/rate', function(req,res){
		console.log(req.body);
		UserSchema.findOne({ 'user.email': req.body.freelancer}, function(err, userf) {
			if (err)
				res.send(err);
			if (userf){
				var rating = Number(req.body.rating_value) + 0;
				
				if(rating < 50){userf.user.badReviews += 1;}else{userf.user.goodReviews += 1;}
				var bad = userf.user.badReviews;
				var good = userf.user.goodReviews;
				userf.user.rating = Number((good - bad)/(good + bad) * 100);
				
				userf.user.comments.push({commentID: uuid(), reviewerEmail: req.body.reviewer, reviewerName: req.body.reviewerName,
				timeStamp: Date.now(), reviewRating: rating, comment: req.body.review});
				
				userf.save(function(err) {
					if (err)
						console.log(err);
				});

				res.redirect(req.get('referer'));
			}else{
				res.redirect('users');
			}
		});
	});

    router.route('/users/:users_id')
    .post(isLoggedIn,function(req, res) {
        UserSchema.findOne({ 'user.email': req.params.users_id}, function(err, userf) {
            if (err)
                res.send(err);
            if (userf){

                if (req.body.description)
                    userf.user.description = req.body.description;
                if (req.body.name)
                    userf.user.name = req.body.name;
                if (req.body.role)
                    userf.user.role = req.body.role;

                 if (req.body.education)
                    userf.user.education = req.body.education;
                if (req.body.site)
                    userf.user.site = req.body.site;
                if (req.body.language)
                    userf.user.language = req.body.language;
                if (req.body.resume)
                    userf.user.resume = req.body.resume;

                 if (req.body.location)
                    userf.user.location = req.body.location;
                if (req.body.oldpass && req.body.newpass){

                    if (!userf.validPassword(req.body.oldpass)){
                        req.flash('editMessage', 'Incorrect password');
                    }else{
                        userf.user.password = userf.generateHash(req.body.newpass);
                    }
                }
                    


                userf.save(function(err) {
                if (err)
                    console.log(err);
                });

                if (req.body.delete)
                    userf.remove(function (err) {
                    // if no error, your model is removed
                        if(err)
                            console.log(err);
                });


                //userf.remove(function (err) {
                    // if no error, your model is removed
                // });
              res.redirect(req.get('referer'));
            }else{
              //
              res.redirect('users');
            }
            
        });
    });


    router.route('/all')
      .get(function(req, res) {
        UserSchema.find(function(err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
    });

       router.route('/alloffers')
      .get(function(req, res) {
        OfferSchema.find(function(err, offers) {
            if (err)
                res.send(err);
            res.json(offers);
        });
    });

     router.route('/edit/:users_id')
    .get(isLoggedIn,function(req, res) {
        UserSchema.findOne({ 'user.email': req.params.users_id}, function(err, userf) {
            if (err)
                res.send(err);
            //res.json(user);
            if (userf){
                if (req.user.user.email != userf.user.email && req.user.user.role != 2){
                    res.redirect('/freelancers'); }
                else if (req.user.user.role == 2 && userf.user.role == 2) {
                  res.redirect('/users'); }
                else {
                  res.render('edit',{title:userf.email,user:userf,logged_user:req.user,message: req.flash('editMessage')});
                }
            }else{
              //
              res.redirect('/users');
            }
        });
    });




// =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/home',
            failureRedirect : '/'
        }));

    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.get('/offers', isLoggedIn, function(req, res) {
        
        var q = u.parse(req.url,true).query;
        if (q.search || q.status || q.location){

           if (!q.status){
            q.status = ["Pending","Approved","Done"];
           }

            if (!q.status[0])
                q.status[0] = q.status;
            if (!q.status[1])
                q.status[1] = q.status[0];
            if (!q.status[2])
                q.status[2] = q.status[1];


            if (q.search && q.location){
                console.log("search and location");
                OfferSchema.find(
                    { $and:[
                        {'offer.title':
                        {$regex : new RegExp(q.search, "i") }
                        },
                        {
                            $or :[
                                {'offer.status':q.status},
                                {'offer.status':q.status[0]},
                                {'offer.status':q.status[1]},
                                {'offer.status':q.status[2]}
                            ]
                        },
                        {'offer.location': q.location}
                    ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });
            }else if (q.search){
                 console.log("search");
                OfferSchema.find(
                    { $and:[
                        {'offer.title':
                        {$regex : new RegExp(q.search, "i") }
                        },
                        {
                            $or :[
                                {'offer.status':q.status},
                                {'offer.status':q.status[0]},
                                {'offer.status':q.status[1]},
                                {'offer.status':q.status[2]}
                            ]
                        }
                    ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });

            }else if (q.location){
                 console.log("location");
                OfferSchema.find(
                    { $and:[
                        {
                            $or :[
                                {'offer.status':q.status},
                                {'offer.status':q.status[0]},
                                {'offer.status':q.status[1]},
                                {'offer.status':q.status[2]}
                            ]
                        },
                        {'offer.location': q.location}
                    ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });
            }else{
                console.log("status is "+q.status);
                OfferSchema.find(
                    {$or :[
                            {'offer.status':q.status},
                            {'offer.status':q.status[0]},
                            {'offer.status':q.status[1]},
                            {'offer.status':q.status[2]}
                            ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });
            }

        }else{
            OfferSchema.find(function(err, offers) {
            if (err)
                done(err);

            OfferSchema.find(
                {$and:[
                    {'offer.status':"Pending"},
                    {$or:[
                            {'offer.budget':{$gte : 10}},
                            {'offer.location':req.user.location},
                            {'offer.viewCount':{$gte : 5}  }
                        ]}
                    ]    
                }
                ).sort('-offer.budget').limit(1).exec(function(err, suggestedOffer) {
                    console.log(suggestedOffer);
                     if (err)
                            done(err);
                    res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,suggestion:suggestedOffer[0]});

                });    
        });

        }
        
    });

     app.get('/newoffer', isLoggedIn, function(req, res) {

       if (req.user.user.role != 0) {
         OfferSchema.find(function(err, offers) {
             if (err)
                 done(err);
             res.render('newoffer', {logged_user:req.user,message:req.flash('offerMessage')});
         });
       }
       else {
         res.redirect('/offers');
       }
    });




router.route('/newoffer')
    .post(isLoggedIn,function(req, res) {
       console.log("post offer "+req.body.offerTitle);
         OfferSchema.findOne({ 'offer.title': req.body.offerTitle}, function(err, offerf) {
            if (err)
                res.send(err);
            if (offerf){
                console.log("offer exists "+offerf.offer.title);
                req.flash('offerMessage', 'Offer with such name already exists');
                res.redirect('/newoffer');
            }else{
              //
              console.log("creating new offer");
                var newOffer = new OfferSchema();
                newOffer.offer.title = req.body.offerTitle;
                newOffer.offer.description = req.body.offerDesc;
                newOffer.offer.postedBy  = req.user.user.email;
                newOffer.offer.viewCount = 0;
                newOffer.offer.status = "Pending";
                newOffer.offer.postedAt = Date.now();
                newOffer.offer.location = req.body.location;
                newOffer.offer.budget = req.body.budget;
                //console.log(req.body);
                newOffer.save(function(err) {
                        if (err)
                            console.log(err);
                        res.redirect('/offers');
                });
            }
        });
    });

 router.route('/offers/:offer_name')
    .get(isLoggedIn,function(req, res) {

        OfferSchema.findOne({ 'offer.title': req.params.offer_name}, function(err, offerf) {
            if (err)
                res.send(err);


            if (offerf){
                offerf.offer.viewCount = offerf.offer.viewCount+1;
                offerf.save(function(err) {
                    if (err)
                        throw err;
                    res.render('offer',{title:offerf.offer.title,offer:offerf,logged_user:req.user});
                });       
               
            }else{
              //
              res.redirect('/offers');
            }
        });
    });

    router.route('/offers/:offer_name')
    .post(isLoggedIn,function(req, res) {

        OfferSchema.findOne({ 'offer.title': req.params.offer_name}, function(err, offerf) {
            if (err)
                res.send(err);


            if (offerf){


                if (req.body.accepted)
                {
                    offerf.offer.acceptedBy = req.body.accepted;
                    offerf.offer.status = "Accepted";

                    offerf.save(function(err) {
                    if (err)
                        throw err;
                    }); 
                }   
                if (req.body.done)
                {
                    offerf.offer.acceptedBy = req.body.done;
                    offerf.offer.status = "Done";

                    UserSchema.findOne({ 'user.email': req.body.done}, function(err, userf) {
                        if (err)
                            res.send(err);
                        if (userf){
                            if (!userf.user.jobsDone)
                                userf.user.jobsDone = 0;

                            userf.user.jobsDone = userf.user.jobsDone+1;

                            userf.save(function(err) {
                                if (err)
                                    throw err;
                            }); 
                        }

                       }); 


                    offerf.save(function(err) {
                    if (err)
                        throw err;
                    }); 
                }   
                console.log(req.body);
                if (req.body.approve && req.body.approveStatus){
                    if (req.body.approveStatus == -1){
                        console.log("rejected");
                        offerf.offer.status = "Pending";
                        offerf.offer.acceptedBy = "";
                        offerf.save(function(err) {
                    if (err)
                        throw err;
                    }); 
                    }else if (req.body.approveStatus == 1){
                        console.log("approved");
                        offerf.offer.status = "Approved";
                        offerf.save(function(err) {
                    if (err)
                        throw err;
                    }); 
                    }
                    
                }

               res.redirect(req.get('referer'));
            }else{
              //
              res.redirect('/offers');
            }
        });
    });

    router.route('/editoffer/:offer_id')
    .get(isLoggedIn,function(req, res) {

        OfferSchema.findOne({ 'offer.title': req.params.offer_id}, function(err, offerf) {
            if (err)
                res.send(err);
            //res.json(user);
            console.log(req.params.offer_id);
            console.log(req.params);

            if (offerf && (offerf.offer.postedBy == req.user.user.email || req.user.user.role == 2)){
              res.render('editoffer',{title:offerf.offer.title,offer:offerf,logged_user:req.user,message: req.flash('editMessage')});
            }else{
              //
              res.redirect('/offers');
            }
        });
    });


        router.route('/editoffer/:offer_id')
        .post(isLoggedIn,function(req, res) {

        OfferSchema.findOne({ 'offer.title': req.params.offer_id}, function(err, offerf) {
            if (err)
                res.send(err);
            //res.json(user);
 
            if (offerf && (offerf.offer.postedBy == req.user.user.email)){

                if (req.body.description)
                    offerf.offer.description = req.body.description; 
                if (req.body.location)
                     offerf.offer.location = req.body.location;
                if (req.body.budget)
                    offerf.offer.budget = req.body.budget;  


                offerf.save(function(err) {
                if (err)
                    console.log(err);
                });




                if (req.body.delete)
                    offerf.remove(function (err) {
                    // if no error, your model is removed
                        if(err)
                            console.log(err);
                });
              res.redirect(req.get('referer'));
              //res.render('editoffer',{title:offerf.offer.title,offer:offerf,logged_user:req.user,message: req.flash('editMessage')});
            }else{
              //
              res.redirect('/offers');
            }
        });
    });



       app.get('/freelancers', isLoggedIn, function(req, res) {
        var q = u.parse(req.url,true).query;

        if (q.search || q.rating || q.jobsdone){

            var jdone = 0;
            var rating =0;
            if (q.jobsdone)
                jdone = q.jobsdone;
            if (q.rating)
                rating = q.rating;





             UserSchema.find(
                { $and :
                    [
                        {'user.role':0},
                        {'user.email':{$regex : new RegExp(q.search, "i")}},
                        {'user.jobsDone':{$gte : jdone}},
                        {'user.rating':{$gte : rating}},

                    ]
                },function(err, users) {
            if (err)
                done(err);
            res.render('freelancers', {title:"freelancers",logged_user:req.user,userlist:users,query:q});
        });

        }else{
            UserSchema.find({'user.role':0},function(err, users) {
            if (err)
                done(err);
            res.render('freelancers', {title:"freelancers",logged_user:req.user,userlist:users});
        });

        }
    });

    router.route('/freelancers/:freelancer_name').get(isLoggedIn,function(req, res) {

        UserSchema.findOne({ 'user.email': req.params.freelancer_name}, function(err, userf) {
            if (err)
                res.send(err);
            if (userf){
                if  (!userf.user.viewsCount)
                    userf.user.viewsCount = 0;
                userf.user.viewsCount = userf.user.viewsCount+1;
                userf.save(function(err) {
                    if (err)
                        throw err;
                    res.render('freelancer',{title:userf.user.name,user:userf,logged_user:req.user});
                });   
               
            }else{
              res.redirect('/freelancers');
            }
        });
    });   
    
    router.route('/rate/:freelancer_name').get(isLoggedIn,function(req, res) {
        UserSchema.findOne({ 'user.email': req.params.freelancer_name}, function(err, userf) {
            if (err)
                res.send(err);
            if (userf){
				//iterate through each comment and upate user name ------------------------------------------------
				var countGood = 0;
				var countBad = 0;
				var c = 0;
				var len = userf.user.comments.length;
				while(c < len){
					var comment = userf.user.comments[c];
					var e = comment.reviewerEmail;

					var name = UserSchema.findOne({ 'user.email': e}).exec(function(err, userf2) {
						
						//console.log(userf2.user.name);
					});

					//userf.user.comments[c].reviewerName = "";
					// find the reviewRating of the user and numbers of good and bad comment&ratings he/she received
					if(comment.reviewRating < 50){countBad++;}else{countGood++;}
					c = c + 1;
				}
				userf.user.reviewRating = Number((countGood - countBad)/(countGood + countBad) * 100);
				userf.user.goodReviews = countGood;
				userf.user.badReviews = countBad;
				userf.save(function(err) {
                    if (err)
                        throw err;
				});
				
                res.render('rateFreelancer',{user:userf.user,logged_user:req.user});
            }else{
              res.redirect('/freelancers');
            }
        });
    });  

    /* * * * * * * * * * * * * * * * * * *
     *         HOME PAGES ROUTING        *
     * * * * * * * * * * * * * * * * * * */

    // Freelancers or Employers
    app.get('/home', isLoggedIn, function(req, res) {
        UserSchema.find(function(err, users) {
            if (err)
                console.log(err);

            if (req.user.user.role == 2) {
              res.redirect('/adminHome'); }
            else {
              res.render('home', {title:"Home", logged_user:req.user}); }
        });
    });

    // Admin
    app.get('/adminHome', isLoggedIn, function(req, res) {
        UserSchema.find(function(err, users) {
            if (err)
                console.log(err);

            if (req.user.user.role == 2) {
              res.render('adminHome', {title:"Admin",logged_user:req.user}); }
            else {
              res.redirect('/home'); }
        });
    });
    
    
    /* * * * * * * * * * * * * * * * * * *
     *      MESSAGING SYSTEM ROUTING     *
     * * * * * * * * * * * * * * * * * * */
    
    // GET Inbox View
    app.get('/inbox', isLoggedIn, function(req, res) {
      var user = req.user;
      console.log(user);

      messageService.getMessagesByEmail(user.user.email)
      .then(function (messages) { res.render('inbox', {title:"Inbox",logged_user:req.user,messageList:messages}); })
      .catch(function (err) { res.status(400).end(); });
        });
        
    // GET Message Form View    
    app.get('/message', isLoggedIn, function(req, res) {
        UserSchema.findOne({ 'user.email': req.user}, function(err, userf) {
            if (err)
                console.log(err);
            });
            res.render('message', {logged_user:req.user,user:req.user,message: req.flash('editMessage')});
    });

    // POST New Message
      router.route('/messages')
      .post(isLoggedIn, function (req, res) {
        var msg = req.body;
        var user = req.user;
        var messageObj = messageService.makeMessage(user.user.email, msg);

        UserSchema.findOne({'user.email': msg.recipient}, function (err, rec) {
          if (err) console.log(err);
          else if (rec === null)
            res.write("<script>alert('That user is not in the system');</script>");
          else {
            messageService.saveMessage(messageObj)
            .then(message => res.redirect('/inbox'))
            .catch(err => res.status(500).end());
          }
        });
      });

    // GET Messge by ID
      app.get('/messages/:messageID', isLoggedIn, function(req, res) {
           var id = req.params.messageID;
           messageService.getMessageByID(id)
           .then(function (message) {
             if (message.recipient == req.user.user.email) {
               res.render('messages', {title:"Messages",logged_user:req.user,msg:message}); }
             else {
               res.redirect('/inbox'); } })
           .catch(function (err) { res.status(400).end(); });
      });   



      //list of accepted and unfinised jobs 
      app.get('/todo', isLoggedIn, function(req, res) {

        // if not a freelancer
        if (req.user.user.role != 0)
            res.redirect('offers');

        var key;
        var value;

        var q = u.parse(req.url,true).query;
         for(var i in q){
            key = i;
            value = q[i];
            break;
         }
        
        // checking if request has right structure 
        if (key == 'search'){
            console.log(value);
             OfferSchema.find({'offer.acceptedBy':req.user.user.email},{'offer.title':{$regex : new RegExp(value, "i") }},function(err, offers) {
            if (err)
                done(err);
            res.render('offers', {title:"Your unfinised work",logged_user:req.user,offerlist:offers,query:value});
        });

        }else{
            OfferSchema.find({'offer.acceptedBy':req.user.user.email},function(err, offers) {
            if (err)
                done(err);
            res.render('offers', {title:"Your unfinised work",logged_user:req.user,offerlist:offers});
        });

        }
        
    });

    app.get('/jobstatus', isLoggedIn, function(req, res) {

        // if not a freelancer
        if (req.user.user.role != 1)
            res.redirect('offers');

         var q = u.parse(req.url,true).query;
        if (q.search || q.status || q.location){

           if (!q.status){
            q.status = ["Pending","Approved","Done"];
           }

            if (!q.status[0])
                q.status[0] = q.status;
            if (!q.status[1])
                q.status[1] = q.status[0];
            if (!q.status[2])
                q.status[2] = q.status[1];


            if (q.search && q.location){
                console.log("search and location");
                OfferSchema.find(
                    { $and:[
                        {'offer.postedBy':req.user.user.email},
                        {'offer.title':
                        {$regex : new RegExp(q.search, "i") }
                        },
                        {
                            $or :[
                                {'offer.status':q.status},
                                {'offer.status':q.status[0]},
                                {'offer.status':q.status[1]},
                                {'offer.status':q.status[2]}
                            ]
                        },
                        {'offer.location': q.location}
                    ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });
            }else if (q.search){
                 console.log("search");
                OfferSchema.find(
                    { $and:[
                         {'offer.postedBy':req.user.user.email},
                        {'offer.title':
                        {$regex : new RegExp(q.search, "i") }
                        },
                        {
                            $or :[
                                {'offer.status':q.status},
                                {'offer.status':q.status[0]},
                                {'offer.status':q.status[1]},
                                {'offer.status':q.status[2]}
                            ]
                        }
                    ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });

            }else if (q.location){
                 console.log("location");
                OfferSchema.find(
                    { $and:[
                         {'offer.postedBy':req.user.user.email},
                        {
                            $or :[
                                {'offer.status':q.status},
                                {'offer.status':q.status[0]},
                                {'offer.status':q.status[1]},
                                {'offer.status':q.status[2]}
                            ]
                        },
                        {'offer.location': q.location}
                    ]
                    },function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });
            }else{
                console.log("status is "+q.status);
                OfferSchema.find(
                     { $and:[
                        {'offer.postedBy':req.user.user.email},
                        {$or :[
                            {'offer.status':q.status},
                            {'offer.status':q.status[0]},
                            {'offer.status':q.status[1]},
                            {'offer.status':q.status[2]}
                            ]
                        }
                        ]
                     }
                    ,function(err, offers) {
                        if (err)
                            done(err);
                        res.render('offers', {title:"Offers",logged_user:req.user,offerlist:offers,query:q});
                    });
            }

        }else{
            OfferSchema.find({'offer.postedBy':req.user.user.email},function(err, offers) {
            if (err)
                done(err);
            res.render('offers', {title:"Your offers",logged_user:req.user,offerlist:offers});
        });

        }
        
    });


     app.get('/newoffer', isLoggedIn, function(req, res) {

        OfferSchema.find(function(err, offers) {
            if (err)
                done(err);
            res.render('newoffer', {logged_user:req.user,message:req.flash('offerMessage')});
        });
    });

    
};

// in case if you need to drop users db
// OfferSchema.remove({}, function(err) { 
//    console.log('collection removed') 
// });


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
