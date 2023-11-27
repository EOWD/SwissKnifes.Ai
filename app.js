// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

hbs.registerPartials("./views/partials/");
hbs.registerPartials("./views/partials/Nav/");
hbs.registerPartials("./views/partials/ThreadsAssistants/");
hbs.registerPartials("./views/partials/knifeDrive");
const app = express();
app.use(express.json({ limit: "50mb" }));

require("./config/session.config")(app);
// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "MentorAi";

app.locals.appTitle = `${capitalize(projectName)}`;

const setUserStatus = (req, res, next) => {
  // Set a global variable accessible in all Handlebars templates
  res.locals.isLoggedIn = !!req.session.currentUser;
  if (req.session.currentUser) {
    res.locals.username = req.session.currentUser.username;
  }
  next();
};

app.use(setUserStatus);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const assistantRoutes = require("./routes/assistant.routes");
const threadRoutes = require("./routes/thread.routes");
app.use("/", indexRoutes, assistantRoutes, threadRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

const dallRoutes = require("./routes/dall.routes");
app.use("/dall", dallRoutes);

const driveRoutes = require("./routes/drive.routes");
app.use("/drive", driveRoutes);
const vision = require("./routes/vision.routes");
app.use("/vision", vision);
const knifeDrive = require("./routes/knife-drive.routes");
app.use("/knifedrive", knifeDrive);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

hbs.registerHelper("eq", function (val1, val2) {
  return val1 === val2;
});

hbs.registerHelper("formatLineBreaks", function (text) {
  return new hbs.SafeString(text.replace(/\n/g, "<br>"));
});

module.exports = app;
