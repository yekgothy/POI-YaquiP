const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
  },
  { timestamps: true }
);

// Index for efficient queries by channel + time
messageSchema.index({ channel: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
