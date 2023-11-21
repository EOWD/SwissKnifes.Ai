const openai = require('openai');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs');

class File {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.openaiApi = new openai.OpenAI();
  }

  async uploadFile(file, purpose) {
    const file = await this.openaiApi.files.create({
      file: fs.createReadStream(file),
      purpose: purpose,
    });
  
    return file;
  }

}

module.exports = File;