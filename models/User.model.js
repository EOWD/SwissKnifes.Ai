const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    password: {
      type: String,
      required: true,
    },
 

    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "ImageData",
      },
    ],
    voiceMemo: [
      {
        type: Schema.Types.ObjectId,
        ref: "Voice",
      },
    ],
    visions: [
      {
        type: Schema.Types.ObjectId,
        ref: "VElement",
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
