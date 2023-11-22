const { Schema, model } = require("mongoose");


const imgEditeSchema = new Schema(
  {
    userId: {
      type: String,
      
      
    },
    prompt: {
      type: String,
      
      
    },
    imageData: {
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

const ImageEdit = model("ImageEdit", imgEditeSchema);

module.exports = ImageEdit;