const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: dishes });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.dish });
};

// const update = (req, res, next) => {

// }

function dishExists(req, res,next){
    const foundDish = dishes.find(
        (dish) => dish.id === Number(req.params.dishId)
      );

      if (!dish) {
        next({
          status: 404,
          message: "Dish not found",
        });
      }

    res.locals.dish = foundDish
      next();
}

function dishHasRequiredFields(req, res, next){
    const requiredFields = ["name", "description", "image_url", "price"];
const {data = {}} = req.body;
for(const field of requiredFields){
if(!data[field]){
    return next({
status: 400,
message: `Field ${field} is required!`
    });
}
}
next();
}

module.exports = {
  list,
  read: [dishHasRequiredFields, dishExists, read],

};
