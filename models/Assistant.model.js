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
    instruction: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Assistant = model("Assistant", assistantSchema);

module.exports = Assistant;
