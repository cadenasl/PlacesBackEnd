const express = require("express");
const router = express.Router();
const {check}=require('express-validator')
const userControllers=require('../Controllers/user-controllers');
const fileUpload = require('../middleware/File-Upload');




router.get("/",userControllers.getUsers);
router.post('/signup',
fileUpload.single("image"),
//accepts a single file with the name fieldname. The file will be stored in req.file
[check('name').not().isEmpty(),check('email').normalizeEmail().isEmail(),check('password').not().isEmpty(),check('password').isLength({min:6})],userControllers.signUp)
router.post('/login',userControllers.login)



module.exports =router



