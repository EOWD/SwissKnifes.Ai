const openai = require('openai'); // Ensure the 'openai' package is installed
const fs = require('fs');
const ThreadModel = require("../models/Thread.model.js");

class Thread {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.threadId = null;
    this.openaiApi = new openai.OpenAI(); // Initialize the OpenAI API with the apiKey
  }

  async createThread(message) {
    try {
      const messageThread = await this.openaiApi.beta.threads.create({
        messages: [
          {
            role: "user",
            content: message
          }
        ],
      });
      return messageThread
    } catch (error) {
      console.error('Error creating thread:', error);
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

  async deleteThread(threadId) {
    const response = await this.openaiApi.beta.threads.del(threadId);
    return response;
  }



  async listMessages(threadId) {
    const threadMessages = await this.openaiApi.beta.threads.messages.list(
        threadId
      );
      return threadMessages;
  }


  // DB FUNCTIONS
  
  async listThreads(userId) {
    return await ThreadModel.find({ userId });
  }
}

module.exports = Thread;