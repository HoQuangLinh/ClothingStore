const express = require("express");
const cors = require("cors");
const router = express.Router();
const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const verifyToken = require("../middlewares/verifyToken");
const jwt = require("jsonwebtoken");

//Hash Pass
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

router.get("/", verifyToken, (request, response) => {
  User.find({})
    .select("-password")
    .exec(function (err, users) {
      response.send(users);
    });
});

router.post("/login", async function (req, res) {
  let user = await User.findOne({ username: req.body.username });
  if (!req.body.username) {
    return res.status(400).send("Vui lòng nhập tài khoản");
  }
  if (!req.body.password) {
    return res.status(400).send("Vui lòng nhập mật khẩu");
  }
  if (!user) {
    return res.status(400).send("Tài khoản không hợp lệ");
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res
      .status(422)
      .send(
        "Rất tiếc, mật khẩu của bạn không đúng. Vui lòng kiểm tra lại mật khẩu."
      );
  }

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: 60 * 60 * 24 * 15,
  });
  res.header("auth-token", token).send(token);
});

//Change Password
router.post("/changePass", async function (req, res) {
  let user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send("Tài khoản của bạn không tồn tại");
  if (!bcrypt.compareSync(req.body.currentPassword, user.password)) {
    return res
      .status(422)
      .send(
        "Rất tiếc, mật khẩu của bạn không đúng. Vui lòng kiểm tra lại mật khẩu."
      );
  }
  User.findOneAndUpdate(
    { username: req.body.username },
    { password: bcrypt.hashSync(req.body.newPassword, salt) },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(422).send(error);
      } else {
        return res.status(200).send(data);
      }
    }
  );
});
//Get Info
router.get("/getInfo/:id", async function (req, res) {
  if (!req.params.id) {
    return res.status(400).send("Error");
  }
  let info = await userInfo.findOne({ user: req.params.id });
  if (!info) {
    return res.status(422).send("Info not found");
  } else return res.status(200).send(info);
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  let user = User({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, salt),
    phone: req.body.phone,
    address: req.body.address,
    email: req.body.email,
    imageUrl: "",
  });

  user
    .save()
    .then((newUser) => {
      res.status(200).send(newUser);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;