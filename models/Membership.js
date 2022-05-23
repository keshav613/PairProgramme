const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var membershipSchema = new Schema({
  provider: String,
  providerId: String,
  firstname: String,
  lastname: String,
  displayname: String,
  email: String,
  password: {
    type: String,
    default: null,
  },
  dateAdded: { type: Date, default: Date.now },
});

module.exports = Membership = mongoose.model("Membership", membershipSchema);
