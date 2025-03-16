const { where } = require("sequelize");
const { Review } = require("../models");

async function get(req, res) {
  try {
    const response = await Review.findAll();
    return res.status(200).json({
      message: "Reviews fetched successfully.",
      data: response,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getById(req, res) {
  try {
    const { id } = req?.params;
    const response = await Review.findOne({ where: { id } });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function create(req, res) {
  try {
    if (req?.user?.role !== "user") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const id = req?.user?.id;
    const formData = req?.body;
    formData.user_id = id;
    const data = await Review.findOne({
      where: {
        user_id: req?.user?.id,
        product_id: formData?.product_id,
      },
    });
    if (data) {
      const response = await Review.update(formData, {
        where: {
          user_id: req?.user?.id,
          product_id: formData?.product_id,
        },
      });
      return res.status(201).json({
        status: true,
        message: "Review updated successfully.",
      });
    }
    const response = await Review.create(formData);
    return res.status(201).json({
      status: true,
      message: "Review added successfully.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    const { id } = req?.params;
    const formData = req?.body;
    const response = Review.update(formData, { where: { id } });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function destroy(req, res) {
  try {
    const { id } = req?.params;
    const response = await Review.destroy({ where: { id } });
    res.status(200).json({
      status: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  get,
  getById,
  create,
  destroy,
  update,
};
