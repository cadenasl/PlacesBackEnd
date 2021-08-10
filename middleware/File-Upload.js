const multer=require('multer')
const { uuid } = require('uuidv4')

const MIME_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

const fileUpload=multer({
    limits:500000,
    //limits how many bytes is the limit for storage
    storage:multer.diskStorage({ destination:(req,file,cb)=>{
        cb(null,'uploads/images')
    },filename:
(req,file,cb)=>{
    const ext=MIME_TYPE_MAP[file.mimetype]
    cb(null, uuid()+"."+ext )
    //checks what the file extension is and checks with the MIME_TYPE_MAP to ouput correct ext.For example image.png will output ext png
},
fileFilter:(req,file,cb)=>{
   
  const isValid=!!MIME_TYPE_MAP[file.mimetype]
  let error=isValid?null:new Error("Invalid mimetype")
    cb(error,isValid)
}

}
       
    )
    //where to store our image file 

})

module.exports=fileUpload

