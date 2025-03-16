const { Answers, User, Questions, UserfulAnswer } = require("../models");

async function create(req, res) {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const formData = req?.body;
    formData.user_id = req?.user?.id;
    const response = await Answers.create(formData);
    return res.status(201).json({
      status: true,
      message: "Answer added for question.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function get(req, res) {
  try {
    const response = await Answers.findAll({
      include: [
        { model: Questions, attributes: ["title"] },
        { model: User, attributes: ["firstName"] },
        { model: UserfulAnswer, attributes: ["like","unlike"] },
      ],
    });
    return res.status(200).json({
      status: true,
      message: "Answers fetched successfully.",
      data: response,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getById(req, res) {
  try {
    const { id } = req?.params;
    const response = await Answers.findOne({ where: { id } });
    return res.status(200).json({
      status: true,
      message: "Record fetched successfully.",
      data: response,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    const { id } = req?.params;
    if (id != req?.user?.id) {
      return res.status(401).json({
        error: true,
        message: "Unauthorised! You are not allowed to update this record.",
      });
    }

    const formData = req?.body;
    const response = await Answers.update(formData, { where: { id } });
    if (response[0] === 0) {
      return res.status(200).json({
        status: true,
        message: "Record not found in table.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Record updated successfully.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function destroy(req, res) {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const { id } = req?.params;

    const response = await Answers.destroy({ where: { id } });
    if (response === 0) {
      return res.status(404).json({
        message: "Record not found in the table.",
        status: false,
      });
    }
    return res.status(200).json({
      message: "Record deleted successfully.",
      status: true,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}
module.exports = {
  create,
  get,
  getById,
  update,
  destroy,
};
