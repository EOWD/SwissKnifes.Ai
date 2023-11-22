const { Schema, model } = require("mongoose");


const textToSpeechSchema = new Schema(
  {
    userId: {
      type: String,
      
      
    },
    prompt: {
      type: String,
      
      
    },
    audioData: {
      type: String,
      
    },
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Voice = model("Voice", textToSpeechSchema);

module.exports = Voice;