const nodemailer = require("nodemailer");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

const users = {}; // Store users and their OTPs

app.get("/", (req, res) => {
  res.render("login.ejs");
});

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000); // Generate random 4-digit number
}

app.post("/afteremail", (req, res) => {
  const user_name = req.body.username;
  const otp = generateOTP();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yugcuspc@gmail.com",
      pass: "nefznrqeinygslwy",
    },
  });

  const mailOptions = {
    from: "yugcuspc@gmail.com",
    to: user_name,
    subject: "Your OTP for login",
    text: `Your OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending OTP");
    } else {
      console.log("Email sent: " + info.response);
      users[user_name] = otp; // Store the OTP for verification
      res.render("otp.ejs", { username: user_name });
    }
  });
});

app.post("/verifyotp", (req, res) => {
  const user_name = req.body.username;
  const otp = req.body.otp;

  if (otp.toString() === users[user_name].toString()) {
    // First OTP Correct, send second OTP
    const secondOtp = generateOTP();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yugcuspc@gmail.com",
        pass: "nefznrqeinygslwy",
      },
    });

    const mailOptions = {
      from: "yugcuspc@gmail.com",
      to: user_name,
      subject: "Your Second OTP for login",
      text: `Your Second OTP is ${secondOtp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).send("Error sending OTP");
      } else {
        console.log("Second Email sent: " + info.response);
        users[user_name] = secondOtp; // Update OTP for verification
        res.render("secondotp.ejs", { username: user_name });
      }
    });
  } else {
    // Wrong OTP
    res.send("<script>alert('OTP is wrong'); window.location='/';</script>");
  }
});

app.post("/verifysecondotp", (req, res) => {
  const user_name = req.body.username;
  const otp = req.body.otp;

  if (otp.toString() === users[user_name].toString()) {
    // Correct OTP
    res.render("dashboard.ejs", { username: user_name });
  } else {
    // Wrong OTP
    res.send(
      "<script>alert('Wrong Second OTP'); window.location='/';</script>"
    );
  }
});

app.listen(9000, () => {
  console.log(`Server is listening at 9000`);
});
