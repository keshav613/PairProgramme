const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Always Email will and should be unique
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thirdPartyProviderAuthID: {
    type: String,
    default: null,
  },
});

module.exports = User = mongoose.model("users", UserSchema);
