//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

//dbConn
mongoose.connect(process.env.DB_URI)
.then(() => console.log("Connected to the database")).catch(() => console.log("Error"));
 
//milddlewares 
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
secret: "my secret key",
saveUninitialized: true,
resave: false
}));

app.use((req, res , next ) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use( express.static('uploads'));
app.use(express.static("public"));

//set template engine
app.set('view engine', 'ejs');


//router prefix
app.use('', require('./routes/routes'));
app.use('/comments',require('./routes/comments'));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});