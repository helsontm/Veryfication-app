const { getAll, create, getOne, remove, update, verifyEmail, login, getLoggerUsers } = require('../controllers/users.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const userRouter = express.Router();

userRouter.route('/')
    .get(verifyJWT,getAll)
    .post(create);

 
    userRouter.route("/verify/:code")
    .get(verifyEmail)

    userRouter.route("/login")
    .post(login)

userRouter.route("/me")
    .get(getLoggerUsers)
   
userRouter.route('/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = userRouter;
