class HttpError extends Error{
    constructor(message,errorCode){
        super(message)
        this.code=errorCode
    }
}
//HttpError inherits class properties like message and we added an error code

module.exports=HttpError