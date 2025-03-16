const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const articleRoutes = require("./routes/article");
const likedislikeRoutes = require("./routes/likedislike");
const questionsRoutes = require("./routes/questions");
const answerRoutes = require("./routes/answer");
const usefulAnswerRoutes = require("./routes/usefulAnswers");
const reviewsRoutes = require("./routes/review");
app.use(
  cors({
    origin: "*", // Change this to 'http://localhost:3000' for more security
    methods: "GET,POST,OPTIONS,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Allow preflight requests (OPTIONS)
app.options("*", cors());
dotenv.config();
app.use(express.static("public"));
const PORT = process.env.PORT;
// const server = http.createServer(app)

app.use(bodyParser.json());
// app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));

if (!fs.existsSync("./public/uploads")) {
  fs.mkdirSync("./public/uploads", { recursive: true });
}

// parse application/json
require("./database/databaseConfig");
app.use("/api", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/article", articleRoutes);
app.use("/api/likedislike", likedislikeRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/usefulAnswer", usefulAnswerRoutes);
app.use("/api/reviews", reviewsRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
