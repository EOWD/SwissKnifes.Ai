const { Schema, model } = require("mongoose");


const knifeDriveSchema = new Schema(
  {
    userId: {
      type: String,
      
      
    },
 
    dall: [
      {
        type: Schema.Types.ObjectId,
        ref: "ImageData",
      },
    ],
    
    vision: [
      {
        type: Schema.Types.ObjectId,
        ref: "",
      },
    ],
    chatbot: [
        {
          type: Schema.Types.ObjectId,
          ref: "",
        },
      ],
      dallEdite: [
        {
          type: Schema.Types.ObjectId,
          ref: "",
        },
      ],
      textToSpeech: [
        {
          type: Schema.Types.ObjectId,
          ref: "",
        },
      ],
    
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const knifeDrive = model("knifeDrive", knifeDriveSchema);

module.exports = knifeDrive;