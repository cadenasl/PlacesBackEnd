const jwt = require("jsonwebtoken");
const HttpError = require("../Models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    //retrives token from header and obtains the token from bearer token
    if (!token) {
      const error = new HttpError("Could not authenticate an error occured");
      next(error);
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Authentication failed 401", 401);
    return next(error);
  }
};
