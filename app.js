require('dotenv').config()

const express=require('express');
const app=express();
const mongoose =require('mongoose');
const Product=require("./models/products.js");
const User=require("./models/user.js");
const Order=require("./models/orders.js");
const wrapAsync=require("./utils/WrapAsync.js");
const expressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./Schema.js");
const path=require("path");
const ejsMate =require("ejs-mate");
const methodOverride =require("method-override");
const bodyParser = require('body-parser');
const ExpressError = require('./utils/ExpressError.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload=multer({dest:"uploads/"});
const jwt = require('jsonwebtoken');
const cookieparser=require('cookie-parser');
const { decode } = require('punycode');
const WrapAsync = require('./utils/WrapAsync.js');
const Razorpay = require('razorpay');
const port=process.env.PORT;



app.use(express.json());
app.set("views","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:true}));

app.engine("ejs",ejsMate);

app.use(express.static(path.join(__dirname,"public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(methodOverride("_method"));
app.use(cookieparser())
const MONGO_URL=process.env.MONGO_URL;

function generateToken(User) {
  return jwt.sign({ id: User._id ,role:User.role}, 'umamaheshjkhdwehuirh');
}

main()
.then(()=>{
    console.log("db connected");
 })
 .catch(err=>{ 
    console.log(err)
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get('/reca', (req, res) => {
       res.render("welcome/welcome.ejs",{});
});
app.get("/reca/signin",(req,res)=>{
       res.render("welcome/signin.ejs",{message:null});
});
app.get("/reca/signup",async (req,res)=>{
 
    res.render("welcome/signup.ejs",{});
});
app.post("/reca/signup", async (req,res)=>{
    let {name,email,rollno,phono,password}=req.body;
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(password, salt);
    let newuser=new User({
      name:`${name}`,
      email:`${email}`,
      phono:`${phono}`,
      rollno:`${rollno}`,
      password:`${newPassword}`,
      role:'NORMAL',
      otp:null,
      otpExpiration: null,

    });
    newuser.save()
    .then((result)=>{
      res.redirect("/reca/signin");
    })
    .catch((err)=>{
      res.send(err);
    });  
});
app.post("/reca/signin", async (req, res) => {
    console.log("signin");
    const { rollno, password } = req.body;
    console.log(password, rollno);
  
    try {
      const user = await User.findOne({ rollno: `${rollno}` });
      console.log(user);
      if (!user) {
        return res.render('welcome/signin.ejs',{message:'Invalid user'});
      }
  
      const isValid=await bcrypt.compare(password,user.password)
      if (!isValid) {
        return res.status(400).render('welcome/signin.ejs',{message:'Invalid password'});
      }
      const token = generateToken(user);
      res.cookie('uid',token);
    res.render("user/home.ejs", {user});
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
app.get("/reca/home",async(req,res)=> {
  const token=req.cookies?.uid;
  const decoded= jwt.verify(token, 'umamaheshjkhdwehuirh');
  
  let user=await User.findById(decoded.id);
  console.log(user);
  res.render("user/home.ejs",{user});
});
app.get("/reca/forgotpassword",(req,res)=>{
     res.render("welcome/forgotpassword.ejs",{});
});
app.post('/reca/send-otp', async (req, res) => {
  const { rollno, phono} = req.body;
  console.log(rollno,phono);
  const user = await User.findOne({ rollno, phono });
  console.log(user);
  if (!user) {
      return res.status(404).send('User not found');
  }
  let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'tpoornamahesh@gmail.com',
            pass:'bltx xiex ajet qydb'
        }
        });
  // Generate OTP
  const otp = crypto.randomBytes(3).toString('hex');
  user.otp = otp;
  user.otpExpiration = Date.now() + 3600000; // OTP valid for 1 hour
  await user.save();
  console.log(user.email);

  // Send OTP via email using NodeMailer
  const mail_configs = {
      from: 'tpoornamahesh@gmail.com',
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
  };

  transporter.sendMail(mail_configs,function(error,info){
            if(error){
                console.error(error)
                return reject({message:'error occured'})
            }
            
            return resolve({message:'succesful'})
        });
});

// Endpoint to reset password
app.post('/reca/reset-password', async (req, res) => {
  const { otp, newPassword } = req.body;
  const user = await User.findOne({ otp, otpExpiration: { $gt: Date.now() } });
  console.log( otp, newPassword);
  console.log(user);
  if (!user) {
      return res.status(400).send('Invalid OTP or OTP has expired');
  }

  // Hash the new password and save
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.otp = undefined;
  user.otpExpiration = undefined;
  await user.save();

  res.redirect("reca/signin.ejs");
  
});


app.get("/reca/products",async (req,res)=>{
     const allListings=await Product.find({});
     res.render("listings/index.ejs",{allListings});
});
app.get("/reca/new",(req,res)=>{
    console.log("new page");
    res.render("listings/new.ejs",{});
});
app.get("/reca/mycart", async (req, res) => {
  try{
    const token=req.cookies?.uid;
    const decoded= jwt.verify(token, 'umamaheshjkhdwehuirh');
    const user=await User.findById(decoded.id).populate("cart");
    let cartItems=user.cart;
    let totalAmount = cartItems.reduce((total, item) => {
      return total + (item.price ); // assuming item.price and item.quantity
    }, 0);
    res.render('user/mycart.ejs', { cartItems ,totalAmount});
  } catch (error) {
    console.error('Error rendering cart:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/reca/user", async (req, res) => {
  try {
    const token=req.cookies?.uid;
    const decoded= jwt.verify(token, 'umamaheshjkhdwehuirh');
     let user=await User.findById(decoded.id).populate([{
      path:"products",
      model:"Product",
     },
     {
      path:"orders",
      model:"Order",
     }
    ]);
     
    const orderedItems =  user.orders;
    const soldItems = user.products;

    res.render('user/userprofile.ejs', { user, orderedItems, soldItems });
  } catch (error) {
    console.error('Error rendering user orders:', error);
    res.status(500).send('Internal Server Error');
  }
});
// sell route
app.post('/addproduct',upload.single('image'),  wrapAsync(async (req, res, next) => {
  if (!req.body.listing) {
      throw new ExpressError(400, 'Send valid product details');
  }
  const { title, description, price, branch, category } = req.body.listing;
    const image = req.file.filename; // Assuming Multer gives a unique filename
  const newProduct = new Product({
    title,
    description,
    price,
    branch,
    category,
    image: `/uploads/${image}`, // Save path to the image
}); 
 let userproduct=await newProduct.save();
 const token=req.cookies?.uid;
 const decoded= jwt.verify(token, 'umamaheshjkhdwehuirh');
 
 let user=await User.findById(decoded.id);

  user.products.push(userproduct);
  user.save();
  res.redirect('/reca/products');
}));

app.post('/cart/add', WrapAsync(async (req, res,next) => {
  console.log("add");
  
  const token = req.cookies?.uid;
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }
  
   try{
    const decoded = jwt.verify(token, 'umamaheshjkhdwehuirh');
    const userId = decoded.id;  // Assuming you have user authentication and `req.user` contains the logged-in user's info
    
    const { productId } = req.body;
   
    
    let user = await User.findById(userId);
    
    if (user) {
      const cartProduct = user.cart.find(id => id.toString() === productId);
      console.log(cartProduct);
      if (!cartProduct) {
        user.cart.push(productId);
        await user.save();
        
        res.redirect("/reca/products");
      } else {
         res.status(400).send("Item is already in the cart!");
         throw new ExpressError(404,"page not found");
      }
    } else {
      
      res.status(404).send("User not found");
     }
   }
   catch(err){
       next(err);
   }
   
}));


app.post('/reca/cart/remove',async(req,res)=>{
  const  productId  = req.body.productId;
  const token=req.cookies?.uid;
  const decoded= jwt.verify(token, 'umamaheshjkhdwehuirh');
  const userId = decoded.id;
  let user = await User.findById(userId).populate('cart');
  console.log(productId);
  user.cart.remove(productId);
  user.save();
  let cartItems=user.cart;
  console.log(cartItems);
  res.redirect("/reca/mycart");

})
//payment 
const razorpay = new Razorpay({
  key_id: 'rzp_test_gNWykseo15tPUR',
  key_secret: 'vr6hdlTS9e7S4DGnnlHWkTNF',
});
//create order
app.post('/create-order', async (req, res) => {
  console.log("order received");
  const { amount, currency, receipt } = req.body;

  const options = {
    amount, // amount in the smallest currency unit
    currency,
    receipt,
  };

  try {
    const order =  razorpay.orders.create(options,function(err,order){
         res.json(order);
    });
  } catch (error) {
    res.status(500).send('Error creating Razorpay order');
  }
});
app.post('/verify-payment', async (req, res) => {
  console.log("verify is recieved");
  const { order_id, payment_id, signature, userId } = req.body;
  console.log(order_id, payment_id, signature, userId);
  const generatedSignature = crypto.createHmac('sha256', 'vr6hdlTS9e7S4DGnnlHWkTNF')
    .update(`${order_id}|${payment_id}`)
    .digest('hex');

  if (generatedSignature === signature) {
    // Payment verification successful
    const user = await User.findById(userId).populate('cart');

    const newOrder = new Order({
      user: user._id,
      products: user.cart,
      totalAmount: user.cart.reduce((total, item) => total + item.price * item.quantity, 0),
      paymentId: payment_id,
      status: 'completed',
    });

    await newOrder.save();

    user.orders.push(newOrder._id);
    user.cart = [];
    await user.save();

    res.json({ success: true, message: 'Payment verified and order created' });
  } else {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
});
//admin
app.get('/reca/admin',restrictTo(['ADMIN']), async (req, res) => {
  const users = await User.find({});
  const products = await Product.find({});
  const orders = await Order.find({}).populate('user');
  res.render('user/admin.ejs', { users, products, orders });
});
app.delete('/admin/users/remove/:id', restrictTo(['ADMIN']), async (req, res) => {
  console.log("admin remove");
  try {
      await User.findByIdAndRemove(req.params.id);
      res.json({ success: true });
  } catch (err) {
      res.json({ success: false, error: err });
  }
});

app.delete('/admin/products/remove/:id',restrictTo(['ADMIN']), async (req, res) => {
  try {
      console.log("product remove");
      cosole.log(req.params);
      await Product.findByIdAndRemove(req.params.id);
      res.json({ success: true });
  } catch (err) {
      res.json({ success: false, error: err });
  }
});


app.post('/admin/orders/deliver/:id', restrictTo(['ADMIN']), async (req, res) => {
  try {
      await Order.findByIdAndUpdate(req.params.id, { status: 'Delivered' });
      res.json({ success: true });
  } catch (err) {
      res.json({ success: false, error: err });
  }
});
//edit route
app.get("/listings/:id/edit",async (req,res)=>{
      console.log("update received");
      let {id}=req.params;
      console.log(id);
      const listing= await Product.findById(id);
      console.log(listing);
      res.render("listings/edit.ejs",{listing});
});
//update route
app.put("/listings/:id",async (req,res)=>{
     let {id}=req.params;
     let listing=req.body.listing;
     await Product.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listings/${id}`);
});
app.put("/admin/listings/:id",async (req,res)=>{
  let {id}=req.params;
  let listing=req.body.listing;
  await Product.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/reca/admin`);
});
//delete route
app.delete("/listings/:id", async (req,res)=>{
      let {id}=req.params;
      await Product.findByIdAndDelete(id);
      res.redirect("/reca/products");
});
app.delete("/admin/products/remove/:id",  restrictTo(['ADMIN']),async (req,res)=>{
  let {id}=req.params;
  await Product.findByIdAndDelete(id);
  res.redirect("/reca/admin");
});
// reca products
app.get("/reca/products/:branch/:category", async (req, res) => {
    
    console.log("API received");
    const { branch, category } = req.params;
    console.log(branch,category);
    let allListings = await Product.find({ branch, category });
    res.render("listings/index.ejs", { allListings });


});
app.get("/reca/products",async(req,res)=>{
    let allListings=await Product.find({});
    res.render("listings/index.ejs",{allListings});
});



app.get("/listings/:id",async (req,res)=>{
     let {id}=req.params;
     const listing= await Product.findById(id);

     res.render("listings/show.ejs",{listing});
});

//admin page route
app.get('/reca/adminpage',restrictTo(['ADMIN']),(req,res)=>{
  // countUsers().then((count)=>noOfUsers=count)
  // console.log(noOfUsers)
  res.render('user/admin.ejs');

})


//create own error
app.all("*",(req,res,next)=>{
     next(new ExpressError(404,"page not found"));
});
app.use((err,req,res)=>{
   let {statusCode,message}=err;
   res.status(statusCode).render("error.ejs",{message});
});
//counting number of users
async function countUsers() {
  try {
      const count = await User.countDocuments({});
      return count;
  } catch (err) {
      return err
  } 
}
countUsers();
// Call the function

function restrictTo(roles=[]){
  
  return function(req,res,next){
    const token=req.cookies?.uid;
  const decoded= jwt.verify(token, 'umamaheshjkhdwehuirh');
    if(!roles.includes(decoded.role))
      return res.end('Unauthorized')
    return next();
  }
}
app.listen(port,()=>{
    console.log("vintunna");
});
