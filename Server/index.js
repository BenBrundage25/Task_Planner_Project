const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

//TASKS SECTION START

//Retrieves table and sorts it into the database based on priority
app.get("/tasks", async (req, res) => {
  try {
    const allTasks = await pool.query(`
      SELECT t.*, u.username as assigned_to, ut.user_id as assigned_user_id 
      FROM tasks t
      LEFT JOIN user_tasks ut ON t.task_id = ut.task_id
      LEFT JOIN users u ON ut.user_id = u.user_id
      ORDER BY 
        CASE 
          WHEN t.priority = 'high' THEN 1 
          WHEN t.priority = 'medium' THEN 2 
          WHEN t.priority = 'low' THEN 3 
        END ASC, 
        t.task_id ASC
    `);
    res.json(allTasks.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { description, priority } = req.body;
    // Check if the first argument here is actually a string
    const newTask = await pool.query("INSERT INTO tasks (description, priority) VALUES($1, $2) RETURNING *", [description, priority]);
    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//Grabs the ID number and removes that specific row from the table
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE task_id = $1", [id]);
    res.json("Task was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

//Updates the task
app.put("/tasks/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {description, priority} = req.body;

    await pool.query("UPDATE tasks SET description = $1, priority = $2 WHERE task_id = $3", [description, priority, id]);
    res.json("Task was updated!");
  }catch (err) {
    console.error(err.message);
  }
});
//TASKS SECTION END

//Login section start
app.post("/login", async (req, res) => {
  try {
    const {username} = req.body;
    //See if the user exists already
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length >0) {
      res.json(user.rows[0]);
    }else {
      const newUser = await pool.query("INSERT INTO users (username) VALUES($1) RETURNING *", [username]);
      res.json(newUser.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//LOGIN SECTION END

//USER SECTION START

//Get users & user information for frontend dropdown
app.get("/users", async (req,res)=> {
  try {
    const allUsers = await pool.query("SELECT * FROM users ORDER BY username ASC");
    res.json(allUsers.rows);
  }catch(err) {
    console.error(err.message);
  }
});

//Create a new user if one with the username DNE
app.post ("/users", async (req, res)=> {
  try {
    const {username} = req.body;
    //Checks for user
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length > 0) {
      return res.json(user.rows[0]);
    }
    //Creates new user
    const newUser = await pool.query("INSERT INTO users (username) VALUES ($1) RETURNING *", [username]);
    res.json(newUser.rows[0]);
  }catch (err) {
    console.error(err.message);
  }
});
//USER SECTION END

//USER-TASK SECTION START

//Assigns a task to a certain user using their ID's
app.post("/tasks/assign", async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    //Check if the assignment already exists
    const check = await pool.query("SELECT * FROM user_tasks WHERE task_id = $1", [taskId]);

    if (check.rows.length >0) {
      //Update (edit) assignment
      await pool.query("UPDATE user_tasks SET user_id = $1 WHERE task_id = $2", [userId, taskId]);
    } else {
      //Create an assignment
      const assignment = await pool.query("INSERT INTO user_tasks (user_id, task_id) VALUES ($1, $2)", [userId, taskId]);
    }
    res.json({message: "Assigned"});
  } catch (err) {
    console.error(err.message);
  }
});
//USER-TASK SECTION END

app.listen(5000, () => {
  console.log("Server has started on port 5000");
});