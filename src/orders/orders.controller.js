const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  });
}

function validateOrderBody(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  let message;

  if (!deliverTo || deliverTo === "") {
    message = "Order must include a deliverTo";
  } else if (!mobileNumber || mobileNumber === "") {
    message = "Order must include a mobileNumber.";
  } else if (!dishes) {
    message = "Order must include a dish.";
  } else if (!dishes.length || !Array.isArray(dishes)) {
    message = "Order must include at least one dish.";
  } else {
    for (let i = 0; i < dishes.length; i++) {
      if (
        !dishes[i].quantity ||
        dishes[i].quantity <= 0 ||
        !Number.isInteger(dishes[i].quantity)
      ) {
        message = `Dish ${i} must have a quantity that is an integer greater than 0. `;
      }
    }
  }

  if (message) {
    return next({
      status: 400,
      message: message,
    });
  }

  next();
}

function validateMatchingId(req, res, next){
  const {orderId} = req.params;
  const {data: {id} = {}} = req.body;

  if(!id || (id == orderId)){
    res.locals.orderId = orderId;
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
  })

  next();
}

function validateOrderStatus(req, res, next){
  const {status} = req.body.data
  let message;

  if(!status || status === "invalid"){
    message = "Order must have a status of pending, preparing, out-for-delivery, delivered"
  }
  else if(status === "delivered"){
    message = "A delivered order cannot be changed"
  }

  if (message) {
    return next({
      status: 400,
      message: message,
    });
  }

  next();
}

function validateStatusForDelete (req, res, next){
  const {status} = res.locals.order
  if (status !== "pending"){
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending"
    })
  }
  next();
}

const list = (req, res, next) => {
  res.json({ data: orders });
};

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  res.locals.order = {
    id: res.locals.orderId,
    deliverTo,
    mobileNumber,
    status,
    dishes
  };

  res.status(200).json({ data: res.locals.order });
}

function destroy(req, res, next){
  // orders = orders.filter((order) =>{
  //   return order.id !== req.params.orderId
  // })
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));

  orders.splice(index, 1);

  res.sendStatus(204).json({ data: orders });
}

module.exports = {
  list,
  create: [validateOrderBody, create],
  read: [orderExists, read],
  update: [orderExists, validateOrderBody, validateMatchingId, validateOrderStatus, update],
  destroy: [orderExists, validateStatusForDelete, destroy]
};
