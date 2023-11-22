const OpenAI = require("openai");
const fs = require('fs')
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
class Vision {
    constructor(prompt,image) {
this.prompt = prompt;
this.image=image
     

}

async generate() {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: this.prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${this.image}`  }},
          ],
        },
      ],
      "max_tokens": 300
    });
    return response;
  }

}
    
module.exports = Vision;