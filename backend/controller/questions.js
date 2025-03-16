const {
  Questions,
  User,
  Answers,
  sequelize,
  UserfulAnswer,
} = require("../models");

async function create(req, res) {
  try {
    if (req?.user?.role !== "user") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const formData = req?.body;
    formData.user_id = req?.user?.id;
    const response = await Questions.create(formData);
    return res.status(201).json({
      status: true,
      message: "Question added successfully.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function get(req, res) {
  try {
    const response = await Questions.findAll({
      raw: true,
      nest: true,
      order: [["id", "ASC"]],
      attributes: ["title", "details"],
      include: [
        { model: User, attributes: ["firstName"] },
        {
          model: Answers,
          attributes: ["content"],
          include: { model: UserfulAnswer, attributes: ["like", "unlike"] },
        },
      ],
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getById(req, res) {
  try {
    const { id } = req?.params;
    const response = await Questions.findOne({
      where: { id },
      raw: true,
      attributes: ["title", "details"],
      include: [
        { model: User, attributes: ["firstName"] },
        { model: Answers, attributes: ["content"] },
      ],
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    const { id } = req?.params;
    const formData = req?.body;
    const response = await Questions.update(formData, { where: { id } });

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
    const { id } = req?.params;
    const response = await Questions.destroy({ where: { id } });

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

async function uploadFile(req, res) {
  const formdata = req.file;
  res.status(200).json(formdata);
}

module.exports = {
  create,
  get,
  getById,
  update,
  destroy,
  uploadFile,
};
