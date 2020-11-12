const express = require("express");
const exphbs = require("express-handlebars");
const routes = require("./controllers");
const sequelize = require("./config/connection");
const path = require("path");
const app = express();
const helpers = require("./utils/helpers");
const hbs = exphbs.create({ helpers });
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

const session = require("express-session");

const SequelizeStore = require("connect-session-sequelize")(session.Store);

const sess = {
  secret: "Super Secret Secret",
  cookie: { maxAge: 7200000 },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now Listening"));
});
