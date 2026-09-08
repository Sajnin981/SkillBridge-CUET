const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Post = require("../../models/Post");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const createNotification = require("../../utils/createNotification");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

function actorModelFromRole(role) {
  return role === "student" ? "Student" : "Company";
}

function isPostOwner(post, userId, userRole) {
  return post.author.equals(userId) && post.authorModel === actorModelFromRole(userRole);
}

function removeUploadedFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const relative = fileUrl.replace("/uploads/", "");
  const absolute = path.join(UPLOAD_ROOT, relative);
  if (!absolute.startsWith(UPLOAD_ROOT)) return;
  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

function profileLinkForOwner(post) {
  if (post.authorModel === "Student") return `/student/profile?postId=${post._id}`;
  return `/company/profile?postId=${post._id}`;
}

exports.createPost = async (req, res, next) => {
  try {
    const content = String(req.body.content || "").trim();
    if (!content) return next(new AppError("Post content is required.", 422));

    const imageFile = req.file;
    const post = await Post.create({
      author: req.user._id,
      authorModel: actorModelFromRole(req.userRole),
      content,
      imageUrl: imageFile ? `/uploads/post-images/${imageFile.filename}` : "",
    });

    return success(res, {
      statusCode: 201,
      message: "Post created",
      data: { post },
    });
  } catch (err) {
    next(err);
  }
};

exports.listPosts = async (req, res, next) => {
  try {
    const { authorId, authorType, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (authorId) {
      if (!mongoose.isValidObjectId(authorId)) {
        return next(new AppError("Invalid author ID.", 400));
      }
      filter.author = authorId;
    }
    if (authorType) {
      if (!["student", "company"].includes(String(authorType))) {
        return next(new AppError("authorType must be student or company.", 400));
      }
      filter.authorModel = String(authorType) === "student" ? "Student" : "Company";
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "fullName avatarUrl companyName logoUrl")
        .populate("comments.user", "fullName avatarUrl companyName logoUrl")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ]);

    return success(res, {
      message: "Posts",
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid post ID.", 400));
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found.", 404));

    if (!isPostOwner(post, req.user._id, req.userRole)) {
      return next(new AppError("You can delete only your own posts.", 403));
    }

    if (post.imageUrl) removeUploadedFile(post.imageUrl);

    await post.deleteOne();
    return success(res, { message: "Post deleted", data: {} });
  } catch (err) {
    next(err);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid post ID.", 400));
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found.", 404));

    const userModel = actorModelFromRole(req.userRole);
    const exists = post.likes.some((like) => like.user.equals(req.user._id) && like.userModel === userModel);
    if (!exists) {
      post.likes.push({ user: req.user._id, userModel });
      await post.save();

      if (!post.author.equals(req.user._id) || post.authorModel !== userModel) {
        try {
          await createNotification({
            recipient: post.author,
            recipientModel: post.authorModel,
            actor: req.user._id,
            actorModel: userModel,
            title: "New like on your post",
            body: `${req.user.fullName || req.user.companyName} liked your post.`,
            type: "post-like",
            postId: post._id,
            link: profileLinkForOwner(post),
          });
        } catch {
          // Keep interaction responsive even if notification persistence fails.
        }
      }
    }

    return success(res, {
      message: "Post liked",
      data: { likes: post.likes.length },
    });
  } catch (err) {
    next(err);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid post ID.", 400));
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found.", 404));

    const userModel = actorModelFromRole(req.userRole);
    post.likes = post.likes.filter((like) => !(like.user.equals(req.user._id) && like.userModel === userModel));
    await post.save();

    return success(res, {
      message: "Post unliked",
      data: { likes: post.likes.length },
    });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid post ID.", 400));
    const text = String(req.body.text || "").trim();
    if (!text) return next(new AppError("Comment text is required.", 422));

    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found.", 404));

    post.comments.push({
      user: req.user._id,
      userModel: actorModelFromRole(req.userRole),
      text,
    });
    await post.save();

    const userModel = actorModelFromRole(req.userRole);
    if (!post.author.equals(req.user._id) || post.authorModel !== userModel) {
      try {
        await createNotification({
          recipient: post.author,
          recipientModel: post.authorModel,
          actor: req.user._id,
          actorModel: userModel,
          title: "New comment on your post",
          body: `${req.user.fullName || req.user.companyName} commented on your post.`,
          type: "post-comment",
          postId: post._id,
          link: profileLinkForOwner(post),
        });
      } catch {
        // Keep interaction responsive even if notification persistence fails.
      }
    }

    const comment = post.comments[post.comments.length - 1];
    return success(res, {
      statusCode: 201,
      message: "Comment added",
      data: { comment },
    });
  } catch (err) {
    next(err);
  }
};

exports.listComments = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid post ID.", 400));
    const post = await Post.findById(req.params.id).populate("comments.user", "fullName avatarUrl companyName logoUrl");
    if (!post) return next(new AppError("Post not found.", 404));

    return success(res, {
      message: "Comments",
      data: { items: post.comments },
    });
  } catch (err) {
    next(err);
  }
};
