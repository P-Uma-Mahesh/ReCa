const mongoose =require('mongoose');
const Listing=require("../models/listing.js");
const initData=require("./data.js");
const MONGO_URL="mongodb://localhost:27017/wanderlust";
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
const initDB=async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();
