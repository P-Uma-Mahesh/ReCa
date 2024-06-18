const joi=require("joi");

module.exports.listingSchema=joi.object({
    listing:joi.object({
        title:joi.string().required(),
        description:joi.string().required(),
        price:joi.number().required().min(0),
    }).required(),
});
// below code we have to use in app js
// let result=listingSchema.validate(req.body);
// if(result.error){
//   throw new ExpressError(400,result.error);
// }