const { uuid } = require("uuidv4");
const HttpError = require("../Models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../Models/usersSchema");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}).select("-password");
  } catch (err) {
    const error = new HttpError("Could not find any places", 422);
    return next(error);
  }
  res
    .status(200)
    .json({ allUsers: users.map((user) => user.toObject({ getters: true })) });
};
const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed,please check your data",
      422
    );
    return next(error);
  }
  const { name, email, password } = req.body;

  let existingUser;
  let hashedPassword;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Sign up has failed", 500);
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError("Email exists already", 500);
    return next(error);
  }

  try {
    hashedPassword = await bcrypt.hash(password, 12);
    console.log("encrypeted password");
  } catch (err) {
    const error = new HttpError("could not create user please try again", 500);
    return next(error);
  }

  const createUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });
  try {
    await createUser.save();
    console.log(createUser);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Sign has  up failed", 500);
    return next(error);
  }
  let token;
  console.log("creator id  is");
  console.log(createUser.id);
  try {
    token = await jwt.sign(
      { userId: createUser.id, email: createUser.email },
      process.env.TOKEN_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Could not sign it please try again later/token "
    );
    return next(error);
  }

  res.status(201).json({
    userId: createUser.toObject({ getters: true }).id,
    email: createUser.email,
    token: token,
  });
};
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = HttpError(
      "Invalid inputs passed,please check your data",
      422
    );
    return next(error);
  }
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Invalid email is invalid or invalid password",
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "Invalid email is invalid or invalid password",
      500
    );
    return next(error);
  }
  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, user.password);

    console.log("isValid or not");
    console.log(isValid);
  } catch (err) {
    const error = new HttpError("could not sign you in, please try again", 500);
    next(error);
  }

  if (!isValid) {
    const error = new HttpError(
      "could not sign you in, please input a correct password",
      500
    );
    return next(error);
  }
  let token;
  try {
    token = await jwt.sign(
      { userId: user.id, email: user.email },
      process.env.TOKEN_KEY,
      { expiresIn: "1h" }
    );
    console.log("this is the user token");
    console.log(token);
  } catch (err) {
    const error = new HttpError(
      "Could not sign it please try again later ",
      500
    );
    return next(error);
  }

  res.status(201).json({
    message: "sign in!",
    userId: user.toObject({ getters: true }).id,
    userEmail: user.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
