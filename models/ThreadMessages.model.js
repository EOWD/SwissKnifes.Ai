const { Schema, model } = require("mongoose");

const threadMessagesSchema = new Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true
    },
    thread_db_reference_id: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      required: true
    },
    message: {
      type: String,
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

const threadMessages = model("threadMessages", threadMessagesSchema);

module.exports = threadMessages;
