const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const verifyToken = require("../middleware/auth");

// @route GET api/posts
// @desc GET Post
// @access private
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate("user", [
      "username",
    ]);
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// @route POST api/posts
// @desc Create Post
// @access private
router.post("/", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  // Simple validate
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      status: status || "TO LEARN",
      user: req.userId,
    });
    await newPost.save();

    res.json({ success: true, message: "Happy learning!", post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// @route PUT api/posts
// @desc Update Post
// @access private
router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  // Simple validate
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  try {
    let updatedPost = {
      title,
      description: description || "",
      url: (url.startsWith("https://") ? url : `https://${url}`) || "",
      status: status || "TO LEARN",
    };

    const postUpdateCondition = { _id: req.params.id, user: req.userId };
    console.log(req.params.id);
    console.log(req.userId);

    updatedPost = await Post.findOneAndUpdate(
      postUpdateCondition,
      updatedPost,
      { new: true }
    );

    // User not authorised to update post or post not found
    if (!updatedPost) {
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });
    }

    res.json({
      success: true,
      message: "Excellent progress!",
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// @route DELETE api/posts
// @desc Delete Post
// @access private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletedPost = await Post.findOneAndDelete(postDeleteCondition);

    // User not authorised to update post or post not found
    if (!deletedPost) {
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });
    }

    res.json({
      success: true,
      post: deletedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
