const openai = require('openai');
const fs = require('fs');

class File {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.openaiApi = new openai.OpenAI();
  }

  async uploadFile(file, purpose) {

    const fileUpload = await this.openaiApi.files.create({
      file: fs.createReadStream(file),
      purpose: purpose,
    });
    return fileUpload;
  }

  async getAllFiles() {
    const list = await this.openaiApi.files.list();
  
    for await (const file of list) {
      console.log(file);
    }
  }

  async deleteFile(fileId) {
    const file = await this.openaiApi.files.del(fileId);
  
    return file;
  }

}

module.exports = File;