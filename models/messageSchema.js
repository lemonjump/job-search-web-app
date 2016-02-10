var mongoose = require("mongoose");

// Message Schema
var messageSchema = mongoose.Schema ({
  messageID: String,
  sender: String,
  timeStamp: Date,
  recipient: String,
  subject: String,
  body: String,
  isRead: Boolean
});

module.exports = mongoose.model("Message", messageSchema);
