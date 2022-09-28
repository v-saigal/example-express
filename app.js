
//setup basic requirements
const express = require('express');
var session = require('express-session');

const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');

const logger = require('morgan');
const path = require("path");
const examplesRouter = require("./routes/examples");
const { request } = require('http');
//create the app - an import thing!
const app = express();
const port = 3000;

function getRowNum() {
    let e = new Error();
    e = e.stack.split("\n")[2].split(":");
    e.pop();
    return e.pop();
}
/////////////////////////////////////


//After this point, we start giving app, declared above, various bits of middleware to interact with.
//These middlewares can access modify the body of the request and initiate a response - if they don't
//then they NEED to call next() otherwise the app will get stuck where it is, with the request
//sitting in the middleware unable to move on.
//
//For example, input from a form could be caught and modified through a middleware
//accessing the body before it reaches your database, being passed onto its ultimate destination
//by a call to next().
//
//You can also use these to modify other parts of the request such as the session cookie - see the
//sessionChecker middleware for an example. This is useful for information that you need to persist across
//multiple requests.
//


//////////////////////////////////



//use body parser to make requests easier to deal with
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");


//apply logger that will show us what requests we're getting in the console
app.use(logger("dev"));

//this parses cookies and makes them a tad easier to deal with
// app.use(cookieParser());

//Creates our session cookie which enables us to save data as we browse - note the object syntax denoted by
//{key:value}. To update this at later points and carry data around the session, we use
//req.session.fieldToUpdate - there is no need to initialise this field unless you are checking it
//before assigning it.

app.use(
    session({
      secret: "super_secret",
      resave: true,
      saveUninitialized: true,
      cookie: {
        expires: 600000,
      },
    })
  );

// example middleware function creation syntax - req is the request, res is the potential
//response you can send, and next is the function you call to move on if you don't give a response.
//
//This function checks to see if the session cookie has a user object assigned to it - this will usually
//only be the case if the user is logged in. This may actually be redundant - thoughts?
const sessionChecker = (req, res, next) => {
    if (!req.session.user) {
      req.session.signedIn = false;
    } else {
      req.session.signedIn = true;
    }
    next();
  };

//An example of how the sessionChecker above can be further used - if a page the user wants to access is
//only supposed to be available signed in, this will redirect them away from it.
  const signedOutRedirect = (req, res, next) => {
    if (req.session.signedIn === false) {

        res.redirect("/");
    } else {
      next();
    }
  };

  //Note the order of usage is important will middleware - the request will go through middleware
  //in the order they are called through app.use() in this file. In the case of routers, things get a
  //little trickier.
//   app.use(sessionChecker)
//   app.use(signedOutRedirect)


  //Below we will use two different pieces of middleware - one which is used directly here, and one
  //passed onto the router being used below. The one used here directly is executed first - the one
  //in the line using the examples

  const loggingDirectlyInAppJS = (req, res, next) => {


    if (req.body.loggingCount > 0) {
        req.body.loggingCount += 1;
    } else{
        req.body.loggingCount = 1;
    }

    if (req.body.loggingMessage){
        req.body.loggingMessage += "I am a message being stored in the loggingMessage value in req body, and added in the app.js file. \n";
    } else{
        req.body.loggingMessage = "I am a message being stored in the loggingMessage value in req body, and added in the app.js file. \n";
    }

    if (req.session.loggingCount > 0) {
        req.session.loggingCount++;
    } else {
        req.session.loggingCount = 1;
    }

    if (req.session.loggingMessage){
        req.session.loggingMessage += "I am a message being stored in the loggingMessage value in session cookie, and added in the app.js file. \n "
    }else{
        req.session.loggingMessage = "I am a message being stored in the loggingMessage value in session cookie, and added in the app.js file. \n "

    }
    console.log("##################SESSION DATA##########################");
    console.log(req.session)
    console.log("##################BODY DATA##########################");

    console.log({bodyLoggingMessage: req.body.loggingMessage, bodyLoggingCount: req.body.loggingCount})
    next();


  }

  const loggingDirectlyInTheRouteCallInAppJS = (req, res, next) => {

    // console.log("WE ARE IN THE LOGGING MIDDLEWARE CALLED IN EXAMPLES ROUTER SETUP IN APP.JS");
    // console.log("My body logging count is " + req.body.loggingCount.toString());
    // console.log("My body messages are: \n" + req.body.loggingMessage);
    // console.log("My session logging count is " + req.body.loggingCount.toString());
    // console.log("My session messages are: \n" + req.body.loggingMessage);

    req.body.loggingCount += 1;
    req.body.loggingMessage += "I am a message being stored in the loggingMessage value in req body, and added in the example router setup in app.js file. \n";

    req.session.loggingCount += 1;
    req.body.loggingMessage += "I am a message being stored in the loggingMessage value in session cookie, and added in the example router setup inapp.js file. \n";
    console.log("##################SESSION DATA##########################")
    console.log(req.session)
    console.log("##################BODYŸŸ DATA##########################");
    console.log({bodyLoggingMessage: req.body.loggingMessage, bodyLoggingCount: req.body.loggingCount})
    next();
  }

  app.use(loggingDirectlyInAppJS)
  app.use("/", loggingDirectlyInTheRouteCallInAppJS, examplesRouter)


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

  module.exports = app;
