const models = require('../schemas'/schemas);
const fs = require('fs');
const path = require('path');

const controller = {};

controller.getUser = (req, res, next) => {
    models.User.find({}, (err, result) => {
        if (err)
          return console.error(err + "Username and/or password not found!");
        console.log('result: ',result);
      });
      // check database for user information
        // if found, return in data and move to next middleware function

      next();
}

controller.loginUser = (req, res, next) => {
    // change page to main.js (map page w/sidebars components)
    // load data into state and populate the map with pins
  
    next();
  };

controller.saveButton = (req, res, next) => {
    // write code here
    // save whatever is reflected in the current state as an object in the database
    // this will take all of the current active pins, preferrably in an array, and save them back to the databse
  
    next();
  };


  module.exports = controller;