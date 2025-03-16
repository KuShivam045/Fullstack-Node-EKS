const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { UserfulAnswer, User, Answers } = require("../models");

async function create(req, res) {
  try {
    if (req?.user?.role !== "user") {
      return res.status(401).json({
        error: true,
        message: "Unauthorised Role! You are not allowed to this route",
      });
    }

    const formData = req?.body;
    const response = await UserfulAnswer.findOne({
      where: {
        user_id: req?.user?.id,
        answer_id: formData?.answer_id,
      },
    });
    if (response) {
      const data = await UserfulAnswer.update(formData, {
        where: {
          user_id: req?.user?.id,
          answer_id: formData?.answer_id,
        },
      });
      return res.status(200).json(data);
    } else {
      formData.user_id = req?.user?.id;
      const data = await UserfulAnswer.create(formData);
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function getAll(req, res) {
  try {
    const response = await UserfulAnswer.findAll({
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: Answers,
          attributes: ["content"],
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
    const response = await UserfulAnswer.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: Answers,
          attributes: ["content"],
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
    const response = await UserfulAnswer.destroy({ where: { id } });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
}

const APP_ID = "8c9812a61314467196175a0c11804572";
const APP_CERTIFICATE = "5f01d227e45244f1995240d62b3a4761";
const EXPIRATION_TIME_IN_SECONDS = 3600; 

async function generateTokenAgora(req, res) {
  try {
     
      // const channelName = "newChannel"; 
      // const userId = "1234";

      // const currentTimestamp = Math.floor(Date.now() / 1000);
      // const privilegeExpireTime = 5*60000;

      // const token = RtcTokenBuilder.buildTokenWithUid(
      //     APP_ID,
      //     APP_CERTIFICATE,
      //     channelName, 
      //     userId,
      //     RtcRole.PUBLISHER, 
      //     privilegeExpireTime
      // );

      // res.json({ token });
      const { channelName, uid } = req.body;

      if (!channelName) {
          return res.status(400).json({ error: "Channel name is required" });
      }
  
      const role = RtcRole.PUBLISHER;
      const expireTimeInSeconds = 300; // 5 minutes
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpireTs = currentTimestamp + expireTimeInSeconds;
  
      const token = RtcTokenBuilder.buildTokenWithUid(
          APP_ID,
          APP_CERTIFICATE,
          channelName,
          uid || 0, // Default UID 0
          role,
          privilegeExpireTs
      );
  
      res.json({ token, uid: uid || 0 });
  } catch (error) {
      console.error("Error generating Agora token:", error);
      res.status(500).json({ error: "Failed to generate token" });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  destroy,
  generateTokenAgora
};
