const openai = require('openai'); // Ensure the 'openai' package is installed
const fs = require('fs');
const Assistant = require("../models/Assistant.model.js");
const Thread = require("../models/Thread.model.js");

class VanillaAssistant {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.threadId = null;
    this.openaiApi = new openai.OpenAI(); // Initialize the OpenAI API with the apiKey
    this.model = 'gpt-4-1106-preview'
  }

  async createAssistant(assistantName, description, instructions, tools, model) {
    try {
      // Create the assistant with all available tools
      const response = await this.openaiApi.beta.assistants.create({
        name: assistantName,
        description: description,
        instructions: instructions,
        tools: tools,
        model: model,
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error creating assistant:', error);
    }
  }

  //Listing the assistants that OpenAi has in its DB
  async listOpenaiAssistants() {
    const myAssistants = await this.openaiApi.beta.assistants.list({
      order: "desc",
      limit: "20",
    });
  
    return myAssistants.data;
  }

  async deleteAssistant(id) {
    const response = await this.openaiApi.beta.assistants.del(id);
    
    return(response)
  }
    
  
  async uploadFile(filePath) {
    try {
      // Read and upload the file content
      const fileData = fs.readFileSync(filePath);
      const fileContent = fileData.toString('base64');
      
      // Add file content to the conversation
      await this.openaiApi.files.upload({
        purpose: 'answers', // Change purpose as needed
        file: fileContent,
      });
      console.log('File uploaded:', filePath);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  async retrieveAssistant(assistantId) {
    const myAssistant = await this.openaiApi.beta.assistants.retrieve(
      assistantId
    );
  
    return myAssistant;
  }


  // DB FUNCTIONS
  
  async listAssistants() {
    return await Assistant.find();
  }
}

module.exports = VanillaAssistant;