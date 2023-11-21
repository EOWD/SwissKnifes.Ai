
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
class Chat {
    constructor(prompt,innovation,system) {
this.prompt = prompt;
this.innovation=innovation;
this.system=system;  


}

async generate() {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Your name is Drive ",
          },
          { role: "user", content: this.prompt },
        ],
        temperature: this.innovation,
        max_tokens: 500,
      })
    return response.choices[0].message.content;
  }

}
    
module.exports = Chat;

























