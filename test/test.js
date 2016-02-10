var mongoose = require("mongoose");
var User = require('../models/user');
var Offer = require('../models/offer');
var Message = require('../models/messageSchema');
var should = require('should');
var superagent = require('superagent');
var expect = require('expect');
var boot = require('../server').boot;
var shutdown = require('../server').shutdown;
var port = require('../server').port;
var server = require('../server.js');
var app = require('../app.js');
var test = require('selenium-webdriver/testing');
var assert = require("assert");

//helper function for testing ever GET request
function testGet(name) {
    describe('get' + name, function(){
        it('should respond to GET',function(done){
            superagent
                .get('http://localhost:' + port + name)
                .end(function(err, res){
                    expect(res.status).toEqual(200);
             if (err) {
               done(err);
          }
                    done();
                })
        })
    });
};


describe("server", function() {
    //start the server
    before(function() {
        boot();
    });
 
    testGet('/');
    testGet('/login');
    testGet('/signup');

   //close the server
    after(function () {
       shutdown();
    });
});


