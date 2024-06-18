const { required } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowecase:true,
  },
  phono:{
      type:Number,
      require:true,
      unique:true,
  },
  rollno:{
   type:String,
   required:true,
   unique:true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
 ],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
],
  cart:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product',
  },
],
  otp: String,
  otpExpiration: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// const express=require('express')
// const app=express()
// const nodemailer=require('nodemailer')

// const sendEmail=(options)=>{
//     return new Promise((resolve,reject)=>{
//     let transporter=nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'tpoornamahesh@gmail.com',
//         pass:'bltx xiex ajet qydb'
//     }
//     })
//     const mail_configs={
//         from:'tpoornamahesh@gmail.com',
//         to:'abhishekgajula2018@gmail.com',
//         subject:'mail',
//         text:'checking purposes'
//     }
//     transporter.sendMail(mail_configs,function(error,info){
//         if(error){
//             console.error(error)
//             return reject({message:'error occured'})
//         }
        
//         return resolve({message:'succesful'})
//     })
// })
// }
// app.get('/',(req,res)=>{
//    res.send('I am server')
// })

// app.get('/email',(req,res)=>{
//     sendEmail().then((data)=>{
//         res.send(data.message)
// })
// .catch(error=>res.status(500).send(error.message))
// })
// app.listen(3005,()=>console.log('server started'))