/* const VanillaAssistant = require('./VanillaAssistant.class');

class AssistantService {
    constructor(user) {
      this.user = user;
      this.openAiApiKey = process.env.OPENAI_API_KEY;
      this.vanillaAssistant = new VanillaAssistant(this.openAiApiKey);
    }
  
    async handleNewConversation(question) {
      await this.vanillaAssistant.createThread();
      await this.vanillaAssistant.continueConversation(question);
      const response = await this.vanillaAssistant.getResponse();
  
      // The service layer handles DB operations
      //saveThreadToUser(this.user.id, this.vanillaAssistant.threadId);
      //saveMessageHistory(this.vanillaAssistant.threadId, question, response);
  
      return response;
    }
} */