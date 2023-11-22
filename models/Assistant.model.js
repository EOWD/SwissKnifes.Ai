const { Schema, model } = require("mongoose");

const assistantSchema = new Schema(
  {
    assistantId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    model: {
      type: String,
      required: true,
    },
    description: {
      type: String
    },
    instructions: {
      type: String,
      required: true
    },
    file_ids: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Assistant = model("Assistant", assistantSchema);

module.exports = Assistant;
