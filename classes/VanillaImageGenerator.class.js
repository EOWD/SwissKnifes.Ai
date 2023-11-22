const OpenAI = require("openai");
const fs = require('fs')
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
class dall {
    constructor({ prompt, model, num, quality, size, style, user }) {
        this.prompt = prompt;
        this.model = model;
        this.num = num;
        this.quality = quality;
        this.size = size;
        this.style = style;
        this.user = user;

}

async generate(){
    const response = await openai.images.generate({
        prompt: this.prompt,
        model: this.model,
        n: this.num,
        quality: this.quality,
        response_format: 'b64_json',
        size: this.size,
        style: this.style,
        user: this.user,
        
}) 
return response
}

async variationGenerate(reference){
    const response = await openai.images.createVariation({
        image: fs.createReadStream(reference),
        prompt: this.prompt,
        model: this.model,
        n: this.num,
        quality: this.quality,
        response_format: 'url',
        size: this.size,
        style: this.style,
        user: this.user,
}) 
}


}
    
module.exports = dall;