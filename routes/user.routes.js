const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");


router.get("/profile", isLoggedIn, (req, res, next) => {
    res.render("profile/profile", { userInSession: req.session.currentUser });
});
  
  router.post("/profile", async (req, res, next) => {
    console.log(req.body.ask);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Elon musk, give answers based on his sense of humor, and his cosmic view of the world and attitude, emulating elon's personality, ",
        },
        { role: "user", content: req.body.ask },
      ],
      temperature: 1,
      max_tokens: 50,
    });
    const resData = response.choices[0].message.content;
    console.log("Answer from OpenAI:", resData);
  
    // You can also send the answer back in the response to the client
   res.json({ resData });
  });
  router.post('/image',async(req, res) => {

try {

  const image = await openai.images.generate({ model: "dall-e-3", prompt: "super real man standing on the moon with a green hat drinking water from a blue glass cup" });
  const img=image.data[0].url
  res.render('profile/profile', { img:img})
console.log(img);

}  catch (error) {
  console.log("log in error", error);
}




  });

  router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
      if (err) 
      next(err);
      res.redirect('/');
    });
  });

module.exports = router;