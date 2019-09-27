const express = require('express');
const userRouter = require('./routes/user');
const expressHandlebars = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const User = require('./models/user')
const flash = require('connect-flash');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const PORT = 3000 || process.env.PORT;

//MongoDb Connection

mongoose.connect("mongodb://localhost/passportdb", {
    useNewUrlParser: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
    console.log("connected to database");

});



// flash middlewares
app.use(cookieParser("passporttutorial"));
app.use(session({
    cookie: { maxAge: 60000 },
    resave: true,
    secret: "passporttutorial",
    saveUninitialized: true
}));
app.use(flash());
// passport initialize
app.use(passport.initialize());
app.use(passport.session());

//global -res.locals-middleware
app.use((req, res, next) => {
    res.locals.flashSuccess = req.flash("flashSuccess");
    res.locals.flashError = req.flash("flashError");
    //passport flash
    res.locals.passportFailure = req.flash("error");
    res.locals.passportSuccess = req.flash("success");

    //our logged in user
    res.locals.user = req.user;
    next();
});



// template engine middleware
app.engine('handlebars', expressHandlebars({ defaultLayout: 'mainLayout' }));
app.set('view engine', 'handlebars');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// router middleware
app.get("/", (req, res, next) => {
    User.find({}).then(users => {
        res.render("pages/index", { users });
    }).catch(err => console.log(err));

});

app.use(userRouter);
app.use((req, res, next) => {
    res.render('static/404');
});

app.listen(PORT, () => {
    console.log("App Started");
});