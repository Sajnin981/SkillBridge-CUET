const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, required: true, refPath: "authorModel", index: true },
    authorModel: { type: String, required: true, enum: ["Student", "Company"] },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    imageUrl: { type: String, default: "" },
    likes: [
      {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "likes.userModel" },
        userModel: { type: String, required: true, enum: ["Student", "Company"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "comments.userModel" },
        userModel: { type: String, required: true, enum: ["Student", "Company"] },
        text: { type: String, required: true, trim: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
