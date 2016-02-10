var Message = require("../models/messageSchema.js");
var uuid = require("uuid-v4");

var messageService = {

    // Save an instance of a Message in the database
    saveMessage: function (input) {
      var message = new Message(input);
      return new Promise( function (resolve, reject) {
        message.save(resolveWith(resolve, reject));
      });
    },

    // Return the Message in the Message collection whose e-mail matches the input
    getMessagesByEmail: function (userEmail) {
      return new Promise( function (resolve, reject) {
        Message.find({ "recipient": userEmail }, resolveWith(resolve, reject))});
    },

    // Return the Message in the Message collection whose id matches the input
    getMessageByID: function (id) {
      return new Promise( function (resolve, reject) {
        Message.findOne({ "messageID": id }, resolveWith(resolve, reject))});
    },

    // Delete the Message in the Message collection whose e-mail matched the input
    deleteMessage: function (messageID) {
      return new Promise( function (resolve, reject) {
        Message.findOne(messageID).remove(resolveWith(resolve, reject))});
    },

    // Create an instance of a Message in the database
    makeMessage: function (currentUser, input) {
      return new Message({
        messageID: uuid(),
        sender: currentUser,
        recipient: input.recipient,
        timeStamp: Date.now(),
        subject: input.subject || "<No Subject>",
        body: input.body || "No content.",
        isRead: false});
    }
};

module.exports = messageService;

/* resolveWith
    succeed: Callback function
    fail: Callback function

    Returns a function that calls correct callback function dependent on
    success or failure. */
function resolveWith (succeed, fail) {
  return function resolveCallback (err, data) {
    if (err) {
      fail(err); }
    else {
      succeed(data); }
  };
}
