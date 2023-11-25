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

  async createAssistant(assistantName, description, instructions, tools, model, fileIds) {
    try {
      // Create the assistant with all available tools
      const response = await this.openaiApi.beta.assistants.create({
        name: assistantName,
        description: description,
        instructions: instructions,
        tools: tools,
        model: model,
        file_ids: fileIds
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error creating assistant:', error);
    }
  }

  //Listing the assistants that OpenAi has in its DB d
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

  async retrieveAssistant(assistantId) {
    const myAssistant = await this.openaiApi.beta.assistants.retrieve(
      assistantId
    );
  
    return myAssistant;
  }

  async modifyAssistant(assistantId, name, description, instructions, model) {
    const myUpdatedAssistant = await this.openaiApi.beta.assistants.update(
      assistantId,
      {
        name: name,
        description: description,
        instructions: instructions,
        model: model
      }
    );
  
    return myUpdatedAssistant;
  }


  // DB FUNCTIONS
  
  async listAssistants() {
    return await Assistant.find();
  }
}

module.exports = VanillaAssistant;