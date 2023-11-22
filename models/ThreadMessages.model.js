const { Schema, model } = require("mongoose");

const threadMessagesSchema = new Schema(
  {
    thread_db_reference_id: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
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
