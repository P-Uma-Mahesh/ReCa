
    require("dotenv").config();
    // to restrict the usage on production phase of project

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
  const {storage}=require("./cloudConfig.js");
  const upload=multer({storage});
  const jwt = require('jsonwebtoken');
  const cookieparser=require('cookie-parser');
  const { decode } = require('punycode');
  const WrapAsync = require('./utils/WrapAsync.js');
  const Razorpay = require('razorpay');
  const port=process.env.PORT
  
  
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
    return jwt.sign({ id: User._id ,role:User.role},process.env.JWT_SECRET );
  }
  
  async function getUser(cookies){
    const token=cookies?.uid;
    const decoded= jwt.verify(token, process.env.JWT_SECRET);
    const reqUser=await User.findById(decoded.id);
    return reqUser;
   
    
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
  
  app.get('/reca',wrapAsync((req, res) => {
         res.render("welcome/welcome.ejs",{});
  }));
  app.get("/reca/signin",wrapAsync((req,res)=>{
         res.render("welcome/signin.ejs",{message:null});
  }));
  app.get("/reca/signup",wrapAsync(async (req,res)=>{
    
      res.render("welcome/signup.ejs",{message:null});
  }));
  const validatePhoneNumber = (phoneNumber) => {
    // Validate phone number format (10 digits)
    return /^\d{10}$/.test(phoneNumber);
  };
  
  const validateRollNumber = (rollNumber) => {
    // Validate roll number format (11 characters, first two > 19)
    if (rollNumber.length !== 10) return false;
    const firstTwoDigits = rollNumber.substring(0, 2);
    return /^\d+$/.test(firstTwoDigits) && parseInt(firstTwoDigits) > 19;
  };
  
  app.post("/reca/signup", async (req, res) => {
    let { name, email, rollno, phono, password } = req.body;
  
    if (!validateRollNumber(rollno)) {
      return res.status(400).render('welcome/signup.ejs', { message: 'Invalid roll number' });
    }
    // Validate phone number
    if (!validatePhoneNumber(phono)) {
      return res.status(400).render('welcome/signup.ejs', { message: 'Invalid phone number' });
    }
  
    // Validate roll number
    
  
    // If validations pass, proceed with hashing password and saving user
    try {
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
  
      let newuser = new User({
        name: `${name}`,
        email: `${email}`,
        phono: `${phono}`,
        rollno: `${rollno}`,
        password: `${newPassword}`,
        role: 'NORMAL',
        otp: null,
        otpExpiration: null,
      });
  
      await newuser.save(); // Use await to properly handle asynchronous operations
  
      res.redirect("/reca/signin");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  app.post("/reca/signin",wrapAsync(async (req, res) => {
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
    }));
    
  app.get("/reca/home",wrapAsync(async(req,res)=> {
   
    let user=await getUser(req.cookies);
  
    
    res.render("user/home.ejs",{user});
  }));
  app.get("/reca/forgotpassword",wrapAsync((req,res)=>{
       res.render("welcome/forgotpassword.ejs",{});
  }));
  app.post('/reca/send-otp',wrapAsync( async (req, res) => {
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
  }));
  
  // Endpoint to reset password
  app.post('/reca/reset-password',wrapAsync( async (req, res) => {
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
    
  }));
  
  
  app.get("/reca/products",wrapAsync(async (req,res)=>{
       const allListings=await Product.find({});
       res.render("listings/index.ejs",{allListings});
  }));
  app.get("/reca/new",wrapAsync((req,res)=>{
      console.log("new page");
      res.render("listings/new.ejs",{});
  }));
  app.get("/reca/mycart",wrapAsync(async (req, res) => {
    try{
      const reqUser=await getUser(req.cookies);
      const user= await reqUser.populate("cart");
      let cartItems=user.cart;
      console.log(cartItems);
      let totalAmount = cartItems.reduce((total, item) => {
        return total + (item.price ); // assuming item.price and item.quantity
      }, 0);
      res.render('user/mycart.ejs', { cartItems ,totalAmount});
    } catch (error) {
      console.error('Error rendering cart:', error);
      res.status(500).send('Internal Server Error');
    }
  }));
  app.get("/reca/user", wrapAsync(async (req, res) => {
    try {
      const reqUser=await getUser(req.cookies)
      const user = await reqUser.populate([{
        path: "products",
        model: "Product",
      }, {
        path: "orders",
        model: "Order",
        populate: {
          path: "products",  // populate the products in each order
          model: "Product"
        }
      }]);
       
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const orderedItems = user.orders.map(order => order.products).flat();
      const soldItems = user.products;
     console.log(orderedItems);
      res.render('user/userprofile.ejs', { user, orderedItems, soldItems });
    } catch (error) {
      console.error('Error rendering user orders:', error);
      res.status(500).send('Internal Server Error');
    }
  }));
  // sell route
  app.post('/addproduct',upload.single('image'),  wrapAsync(async (req, res, next) => {
    if (!req.body.listing) {
        throw new ExpressError(400, 'Send valid product details');
    }
    const { title, description, price, branch, category } = req.body.listing;
      const image = req.file.path; // Assuming Multer gives a unique filename
      console.log(image);
    const newProduct = new Product({
      title,
      description,
      price,
      branch,
      category,
      image: image, // Save path to the image
  }); 
   let userproduct=await newProduct.save();
   
   let user=await getUser(req.cookies);
  
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
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
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
  
  
  app.post('/reca/cart/remove',wrapAsync(async(req,res)=>{
    const  productId  = req.body.productId;
    const reqUser=await getUser(req.cookies);
    let user =await reqUser.populate('cart');
    console.log(productId);
    user.cart.remove(productId);
    user.save();
    let cartItems=user.cart;
    console.log(cartItems);
    res.redirect("/reca/mycart");
  
  }));
  //payment 
  const razorpay = new Razorpay({
    key_id: 'rzp_live_1j2EriedZMsgq4',
    key_secret: 'h1WUmj019fY4ld1UDCDPgWjE',
  });
  //create order
  app.post('/create-order', wrapAsync(async (req, res) => {
    console.log("order received");
    const { amount, currency, receipt } = req.body;
  
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
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
  }));
  const { ObjectId } = mongoose.Types;
  const jwtSecret = process.env.JWT_SECRET; // Replace with your actual secret key
  
  app.post('/verify-payment',  wrapAsync(async (req, res) => {
    console.log("verify is received");
    const { order_id, payment_id, signature, userId } = req.body;
    console.log(order_id, payment_id, signature, userId);
  
    try {
      const decodedToken = jwt.verify(userId, jwtSecret);
      const userIdFromToken = decodedToken.id;
      
      const generatedSignature = crypto.createHmac('sha256', 'h1WUmj019fY4ld1UDCDPgWjE')
        .update(`${order_id}|${payment_id}`)
        .digest('hex');
  
      if (generatedSignature === signature) {
        // Payment verification successful
        const user = await User.findById(userIdFromToken).populate('cart');
        console.log(user);
  
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
  
        const newOrder = new Order({
          user: user._id,
          products: user.cart,
          totalAmount: user.cart.reduce((total, item) => total + item.price, 0),
          paymentId: payment_id,
          status: 'pending',
        });
  
        await newOrder.save();
  
        user.orders.push(newOrder._id);
        
        const cartProductUpdates = user.cart.map(async (item) => {
          const product = await Product.findById(item._id);
          console.log(product);
  
          if (product) {
            product.available = false;
            await product.save();
          }
        });
  
        await Promise.all(cartProductUpdates);
        
        user.cart = [];
        await user.save();
  
        res.json({ success: true, message: 'Payment verified and order created' });
      } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }));
  app.get('/reca/admin',restrictTo(['ADMIN']),wrapAsync(async (req, res) => {
    const users = await User.find({});
    const products = await Product.find({});
    const orders = await Order.find({status:"pending"}).populate('user');
    res.render('admin/admin.ejs', { users, products, orders });
  }));
  
  app.delete("/admin/products/remove/:id", restrictTo(['ADMIN']), wrapAsync(async (req, res) => {
    let { id } = req.params;
    
    // Delete the product by ID
    await Product.findByIdAndDelete(id);
  
    // Find all users who have this product in their products array
    await User.updateMany(
      { products: id },  // Find users with the product ID in their products array
      { $pull: { products: id } }  // Remove the product ID from the array
    );
  
    res.redirect("/reca/admin");
  }));
  app.post('/admin/orders/deliver/:id', restrictTo(['ADMIN']), wrapAsync(async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: 'Delivered' });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err });
    }
  }));
  app.get('/admin/orders/cancel/:id'), restrictTo(['ADMIN']), wrapAsync(async (req, res) => {
    try {
        console.log("do your want cancel the order");
        await Order.findByIdAndUpdate(req.params.id, { status:'failed'});
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err });
    }
  });
  //edit route
  app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
        console.log("update received");
        let {id}=req.params;
        console.log(id);
        const listing= await Product.findById(id);
       
        res.render("listings/edit.ejs",{listing});
  }));
  //edit for admin
  app.get("/admin/listings/:id/edit",restrictTo(['ADMIN']),wrapAsync(async (req,res)=>{
    console.log("update received");
    let {id}=req.params;
    console.log(id);
    const listing= await Product.findById(id);
    
    res.render("admin/edit.ejs",{listing});
  }));
  //update route
  app.put("/listings/:id",wrapAsync(async (req,res)=>{
       let {id}=req.params;
       let listing=req.body.listing;
       await Product.findByIdAndUpdate(id,{...req.body.listing});
       res.redirect(`/listings/${id}`);
  }));
  //admin update
  app.put("/admin/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing=req.body.listing;
    await Product.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/reca/admin`);
  }));
  app.put("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing=req.body.listing;
    await Product.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
  }));
  //delete route
  app.delete("/listings/:id", wrapAsync(async (req,res)=>{
        let {id}=req.params;
        await Product.findByIdAndDelete(id);
        res.redirect("/reca/products");
  }));
  
  // reca products
  app.get("/reca/products/:branch/:category", wrapAsync(async (req, res) => {
      
      console.log("API received");
      const { branch, category } = req.params;
      console.log(branch,category);
      let allListings = await Product.find({ branch, category });
      res.render("listings/index.ejs", { allListings });
  
  
  }));
  app.get("/reca/products",wrapAsync(async(req,res)=>{
      let allListings=await Product.find({});
      res.render("listings/index.ejs",{allListings});
  }));
  
  
  
  app.get("/listings/:id",wrapAsync(async (req,res)=>{
       let {id}=req.params;
       const listing= await Product.findById(id);
  
       res.render("listings/show.ejs",{listing});
  }));
  
  //admin page route
  app.get('/reca/adminpage',restrictTo(['ADMIN']),wrapAsync((req,res)=>{
    // countUsers().then((count)=>noOfUsers=count)
    // console.log(noOfUsers)
    res.render('admin/admin.ejs');
  
  }));
  
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    res.render('views/error.ejs', { message: err.message });
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
    const decoded= jwt.verify(token,process.env.JWT_SECRET);
      if(!roles.includes(decoded.role))
        return res.end('Unauthorized')
      return next();
    }
  }
  app.listen(port,()=>{
      console.log("vintunna");
  });
