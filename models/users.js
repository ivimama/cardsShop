const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
name:{
type: String,
required: true,
},
quantity:{
    type: Number,
    required:true,
    default:0,
},
image: {
    type: String,
    required: true
},
description:{
type: String,
required: true,
},
price:{
    type: Number,
    required:true,
    
},
created:{
    type: Date,
    required: true,
    default:Date.now
},
});

module.exports = mongoose.model('User', userSchema);