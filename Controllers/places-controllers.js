
const { uuid } = require('uuidv4');
const HttpError=require('../Models/http-error')
//imports HttpError class to throw an error
const { validationResult } =require('express-validator')
const getCoordsForAddress =require('../util/googlecoordinates')
const Place=require("../Models/placesSchema");
const User=require("../Models/usersSchema")
const mongoose=require("mongoose")
const fs=require("fs")







const getPlaceById=async (req, res, next) => {
    const placeId=req.params.pid
    //gets the place id from the params
    let place
    try{place =await Place.findById(placeId).exec()}
    catch(err){
      const error= new HttpError("could not obtain data from database",500)
      return next(error)
    }
   
    if(!place){
        
       const error= new HttpError("Could not find the place Id",404)
       return next(error)
        //throws an HTTp error that was created in http-error.js
        
        
    }
   //finds the item that matches the place id
    console.log(place)
     res.json({place:place.toObject({getters:true})});
     //returns the place that matches place id
   }


   const getPlacesByUserId=async(req,res,next)=>{
    const userid=req.params.uid 
    //gets the creator id from the params 
    let places
    try{places =await Place.find({creator:userid}).exec()}
    catch(err){
      const error= new HttpError("fetching users place has failed",500)
      return next(error)
    }
    if(!places||places.length===0){
        
      const error= new HttpError("Could not find the places with User Id",404)
      return next(error)
       //throws an HTTp error that was created in http-error.js
       
       
   }
    //finds the place that matches the creator id 

    res.json({places:places.map(place=>place.toObject({getters:true}))})
    //returns the place to the brower to render

}

const addPlace=async(req,res,next)=>{
  const errors=validationResult(req)
  if(!errors.isEmpty()){
    const error=new HttpError("Invalid inputs passed,please check your data",422)
    return next(error)
  }
  const{title,description,address,creator}=req.body
  let coordinates 
  try{ coordinates =await getCoordsForAddress(address)}
  catch(err){
    const error=new HttpError("coordinate fetching failed",422)
    return next(error)}
 
  const createdPlace= new Place({
    title,
    description,
    image:req.file.path,
    address,
    location:coordinates,
    creator
})
let user;
try{user=await User.findById(creator)}
catch(err){
  const error= new HttpError("could not find user for provided id",500) 
 return next(error)
}
if(!user){
  const error=new HttpError("could not find user for provided id",404)
  return next(error)
}
console.log(user)
try{const sess=await mongoose.startSession();
  sess.startTransaction();
  await createdPlace.save({session:sess})
  user.places.push(createdPlace)
  await user.save({session:sess})
  await sess.commitTransaction()
  
  
}
catch(err){
 const error= new HttpError("creating a new place failed",500) 
 return next(error)
}


 
res.status(201).json({message:"place was added"})

}

const updatePlaces= async(req,res,next)=>{
  const errors=validationResult(req)
  if(!errors.isEmpty()){
    const error= new HttpError("Invalid inputs passed,please check your data",422)
    return next(error)
  }
  const placeId=req.params.pid
  const{title,description}=req.body
  let place
  try{ place=await Place.findById(placeId).exec()}
  catch(err){
    const error= new HttpError("fetching place Id has failed",500) 
 return next(error)
  }
  

  if(place.creator.toString()!==req.userData.userId){
    
    const error= new HttpError("not allowed to edit this place",401) 
    return next(error)
  }
  place.title=title;
  place.description=description
  try{await place.save();
 
  }
  catch(err){
    const error= new HttpError("updating place has failed",500) 
 return next(error)
  }

   
 
  res.status(201).json({place:place.toObject({getters:true})})
 
}

const deletePlace=async(req,res,next)=>{
  const placeId=req.params.pid
  

  let place

  try{
    place=await Place.findById(placeId).populate('creator')
  }catch(err){
    console.log(err)
    const error= new HttpError("something went wrong could not obtain id to  delete place",500) 
 return next(error)
  }

  if(!place){
    const error= new HttpError("could not find place id ",500) 
    return next(error)
  }
  const image=place.image
  console.log(place.creator.id.toString())
  console.log(req.userData.userId)

  if(place.creator.id.toString()!==req.userData.userId){
    const error= new HttpError("can not delete this place ",401) 
    return next(error)
  }
  
  try{const sess=await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session:sess})
    place.creator.places.pull(place)
    await place.creator.save({session:sess})
    await sess.commitTransaction()
  }
   
  catch(err){
    const error = new HttpError("Something went wrong,could not delete place",500)
    return next(error)
  }
fs.unlink(image,(err)=>{console.log(err)})
  res.status(200).json({message:"deleted place"})
}
exports.getPlaceById=getPlaceById
//exports controller from getPlaceById
exports.getPlacesByUserId=getPlacesByUserId
//exports controller from getPlaceByUserId
exports.addPlace=addPlace
exports.updatePlaces=updatePlaces
exports.deletePlace=deletePlace
