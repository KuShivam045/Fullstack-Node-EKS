const { User } = require("../models");
const bcrypt = require("bcrypt");
const VALID_ROLES = ["superAdmin", "admin", "user"];
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { where } = require("sequelize");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "31604cb3d26ffe",
    pass: "be7695d1113d19",
  },
});

async function getAllUsers(req, res) {
  try {
    const users = await User.findAll();
    if (users.length > 0) {
      return res.status(200).json({ users });
    } else {
      return res.status(201).json({ message: "No users in table!" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
}

async function getUsersByRole(req, res) {
  try {
    const { role } = req.body;

    // Validate role against the allowed values
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Valid roles are: ${VALID_ROLES.join(", ")}`,
      });
    }
    const users = await User.findAll({ where: { role: role } });
    if (users.length == 0) {
      return res
        .status(201)
        .json({ message: "No users in the table with this role!" });
    }
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

async function registerUser(req, res) {
  try {
    const formdata = req?.body;
    if (!formdata?.firstName || !formdata?.email || !formdata?.password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required: first Name, email, and password.",
      });
    }
    const existingUser = await User.findOne({
      where: { email: formdata?.email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email already exists. Please choose another email.",
      });
    }
    const hash = bcrypt.hashSync(formdata.password, 12);
    formdata.password = hash;
    const response = await User.create(formdata);

    if (response) {
      return await res.status(200).json({ message: "User added in database." });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function login(req, res) {
  try {
    const formdata = req?.body;
    const user = await User.findOne({
      where: { role: formdata?.role, email: formdata?.email },
    });

    if (!user) {
      return res.status(404).json({ message: "Email not registered." });
    } else {
      const hash = bcrypt.compareSync(formdata.password, user?.password);

      if (hash) {
        const token = jwt.sign(
          {
            id: user?.id,
            role: user?.role,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: 3 * 60 * 60,
          }
        );
        return res.status(200).json({
          message: `${user?.role} logged in successfully`,
          token,
        });
      } else {
        return res.status(404).json({ message: "Invalid credentials.", error });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error });
  }
}

async function details(req, res) {
  try {
    if (req.user) {
      const userDetails = await User.findOne({
        where: { id: req?.user?.id, role: req?.user?.role },
        attributes: ["firstName", "lastName", "email", "role"],
      });
      return res
        .status(200)
        .json({ message: "Token Verified Successfully!", user: userDetails });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error });
  }
}

async function forgetPassword(req, res) {
  try {
    const { email } = req?.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    const mailDetails = {
      from: "jtplartisan@gmail.com",
      to: email,
      subject: "Forget password OTP",
      text: "You have recieved OTP from codeChef.",
      html: `<h3>${otp}</h3>`,
    };

    transporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log("Error Occurs", err);
      } else {
        console.log(data);
        return res
          .status(200)
          .json({ message: "OTP sent successfully on email." });
      }
    });
    const user = await User.findOne({ where: { email } });
    if (user) {
      const response = await User.update(
        { otp: otp.toString() },
        {
          where: { email },
        }
      );
      return res.status(200).json({ message: `OTP sent on mail` });
    } else {
      return res
        .status(401)
        .json({ message: `Entered mail is not in our database.` });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req?.body;
    const user = await User.findOne({ where: { email, otp } });
    if (user) {
      return res.status(200).json({ message: `OTP verified.` });
    } else {
      return res
        .status(401)
        .json({ message: `Wrong OTP or OTP not verified!` });
    }
  } catch {
    return res.status(500).json({ message: "An error occurred.", error });
  }
}

module.exports = {
  getAllUsers,
  getUsersByRole,
  registerUser,
  login,
  details,
  forgetPassword,
  verifyOTP,
};
