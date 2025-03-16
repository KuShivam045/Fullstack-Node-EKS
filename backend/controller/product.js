const { Product, Category, Review, User } = require("../models");

async function create(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const formData = req?.body;
    if (!formData?.title || !formData?.price) {
      return res.status(400).json({
        error: true,
        message: "Required Fields are : Title, Price",
      });
    }
    const response = await Product.create(formData);
    if (response) {
      return res.status(201).json({
        status: true,
        message: "Product added successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function allProducts(req, res) {
  try {
    const response = await Product.findAll({
      include: { model: Category, attributes: ["name"] },
      include: {
        model: Review,
        attributes: ["rate", "reviews"],
        include: { model: User, attributes: ["firstName", "lastName"] },
      },
    });

    return res.status(200).json({
      message: "Product fetched successfully.",
      data: response,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const response = await Product.findOne({ where: { id } });
    if (response) {
      return res.status(200).json({
        message: "Product fetched successfully",
        data: response,
      });
    } else {
      return res.status(200).json({
        message: "Product found with given Id",
        data: response,
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function updateProduct(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const { id } = req.params;
    const formData = req.body;

    const response = await Product.update(formData, { where: { id } });
  
    if (response[0] == 0) {
      return res.status(201).json({
        message: "Product not found",
      });
    }
    if (response) {
      return res.status(200).json({
        message: "Product Updated Successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function deleteProduct(req, res) {
  try {
    if (req?.user == "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const { id } = req.params;
    const response = await Product.destroy({ where: { id } });

    if (response === 0) {
      return res.status(201).json({
        message: "Product not found",
      });
    } else {
      return res.status(200).json({
        message: "Product Deleted Successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  create,
  allProducts,
  getById,
  updateProduct,
  deleteProduct,
};
