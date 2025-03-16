const { Article, User, Likedislike } = require("../models");

async function create(req, res) {
  try {
    if (req?.user?.role !== "user") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const formData = req?.body;
    const response = await Likedislike.findOne({
      where: {
        user_id: req?.user?.id,
        article_id: formData?.article_id,
      },
    });
    if (response) {
      const data = await Likedislike.update(formData, {
        where: {
          user_id: req?.user?.id,
          article_id: formData?.article_id,
        },
      });
      return res.status(200).json(data);
    } else {
      formData.user_id = req?.user?.id;
      const data = await Likedislike.create(formData);
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getAll(req, res) {
  try {
    const response = await Likedislike.findAll({
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: Article,
          attributes: ["title"],
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
    const response = await Likedislike.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: Article,
          attributes: ["title"],
        },
      ],
    });
    return res.status(200).json(response);
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
    const response = await Likedislike.destroy({ where: { id } });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  destroy,
};
