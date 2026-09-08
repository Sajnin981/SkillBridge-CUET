const express = require("express");
const { protect, restrict, requireApproved } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const controller = require("../controllers/post/post.controller");

const router = express.Router();

router.use(protect, restrict("student", "company"), requireApproved);

router.get("/", controller.listPosts);
router.post("/", upload.single("postImage"), controller.createPost);
router.delete("/:id", controller.deletePost);
router.post("/:id/like", controller.likePost);
router.delete("/:id/like", controller.unlikePost);
router.get("/:id/comments", controller.listComments);
router.post("/:id/comments", controller.addComment);

module.exports = router;
