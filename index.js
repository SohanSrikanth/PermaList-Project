import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
//create a .env file and add the following variables
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
  try{
    const result = await db.query("select * from items order by id");
    items = result.rows;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch(err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try { 
    await db.query("insert into items (title) values ($1)", [item]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const newId = req.body.updatedItemId;
  const newitem = req.body.updatedItemTitle;

  try {
    await db.query("update items set title = $1 where id = $2",[newitem, newId]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }

});

app.post("/delete", async (req, res) => {
  const deleteid = req.body.deleteItemId;
  try {
    await db.query("delete from items where id = $1", [deleteid]);
    res.redirect("/");
  } catch(err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
