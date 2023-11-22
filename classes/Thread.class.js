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
  
  async createMessage(threadId, userInput) {
    try {
      // Continue the conversation by adding user's questions or instructions
      const threadMessages = await this.openaiApi.beta.threads.messages.create(
        threadId,
        { role: "user", content: userInput }
      );
      return threadMessages;
      console.log('Create Message with input:', userInput);
    } catch (error) {
      console.error('Error continuing conversation:', error);
    }
  }

  async runThread(threadId, assitantId) {
    const run = await this.openaiApi.beta.threads.runs.create(
        threadId,
      { assistant_id: assitantId }
    );
  
    return run;
  }

  async createThreadAndRun(assistantId, message) {
    const run = await this.openaiApi.beta.threads.createAndRun({
      assistant_id: assistantId,
      thread: {
        messages: [
          { role: "user", content: message },
        ],
      },
    });
  
    return run;
  }

  async retrieveRun(threadId, runId) {
    const run = await this.openaiApi.beta.threads.runs.retrieve(
        threadId,
      runId
    );
    return run;
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
  
  async findThread(threadId) {
    return await ThreadModel.findOne({ threadId });
  }
}

module.exports = Thread;