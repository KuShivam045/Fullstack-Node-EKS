const { Article, User, Likedislike, Image } = require("../models");
const fs = require("fs");
const path = require("node:path");

async function getAll(req, res) {
  try {
    const response = await Article.findAll({
      include: [
        {
          model: Likedislike,
          attributes: ["like", "dislike"],
          include: [
            {
              model: User, // Include user details (if needed)
              attributes: ["id", "firstName"], // Example: Include only id and username
            },
          ],
        },

        {
          model: Image,
          attributes: ["id", "image_name"],
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
    const response = await Article.findOne({
      where: { id },
      include: [
        {
          model: Likedislike,
          attribute: ["like", "dislike"],
          include: [
            {
              model: User, // Include user details (if needed)
              attributes: ["id", "firstName"], // Example: Include only id and username
            },
          ],
        },
      ],
    });
    if (response) {
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function create(req, res) {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const formData = req?.body;
    const file = req?.files;

    formData.createdBy = req?.user?.id;
    const response = await Article.create(formData);
    if (file.length > 0 && response?.id) {
      file.forEach(async (item) => {
        await Image.create({
          image_name: item?.filename,
          article_id: response?.id,
        });
      });
    }

    return res.status(201).json({
      status: true,
      message: "Article created successfully.",
      // data: response,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }
    const { id } = req?.params;
    const formData = req?.body;
    const files = req.files;
    const response = await Article.update(formData, { where: { id } });
    if (files && files.length > 0) {
      // **2b. Save new images**
      const newImages = files.map((file) => ({
        image_name: file.filename,
        article_id: id,
      }));

      await Image.bulkCreate(newImages, {});
    }
    return res.status(200).json({
      message: "Article Updated Successfully.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function deleteArticle(req, res) {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const { id } = req?.params;
    const existingImages = await Image.findAll({ where: { article_id: id } });

    existingImages.forEach(async (image) => {
      const imagePath = path.join(
        __dirname,
        "../public/uploads",
        path.basename(image.image_name)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete file from disk
      }
      await Image.destroy({ where: { id: id } }); // Delete from DB
    });

    const response = await Article.destroy({ where: { id } });

    if (response > 0) {
      return res.status(200).json({
        message: "Article deleted successfully.",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Passed Article id is not found or deleted before.",
      });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function deleteArticleImage(req, res) {
  try {
    const formdata = req?.body;
    const existingImages = await Image.findOne({ where: { id: formdata?.id } });

    if (!existingImages) {
      return res.status(404).json({
        status: false,
        message: "Image not found.",
      });
    }

    const imagePath = path.join(
      __dirname,
      "../public/uploads",
      existingImages.image_name
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete file from disk
    }
    await Image.destroy({ where: { id: existingImages.id } }); // Delete from DB

    return res.status(200).json({
      status: true,
      message: "Images deleted.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}
module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteArticle,
  deleteArticleImage,
};
