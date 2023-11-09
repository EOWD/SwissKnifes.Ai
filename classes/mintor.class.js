const openai = require('openai');
const fs= require('fs')

class AssistantManager {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.threadId = null;
    }
    async createAssistant() {
        // Create the assistant
        this.assistant = await this.openaiApi.assistants.create({
          name: 'Math Tutor',
          instructions: 'You are a personal math tutor. Write and run code to answer math questions.',
          tools: [{ type: 'code_interpreter' }],
          model: 'gpt-4-1106-preview',
        });
      }
    
      async createThread() {
        // Create a Thread for the conversation
        const thread = await this.openaiApi.threads.create();
        this.threadId = thread.id;
      }
    
      async uploadPDF(filePath) {
        // Read and upload the PDF content
        const pdfData = fs.readFileSync(filePath);
        const pdfText = pdfData.toString('base64');
    
        // Add PDF content to the conversation
        await this.openaiApi.threads.addMessage(this.threadId, {
          role: 'system',
          content: 'User uploaded PDF',
        });
        await this.openaiApi.threads.addMessage(this.threadId, {
          role: 'user',
          content: pdfText,
        });
      }
    
      async continueConversation(userInput) {
        // Continue the conversation by adding user's questions or instructions
        await this.openaiApi.threads.addMessage(this.threadId, {
          role: 'user',
          content: userInput,
        });
      }
    
      async getResponse() {
        // Get responses based on the conversation
        return await this.openaiApi.threads.get(this.threadId);
      }
    }
    
    module.exports = AssistantManager;