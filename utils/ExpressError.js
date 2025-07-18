//Display the status code and messsage related to it
class ExpressError extends Error{
    constructor(statusCode,message){
        super();
        this.statusCode=statusCode;
        this.message=message;
    }
}
module.exports=ExpressError;
