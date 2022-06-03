const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: dishes });
};

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}`,
  });
}

function validateDishBody(req, res, next){
  const {data: {name, description, price, image_url} = {} } = req.body;
  let message;

  if(!name || name === ""){
    message = "Dish must include a name."
  }
  else if(!description || description === ""){
    message = "Dish must include a description."
  }
  else if(!price){
    message = "Dish must include a price."
  }
  else if(price <= 0 || !Number.isInteger(price)){
    message = "Dish price must be a whole number greater than zero."
  }
  else if(!image_url || image_url === ""){
    message = "Dish must include an image_url."
  }

  if(message){
    return next({
      status: 400,
      message: message,
    })
  }

  next();
}

function validateMatchingId(req, res, next){
  const {dishId} = req.params;
  const {data: {id} = {}} = req.body;

  if(!id || id === dishId){
    res.locals.dishId = dishId;
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
  })
}

function read (req, res, next){
  res.json({ data: res.locals.dish });
};

function create(req, res, next){
  const {data: {name, description, price, image_url} = {}} = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  }
  dishes.push(newDish);
  res.status(201).json({data: newDish})
}

function update(req, res) {
	const { data: { name, description, price, image_url } = {} } = req.body;

	res.locals.dish = {
		id: res.locals.dishId,
		name,
		description,
		price,
		image_url,
	};

	res.status(200).json({ data: res.locals.dish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [validateDishBody, create],
  update: [dishExists, validateDishBody, validateMatchingId, update],
};
