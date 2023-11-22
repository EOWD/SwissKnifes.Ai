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
        model: 'tts-1',
        voice: 'alloy',
        text: text,
    });
    return response;
  }

}
    
module.exports = Vision;