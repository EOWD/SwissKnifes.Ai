
const OpenAI = require('openai')
const openaiRun = new OpenAI();
const fs= require('fs')


/* //CREATE ASSISTANT

async function creatAssistant() {
    const myAssistant = await openaiRun.beta.assistants.create({
      instructions:
        "You are Elon Musk. Answer questions directly and honestly, with a focus on clear, straightforward communication, even if the truth is uncomfortable.",
      name: "Elon Musk",
      tools: [{ type: "code_interpreter"}, { type: "retrieval"}],
      model: "gpt-4-1106-preview",
    });
  
    console.log(myAssistant);
}

//DELETE ASSISTANT

async function deleteAssistant(id) {
    const response = await openaiRun.beta.assistants.del(id);
    
    console.log(response);
} */

const assistantID = "asst_J1pQLjtklErhys8bFtFnDYgv"
const fileID = "file-1LvZBrlmCJFBJRLbycYcNeu0"
const threadID = "thread_JPyLjuLpvjUJQvsCD0rq4f09"
const runID = "run_ZPlCgJi2Jb2Vh5m9V91ZIjAd"
const toolCallID = "call_FrU91IwBuHGKd3AODY0pfhsE"

// Upload a file with an "assistants" purpose
/*async function uploadFile(source){
    const file = await openaiRun.files.create({
        file: fs.createReadStream(source),
        purpose: "assistants",
    });
}

console.log(uploadFile("./uploads/firstTry.json"))*/

async function uploadFile(source) {
    try {
      const file = await openaiRun.files.create({
        file: fs.createReadStream(source),
        purpose: "assistants",
      });
      console.log(file);
    } catch (error) {
      console.error("Error uploading the file:", error);
    }
  }
  
  //uploadFile("./uploads/test1.txt");
  


// Create Thread

async function createThread(){
    try {
        const emptyThread = await openaiRun.beta.threads.create();
        
        console.log(emptyThread);        
    } catch (error) {
        console.log(error)
    }
}
//console.log(createThread());




//CREATE MESSAGE

async function createMessage(message) {
    try {
        const threadMessages = await openaiRun.beta.threads.messages.create(
        threadID,
        { role: "user", content: message }
        );
    
        console.log(threadMessages);
    } catch (error) {
        console.log(error)
    }
    
  }
//console.log(createMessage("What is Grok’s personality modeled after?"))



//RETRIEVE MESSAGE

async function retrieveMessages(threadID) {
    try {
        const threadMessages = await openaiRun.beta.threads.messages.list(
            threadID
        );
        return threadMessages;
        //console.log(threadMessages.data);
    } catch (error) {
        console.log(error)
    }
}

retrieveMessages(threadID)
    .then(allMessages => {
        console.log(allMessages.data[0].content);
    })
    .catch(error => {
        console.error('Error retrieving messages:', error);
    });



//RUN THE THREAD

async function runThread() {
    try {
        const run = await openaiRun.beta.threads.runs.create(
            threadID,
            { assistant_id: assistantID }
          );
        
          console.log(run);
    } catch (error) {
        console.log(error);
    }
}

//console.log(runThread())


//RETRIEVE THE RUN
async function retrieveRun() {
    try {
        const run = await openaiRun.beta.threads.runs.retrieve(
            threadID,
            runID
          );
        
          console.log(run);
    } catch (error) {
        console.log(error);
    }
}
//console.log(retrieveRun())


//LIST RUN STEPS

async function listRuns() {
    try {
        const runStep = await openaiRun.beta.threads.runs.steps.list(
            threadID,
            runID
        );
        //console.log(runStep);
        return runStep
    } catch (error) {
        console.log(error);
    }
}

let listResponse
/* listRuns()
    .then(allMessage => {
        listResponse = allMessage;
        console.log(listResponse.data[1].step_details)
    })
    .catch(error => {
        console.error('Error retrieving messages:', error);
    }); */






//SUMBIT TOOL RUN

async function submitToolRun() {
    try {
        const run = await openaiRun.beta.threads.runs.submitToolOutputs(
            threadID,
            runID,
            {
              tool_outputs: [
                {
                  tool_call_id: toolCallID,
                  output: "28C"
                },
              ],
            }
          );
        
          console.log(run);
    } catch (error) {
        console.log(error);
    }
}

//console.log(submitToolRun())




//CONNECT UPLOADED FILE TO ASSISTANT

async function createAssistantFile(fileId, assistantID) {
    const myAssistantFile = await openaiRun.beta.assistants.files.create(
    assistantID, 
      { 
        file_id: fileId
      }
    );
    console.log(myAssistantFile);
}

//console.log(createAssistantFile(fileID, assistantID))