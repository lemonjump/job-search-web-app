var headers = {
  "accept": "application/json",
  "content-type": "application/json"
};

function login() {
    window.location.href = "/login";
}
function signup() {
    window.location.href = "/signup";
}


$(document).ready(function() {
    $('#lscrRes').val(screen.width + "x" + screen.height);
    $('#sscrRes').val(screen.width + "x" + screen.height);
});


function deleteUser(u){
    alert(u);
    $.ajax({
    type: "DELETE",
    url: "user/",
    data: "",
    success: function(msg){
        alert("Data Deleted: " + msg);
    }
});
}

function uploadImg(){
    alert('App');
}


function validateLogin(){
    return verifyEmail()&&checkPass();
}

function trackUser(){
    $(window).height();   // returns height of browser viewport
    $(window).width();   // returns width of browser viewport
}


function verifyEmail(){
    var email = document.getElementById('inputEmail');
    if (!email.value){
        $('#validEmail').addClass('hide');
        $('#invalidEmail').removeClass('hide');
        return false;
    }else{
        $('#invalidEmail').addClass('hide');
        $('#validEmail').removeClass('hide');
        return true;
    }
}



function verifyPass(){
    var password = document.getElementById('inputPassword');

    if (password.value){
        $('#invalidPass').addClass('hide');
        $('#validPass').removeClass('hide');
        return true;
    }else{
        $('#validPass').addClass('hide');
        $('#invalidPass').removeClass('hide');
        return false;
    }
}


function checkPass()
{
    if (!verifyPass())
        return false;


    var pass1 = document.getElementById('inputPassword');
    var pass2 = document.getElementById('inputConfirmPassword');


    if(pass1.value == pass2.value){
        $('#invalidConfirm').addClass('hide');
        $('#validConfirm').removeClass('hide');
        return true;
    
    }else{
        $('#validConfirm').addClass('hide');
        $('#invalidConfirm').removeClass('hide');
        return false;
    }
}  


function nonEmptyPass(){
    var p = document.getElementById('ePassword');
    if (p.value){
        $('#invalidEPass').addClass('hide');
        $('#validEPass').removeClass('hide');
        return true;
    }else{
        $('#validEPass').addClass('hide');
        $('#invalidEPass').removeClass('hide');
        return false;
    }
}

function checkEditPass(){
    if (!nonEmptyPass())
        return false;


    var pass1 = document.getElementById('ePassword');
    var pass2 = document.getElementById('eConfirm');


    if(pass1.value == pass2.value){
        $('#invalidEConfirm').addClass('hide');
        $('#validEConfirm').removeClass('hide');
        return true;
    
    }else{
        $('#validEConfirm').addClass('hide');
        $('#invalidEConfirm').removeClass('hide');
        return false;
    }
}
function validateEPass(){
        return nonEmptyPass()&&checkEditPass();
}


/* sendMessage
     Pulls the information from the message form, checks to make sure
     recipient is valid, and then posts the message to the DB. */
function sendMessage(user) {
    var rec = $("#recipient").val().toLowerCase();
    var subject = $("#subject").val();
    var body = $("#body").val();
    var msg = {
      sender: user.email,
      recipient: rec,
      subject: subject,
      body: body
    };

    return (
      fetch('/users/' + rec, {credentials: 'same-origin', headers: headers})
      .then(handleStatus)
      .then(postMessage(msg))
      .catch(showError));
}


/* postMessage
    Posts a message object to the database. */
function postMessage(msg) {
  return function () {
    return (
      fetch("/messages", {method: "POST", credentials: 'same-origin',
        headers: headers, body: JSON.stringify(msg)})
      .then(handleStatus)
      .then(inbox));
    };
};


/* inbox
     Loads the inbox page. */
function inbox() {
  window.location.href = "/inbox";
}


/* handleStatus
    Returns a Promise rejection or resolution based on the Server response. */
function handleStatus (response) {
  if (response.status < 400) {
    return Promise.resolve(response); }
  else {
    return Promise.reject() }
}


/* showError
    Returns a Promise rejection and logs the error to the console. */
function showError (err) {
  alert("User not in system.");
  return Promise.reject(err);
}

//verify that new offer has all the required fields
function validateNewOffer(){
    var title = document.getElementById('offerTitle');
    var budget = document.getElementById('offerBudget');
    var location = document.getElementById('offerLocation');
    var desc = document.getElementById('offerDesc');    
     if (title.value && budget.value && location.value && desc.value){
        $('#invalidForm').addClass('hide');
        return true;
    }else{
        $('#invalidForm').removeClass('hide');
        return false;
    }
    
}