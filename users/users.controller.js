const express = require("express");
const router = express.Router();
const userService = require("./user.service");

// routes
router.post("/authenticate", authenticate);

router.get("/", getAll);
router.post("/registration", auth);

module.exports = router;

function authenticate(req, res, next) {
  userService
    .authenticate(req, res)
    .then((user) => res.json(user))
    .catch(next);
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

function auth(req, res, next) {
  //   console.log(req);
  userService
    .auth(req, res)
    .then((user) => res.json(user))
    .catch(next);
}
