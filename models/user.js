const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/miniproject");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  age: String,
  password: String,
  profilepic : {
    type : String,
    default : "default.png"
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
