const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = 3000;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");
const postModel = require("./models/post");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoogedIn, async(req, res) => {
let user = await userModel.findOne({email :req.user.email}).populate("posts")
  res.render("profile", {user});
});
app.post("/post", isLoogedIn, async(req, res) => {
  let user = await userModel.findOne({email :req.user.email})
   let { content } = req.body

let post = await postModel.create({
  user : user._id,
  content
})
user.posts.push(post._id)
await user.save()
res.redirect("/profile")
  });

app.get("/logout", (req, res) => {
  res.cookie("token", "");
 res.redirect("/login")
});
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({email});
  if (!user) return res.status(500).json("something went wrong");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "talha");
      res.cookie("token", token);
      res.status(500).redirect("/profile")
    } 
    else res.redirect("/login");
  });
});

app.post("/register", async (req, res) => {
  let { username, name, email, age, password } = req.body;

  let user = await userModel.findOne({email});
  if (user) return res.send(500).json("email already exits");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        email,
        age,
        password: hash,
      });

      let token = jwt.sign({ email: email, userid: user._id }, "talha");
      res.cookie("token", token);
      res.send("register user");
    });
  });
});




function isLoogedIn(req, res, next){
if(req.cookies.token == "") res.redirect("/login")
  else{
let data = jwt.verify(req.cookies.token , "talha");
req.user = data;
next()
  }

}

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
