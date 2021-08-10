const express = require("express");
const router = express.Router();
const { check } =require('express-validator')
const placeControllers=require('../Controllers/places-controllers')
const fileUpload = require('../middleware/File-Upload');
const checkAuth =require("../middleware/Check-Auth")

//imports placeControllers 



router.get("/:pid",placeControllers.getPlaceById );
//route for /:pid

router.get('/users/:uid',placeControllers.getPlacesByUserId)
//route for /users/:uid
router.use(checkAuth)
router.post('/',fileUpload.single("image"),[check('title').not().isEmpty(),check('description').not().isEmpty(),check('description'),check('description').isLength({min:5}),check("address").not().isEmpty()],placeControllers.addPlace)
//route is created for adding a place
router.patch("/:pid",[check('title').not().isEmpty(),check('description').not().isEmpty()],placeControllers.updatePlaces)
router.delete('/:pid',placeControllers.deletePlace)
module.exports = router;
//exports router
