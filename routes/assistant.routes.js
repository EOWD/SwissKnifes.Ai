const express = require("express");
const router = express.Router();
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
//const AssistantManager = require('../classes/AssistantManager.class');
const VanillaAssistant = require('../classes/VanillaAssistant.class');

const openaiApikey = process.env.OPENAI_API_KEY;
const assistantInstance = new VanillaAssistant(openaiApikey);

router.get("/assistant", isLoggedIn, async (req, res) => {
    try {
        const listAllAssistants = await assistantInstance.listAssistants();
        res.render("profile/assistant", {listAll: listAllAssistants});
    } catch (error) {
        console.log(error)
    }
});

router.post("/assistant/newAssistant", isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;

    try {
        const createAssistantResponse = await assistantInstance.createAssistant();
        const listAllAssistants = await assistantInstance.listAssistants();

        res.render("profile/assistant", { response: createAssistantResponse, listAll: listAllAssistants });
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})

router.get("/assistant/delete/:id", isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    const assistantId = req.params.id;

    try {
        const deletedAssistant = await assistantInstance.deleteAssistant(assistantId);
        const listAllAssistants = await assistantInstance.listAssistants();
        res.redirect("/assistant")
        res.render("profile/assistant", { listAll: listAllAssistants });
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})

module.exports = router;