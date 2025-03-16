const router = require("express").Router();
const controller = require("../controller/category");
const { authenticateToken } = require("../middlewares/auth");

router.post("/create", authenticateToken, controller.create);
router.get("/get", authenticateToken, controller.getAll);
router.get("/:id", authenticateToken, controller.getbyId);
router.put("/:id", authenticateToken, controller.update);
router.delete("/:id", authenticateToken, controller.deleteCat);

module.exports = router;
