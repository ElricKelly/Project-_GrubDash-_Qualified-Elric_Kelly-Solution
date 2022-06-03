const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function validateOrderBody(req, res, next){
    const {data: {deliverTo, mobileNumber, dishes} = {} } = req.body;
    let message;
    console.log(dishes)
    if(!deliverTo || deliverTo === ""){
      message = "Order must include a deliverTo"
    }
    else if(!mobileNumber || mobileNumber === ""){
      message = "Order must include a mobileNumber."
    }
    else if(!dishes){
      message = "Order must include a dish."
    }
    else if(typeof dishes !== "array"){
      message = "Order must include at least one dish."
    }
    else if(dishes.length === 0){
        message = "Order must include at least one dish."
      }
    // else if(!image_url || image_url === ""){
    //   message = "Dish must include an image_url."
    // }
  
    if(message){
      return next({
        status: 400,
        message: message,
      })
    }
  
    next();
  }


const list = (req, res, next) => {
    res.json({ data: orders });
  };

  function create(req, res, next){
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body;
    const newOrder = {
      id: nextId(),
      deliverTo,
      mobileNumber,
      status,
      dishes
    }
    orders.push(newOrder);
    res.status(201).json({data: newOrder})
  }

  module.exports = {
      list,
      create: [validateOrderBody, create]
  }