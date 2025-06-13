const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
    },
    cardName:{
        type: String,
        required:true, 
    },
});

module.exports = mongoose.model('Comment',commentSchema);