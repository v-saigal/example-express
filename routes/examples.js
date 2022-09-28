const express = require("express");
const router = express.Router();

const ExampleController = require("../controllers/examples");
router.post("/", ExampleController.Create);
router.get("/", ExampleController.Index);
router.get("/new", ExampleController.New);


module.exports = router;
