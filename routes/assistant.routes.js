const express = require("express");
const router = express.Router();
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const VanillaAssistant = require('../classes/Assistant.class.js');
const Assistant = require("../models/Assistant.model.js");
const File = require("../classes/Files.class.js");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mapTools = require('../controller/mapAssistantTools.js');

const openaiApikey = process.env.OPENAI_API_KEY;
const assistantInstance = new VanillaAssistant(openaiApikey);
let userId = "";

// Configure multer to save files to disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'temp_files/') // replace 'temp_uploads/' with the path to your temporary directory
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });
const filer = new File(openaiApikey);


router.get("/assistant", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const listAllAssistants = await assistantInstance.listAssistants();
        const selectedAssistant = listAllAssistants[0] ? listAllAssistants[0].id : "";
        const listOpenaiAssistants = await assistantInstance.listOpenaiAssistants()
        //console.log(listOpenaiAssistants)
        res.render("profile/assistant", {listAll: listAllAssistants, selectedAssistant, listOpenaiAssistants});
    } catch (error) {
        console.log(error)
    }
});

router.post("/assistant/newAssistant", isLoggedIn, upload.array('files', 20), async (req, res, next) => {
    try {
        const toolsFormatted = mapTools(req.body.tools)

        const uploadPromises = req.files.map(file => {
            const filePath = file.path;
            
            return filer.uploadFile(filePath, "assistants")
                .then(uploadSingleFile => {
            
                // Delete file from temp_files folder after upload
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting temp file:', err);
                });
            
                return uploadSingleFile;
                });
        });
        
        const uploadedFiles = await Promise.all(uploadPromises);
        const fileIds = uploadedFiles.map(file => file.id);

        // if one fails
        for (const result of uploadedFiles) {
            if (result.status === 'rejected') {
              console.error('A file upload failed:', result.reason);
            }
        }

        const createAssistantResponse = await assistantInstance.createAssistant(req.body.name, req.body.description, req.body.instructions, toolsFormatted, req.body.model, fileIds);

        await Assistant.create({
            assistantId: createAssistantResponse.id,
            name: createAssistantResponse.name,
            model: createAssistantResponse.model,
            description: createAssistantResponse.description,
            instructions: createAssistantResponse.instructions,
            file_ids: fileIds
        });

        const listAllAssistants = await assistantInstance.listAssistants();
        res.render("profile/assistant", { response: createAssistantResponse,  listAll: listAllAssistants });
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.get("/assistant/:id/edit", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const assistantId = req.params.id
        
        const asssistantData = await assistantInstance.retrieveAssistant(assistantId)
        console.log(asssistantData)

        res.render("profile/modifyAssistant", {asssistantData});
    } catch (error) {
        console.log(error)
    }
});


router.get("/assistant/delete/:id", isLoggedIn, async (req, res, next) => {
    const assistantId = req.params.id;

    try {
        // Retrieve the assistant to get the file IDs
        const assistant = await Assistant.findOne({ assistantId: assistantId });
        if (!assistant) {
            throw new Error('Assistant not found');
        }

        // Delete each file associated with the assistant
        if (assistant.file_ids && assistant.file_ids.length > 0) {
            for (const fileId of assistant.file_ids) {
                await filer.deleteFile(fileId);
            }
        }

        // Now delete the assistant from OpenAI and your database
        await assistantInstance.deleteAssistant(assistantId);
        await Assistant.findOneAndDelete({ assistantId: assistantId });

        res.redirect('/assistant');
    } catch (error) {
        console.error('Error deleting assistant:', error);
        next(error);
    }
})

module.exports = router;