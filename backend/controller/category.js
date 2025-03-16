const { Category } = require("../models");

async function create(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is required for Category.",
      });
    }
    const response = await Category.create({ name: name });
    if (response) {
      return res.status(200).json({
        message: "Category created successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getAll(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const response = await Category.findAll();
    return res.status(200).json({
      message: "Categories fetched successfully.",
      data: response,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getbyId(req, res) {
  try {
    const { id } = req.params;
    const response = await Category.findOne({ where: { id } });
    if (response) {
      return res.status(200).json({
        message: "Category fetched successfully",
        data: response,
      });
    } else {
      return res.status(200).json({
        message: "Category found with given Id",
        data: response,
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const { id } = req.params;
    const name = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is required for Category.",
      });
    }
    const response = await Category.update({ name: name }, { where: { id } });
    if (response) {
      return res.status(200).json({
        message: "Category Updated successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function deleteCat(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const { id } = req.params;

    const response = await Category.destroy({ where: { id } });
    if (response === 0) {
      return res.status(201).json({
        message: "Category not found",
      });
    } else {
      return res.status(200).json({
        message: "Category Deleted Successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = { create, getAll, getbyId, update, deleteCat };
