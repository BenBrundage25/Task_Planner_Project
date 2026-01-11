import React, { useState, useEffect } from "react";
import axios from "axios";

const priorityOrder = { high: 1, medium: 2, low: 3 };

function App() {
  //States
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  //Tasks input states
  const [description, setDescription] = useState(""); 
  const [priority, setPriority] = useState("medium");
  const [assignToUserId, setAssignToUserId] = useState("");

  //Login State
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");

  //Edit states
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editAssignUserId, setEditAssignUserId] = useState("");

  //Get all tasks
  const getTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/tasks");
      //Updates the React state
      console.log("DATA FROM SERVER:", response.data);
      setTasks(response.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  //Get all users
  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users");
      //Updates the react state
      setUsers(response.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  //Fetches data from the API when data changes
  useEffect(() => {
    getTasks();
    getUsers();
  }, []);

  //TASKS FUNCTIONS BEGIN

  //When submitting the task
  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    try {
      //Create the Task
      const response = await axios.post("http://localhost:5000/tasks", {
        description,
        priority
      });

      //Find the ID whether it's called 'id' or 'task_id', I got lost in the sauce and thought I worte id in one spot so just in case
      const newTaskId = response.data.task_id || response.data.id;

      //Assign User if we have a user and a valid Task ID
      if (assignToUserId && newTaskId) {
        console.log(`Assigning User ${assignToUserId} to Task ${newTaskId}`);
        
        await axios.post("http://localhost:5000/tasks/assign", {
          taskId: newTaskId,
          userId: assignToUserId
        });
      }

      //Clear Form
      setDescription("");
      setAssignToUserId("");
      getTasks();
    } catch (err) {
      console.error("Error in onSubmitForm:", err.message);
    }
  };

  //Delete a task
  const deleteTask = async (id) => {
    try {
      //Deletes specific task
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      //Filter out the deleted task from the state so the UI updates
      setTasks(tasks.filter((task) => task.task_id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };
//TASKS END

//EDIT START

  const startEditing = (task) => {
    setEditingTaskId(task.task_id);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditAssignUserId(task.assigned_user_id || ""); 
  };

  const saveEdit = async (id) => {
    try {
      //Update Description & Priority
      await axios.put(`http://localhost:5000/tasks/${id}`, {
        description: editDescription,
        priority: editPriority
      });
      //Update Assignment
      if (editAssignUserId) {
        await axios.post("http://localhost:5000/tasks/assign", {
          taskId: id,
          userId: editAssignUserId
        });
      }

      setEditingTaskId(null);
      getTasks();
    } catch (err) { console.error(err.message); }
  };
  //EDIT END

  //LOGIN FUNCTIONS BEGIN

  //Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      //POST to login and if the user DNE, creates it
      const response = await axios.post("http://localhost:5000/login", { username: usernameInput });
      setCurrentUser(response.data);
      setUsernameInput("");
      //Refreshes list
      getUsers();
    } catch (err) {
      console.error(err.message);
    }
  };
  //LOGIN END

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>PERN Planner</h1>

      {/* LOGIN SECTION */}
      <div style={{ background: "#f4f4f4", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        {!currentUser ? (
          <form onSubmit={handleLogin} style={{ display: "flex", gap: "10px" }}>
            <strong>Login:</strong>
            <input 
              type="text" placeholder="Enter username..." 
              value={usernameInput} onChange={e => setUsernameInput(e.target.value)} 
            />
            <button type="submit">Go</button>
          </form>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>👋 Welcome, {currentUser.username}!</h3>
            <button onClick={() => setCurrentUser(null)}>Logout</button>
          </div>
        )}
      </div>

      {/* ADD TASK FORM */}
      <form onSubmit={onSubmitForm} style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <input
          type="text" placeholder="New Task..." 
          value={description} onChange={e => setDescription(e.target.value)}
          required style={{ flexGrow: 1, padding: "8px" }}
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={assignToUserId} onChange={e => setAssignToUserId(e.target.value)}>
          <option value="">-- Assign --</option>
          {users.map(u => <option key={u.user_id} value={u.user_id}>{u.username}</option>)}
        </select>
        <button style={{ background: "black", color: "white", border: "none", padding: "8px 16px" }}>Add</button>
      </form>

      {/* TASK LIST */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map(task => (
          <li key={task.task_id} style={{ 
            border: "1px solid #ddd", padding: "15px", marginBottom: "10px", 
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: editingTaskId === task.task_id ? "#f9f9f9" : "white"
          }}>
            {editingTaskId === task.task_id ? (
//EDIT MODE
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", width: "100%" }}>
                {/* Description Input */}
                <input 
                  value={editDescription} 
                  onChange={e => setEditDescription(e.target.value)} 
                  style={{ flexGrow: 1 }}
                />
                
                {/* Priority Dropdown */}
                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* --- NEW: User Assignment Dropdown --- */}
                <select 
                  value={editAssignUserId} 
                  onChange={e => setEditAssignUserId(e.target.value)}
                  style={{ maxWidth: "120px" }}
                >
                  <option value="">-- User --</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.username}</option>
                  ))}
                </select>

                {/* Save/Cancel Buttons */}
                <button onClick={() => saveEdit(task.task_id)} style={{ background: "green", color: "white" }}>Save</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
              </div>
            ) : (
//VIEW MODE
              <>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Task Description */}
                    <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>
                      {task.description}
                    </span>

                    {/* Priority Badge */}
                    <span style={{ 
                      fontSize: "0.8em", 
                      padding: "4px 8px", 
                      borderRadius: "12px",
                      background: task.priority === "high" ? "#ffcccc" : task.priority === "medium" ? "#ffffcc" : "#ccffcc",
                      border: "1px solid #ddd"
                    }}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Assigned User Display */}
                  <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                    {task.assigned_to ? (
                      <span style={{ color: "#555" }}>
                        👤 Assigned to: <strong>{task.assigned_to}</strong>
                      </span>
                    ) : (
                      <span style={{ color: "#aaa", fontStyle: "italic" }}>
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", marginLeft: "10px" }}>
                  <button onClick={() => startEditing(task)} style={{ cursor: "pointer", padding: "5px 10px" }}>
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteTask(task.task_id)} 
                    style={{ cursor: "pointer", padding: "5px 10px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "4px" }}
                  >
                    X
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;