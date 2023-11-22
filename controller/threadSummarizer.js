const openai = require('openai');

const openaiApi = new openai.OpenAI();

async function threadSummarizer(message) {
  const completion = await openaiApi.chat.completions.create({
    messages: [{"role": "user", "content": "Summarize the next Message in max. 40 characters (It will be the chat Title):"},
        {"role": "user", "content": message}],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}

module.exports = threadSummarizer;