// to avoid to write try and catch in every functions
// use this function to every route in app 
module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
}
