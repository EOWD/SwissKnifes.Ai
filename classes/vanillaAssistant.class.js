const openai = require('openai'); // Ensure the 'openai' package is installed
const fs = require('fs');

class VanillaAssistant {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.threadId = null;
    this.openaiApi = new openai.OpenAI(); // Initialize the OpenAI API with the apiKey
    this.model = 'gpt-4-1106-preview'
  }

  async createAssistant() {
    try {
      // Create the assistant with all available tools
      const response = await this.openaiApi.beta.assistants.create({
        name: 'Helpful AI Assistant',
        instructions: 'You are a helpful AI Assistant ready to help with any task.',
        tools: [
          { type: 'code_interpreter' },
          { type: 'retrieval' },
          // Add other tools here as they become available and supported by OpenAI
        ],
        model: this.model,
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error creating assistant:', error);
    }
  }

  async listAssistants() {
    const myAssistants = await this.openaiApi.beta.assistants.list({
      order: "desc",
      limit: "100",
    });
    return myAssistants.data;
  }

  async deleteAssistant(id) {
    const response = await this.openaiApi.beta.assistants.del(id);
  
    return(response)
  }

  async createThread() {
    try {
      // Create a Thread for the conversation
      const response = await this.openaiApi.threads.create();
      this.threadId = response.data.id;
      console.log('Thread created with ID:', this.threadId);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
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

  async createMessage(userInput) {
    try {
      // Continue the conversation by adding user's questions or instructions
      const response = await this.openaiApi.threads.createMessage(this.threadId, {
        role: 'user',
        content: userInput,
      });
      console.log('Create Message with input:', userInput);
    } catch (error) {
      console.error('Error continuing conversation:', error);
    }
  }

  async getResponse() {
    try {
      // Get responses based on the conversation
      const response = await this.openaiApi.threads.retrieve(this.threadId);
      console.log('Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting response:', error);
    }
  }
}

module.exports = VanillaAssistant;