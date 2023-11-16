const { Schema, model } = require("mongoose");

const threadSchema = new Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true
    },
    assistantId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  },
  {
    timestamps: true
  }
);

const Thread = model("Thread", threadSchema);

module.exports = Thread;
