const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

require('dotenv').config();
// DB setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 } // 1 day
}));



app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const sql = 'SELECT * FROM admin WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' });

    if (result.length > 0) {
      req.session.user = result[0];
      res.cookie('user', result[0], { maxAge: 86400000 }); // 1 day cookie
      res.json({ success: true, user: result[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});


// Auth check middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  return res.status(401).json({ message: 'Unauthorized' });
};

// Protected route
app.get('/api/dashboard', isAuthenticated, (req, res) => {
  res.json({ message: 'Welcome to protected dashboard', user: req.session.user });
});

// Logout route
app.post('/api/logout', (req, res) => {
  res.clearCookie('user');
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});


//                                                PROJECT PAGE SECTION 

// Insert Project
app.post('/api/projects', (req, res) => {
  const { projectName, client, category, assign_to, company_name, members, submisssion_date} = req.body;
  const status = "Todo";
  const memberStr = Array.isArray(members) ? members.join(',') : '';

  // Generate random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Extract first 2 letters from project name, uppercase, fallback to 'XX'
  const namePrefix = (projectName.slice(0, 2).toUpperCase() || 'XX');

  // Create unique project ID
  const project_id = `PR${randomNumber}${namePrefix}`;

  const sql = `
    INSERT INTO projects (project_id, name, client,status, category, assign_to, company_name, team_members, submisssion_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [project_id, projectName, client,status, category, assign_to, company_name, memberStr, submisssion_date],
    (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Project saved', id: result.insertId, project_id });
      
      
    }
  );
});


app.put('/api/projects/:projectId/update-members', (req, res) => {
  const { projectId } = req.params;

  const fetchTasksSql = 'SELECT assign_to, status FROM task WHERE project_id = ?';

  db.query(fetchTasksSql, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Database error while fetching tasks' });
    }

    // Extract unique non-empty team members
    const assignToList = results
      .map(row => row.assign_to)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

    const updateTeamSql = 'UPDATE projects SET team_members = ? WHERE project_id = ?';

    db.query(updateTeamSql, [assignToList.join(','), projectId], (err2) => {
      if (err2) {
        console.error('Error updating team_members:', err2);
        return res.status(500).json({ error: 'Database error while updating team_members' });
      }

      // Count all task statuses
      const taskStatusCount = { "To Do": 0, "Doing": 0, "Done": 0, "Hold": 0 };
      results.forEach(task => {
        const status = task.status;
        if (status === 'Todo' || status === 'To Do') taskStatusCount["To Do"]++;
        else if (status === 'Doing') taskStatusCount["Doing"]++;
        else if (status === 'Done') taskStatusCount["Done"]++;
        else if (status === 'Hold') taskStatusCount["Hold"]++;
      });

      // Update task count
      const updateNoOfTaskSql = 'UPDATE projects SET no_of_task = ? WHERE project_id = ?';
      db.query(updateNoOfTaskSql, [JSON.stringify(taskStatusCount), projectId], (err3) => {
        if (err3) {
          console.error('Error updating no_of_task:', err3);
          return res.status(500).json({ error: 'Database error while updating no_of_task' });
        }

        // === Logic for determining status ===
        if (results.length === 0) {
          // No tasks at all → Todo
          const updateStatusSql = 'UPDATE projects SET status = ? WHERE project_id = ?';
          db.query(updateStatusSql, ['Todo', projectId], (err4) => {
            if (err4) {
              console.error('Error setting status to Todo:', err4);
              return res.status(500).json({ error: 'Database error while updating status' });
            }
            return res.json({
              message: 'No tasks found, project status set to Todo',
              team_members: assignToList,
              no_of_task: taskStatusCount,
              status: 'Todo'
            });
          });
        } else {
          const allUnassigned = results.every(task => !task.assign_to);
          const allDone = results.every(task => task.status === 'Done');

          if (allUnassigned) {
            // All tasks exist but none assigned → Hold
            const updateStatusSql = 'UPDATE projects SET status = ? WHERE project_id = ?';
            db.query(updateStatusSql, ['Hold', projectId], (err5) => {
              if (err5) {
                console.error('Error setting status to Hold:', err5);
                return res.status(500).json({ error: 'Database error while updating status' });
              }
              return res.json({
                message: 'All tasks unassigned — project status set to Hold',
                team_members: [],
                no_of_task: taskStatusCount,
                status: 'Hold'
              });
            });
          } else if (allDone) {
            // All tasks assigned and completed
            const updateStatusSql = 'UPDATE projects SET status = ? WHERE project_id = ?';
            db.query(updateStatusSql, ['Done', projectId], (err6) => {
              if (err6) {
                console.error('Error setting status to Done:', err6);
                return res.status(500).json({ error: 'Database error while updating status' });
              }
              return res.json({
                message: 'All tasks done — project status set to Done',
                team_members: assignToList,
                no_of_task: taskStatusCount,
                status: 'Done'
              });
            });
          } else {
            // Mixed status with at least one assignment
            const updateStatusSql = 'UPDATE projects SET status = ? WHERE project_id = ?';
            db.query(updateStatusSql, ['Todo', projectId], (err7) => {
              if (err7) {
                console.error('Error setting status to Todo:', err7);
                return res.status(500).json({ error: 'Database error while updating status' });
              }
              return res.json({
                message: 'Some tasks assigned — project status set to Todo',
                team_members: assignToList,
                no_of_task: taskStatusCount,
                status: 'Todo'
              });
            });
          }
        }
      });
    });
  });
});


//    Edit Project Detail


app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  let { projectName, client, assign_to, category, company_name, members, submisssion_date } = req.body;

  // Ensure members is a valid array or string
  if (Array.isArray(members)) {
    members = members.join(','); // Convert to comma-separated string
  }

  const updateQuery = `
    UPDATE projects SET
      name = ?, client = ?, assign_to = ?, category = ?, company_name = ?, team_members = ?, submisssion_date = ?
    WHERE id = ?
  `;

  db.query(
    updateQuery,
    [projectName, client, assign_to, category, company_name, members, submisssion_date, id],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Project updated" });
    }
  );
});







// Fetch Project

app.get('/api/projects', (req, res) => {
  const sql = 'SELECT * FROM projects ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Split CSV team_members into array
    const formatted = results.map(row => ({
      ...row,
      team_members: row.team_members ? row.team_members.split(',') : [],
    }));

    res.json(formatted);
  });
});


// DELETE PROJECT 

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM projects WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  });
});



app.get('/api/tasks/count/:projectId', (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM task WHERE project_id = ?';
  db.query(sql, [req.params.projectId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ count: results[0].count });
  });
});

//                                                    END PROJECT PAGE



//                                                        USER PAGE

// Fetch User

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


app.get('/api/usernames', (req, res) => {
  db.query('SELECT user_id, name FROM user', (err, results) => {
    if (err) {
      console.error('Error fetching user names:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Insert User

app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;
  
  const username = email.split('@')[0]; // Extract username from email
  const user_id = `US${String(Math.floor(Math.random() * 90 + 10))}${name[0].toUpperCase()}`;
  
  const sql = 'INSERT INTO user (user_id, username, name, email, password) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [user_id, username, name, email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, user_id });
  });
});


// Update user
app.put('/api/users/:id', (req, res) => {
  const { name, email, password } = req.body;

  const username = email.split('@')[0]; // extract username from email
  const sql = 'UPDATE user SET name = ?, email = ?, password = ?, username = ? WHERE id = ?';

  db.query(sql, [name, email, password, username, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.sendStatus(200);
  });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const sql = 'DELETE FROM user WHERE id=?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.sendStatus(200);
  });
});



//                                                          END USER PAGE

//                                                       TASK PAGE


// ✅ Fetch tasks by project
app.get('/api/tasks/:projectId', (req, res) => {
  const { projectId } = req.params;
  const sql = `SELECT * FROM task WHERE project_id = ?`;
  db.query(sql, [projectId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Add new task
app.post('/api/tasks', (req, res) => {
  const {
    task_id,
    task_name,
    assign_to,
    comment,
    status,
    priority,
    due_date,
    submission_date,
    project_id
  } = req.body;

  const insertTaskSql = `
    INSERT INTO task 
      (task_id, task_name, assign_to, comment, status, priority, due_date, submission_date, project_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertTaskSql,
    [task_id, task_name, assign_to, comment, status, priority, due_date, submission_date, project_id],
    (err, result) => {
      if (err) {
        console.error('MySQL Insert Error:', err);
        return res.status(500).json({ error: err });
      }

      // ✅ If task status is "Doing", update the project's status
      if (status === "Doing") {
        const updateProjectSql = `
          UPDATE projects SET status = ? WHERE project_id = ?
        `;
        db.query(updateProjectSql, ["Doing", project_id], (err2) => {
          if (err2) {
            console.error('MySQL Update Project Error:', err2);
            return res.status(500).json({ error: err2 });
          }
          res.json({ message: 'Task added and project updated', id: result.insertId });
        });
      } else {
        res.json({ message: 'Task added', id: result.insertId });
      }
    }
  );
});


// ✅ Update existing task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const {
    task_name,
    assign_to,
    comment,
    status,
    priority,
    due_date,
    submission_date,
  } = req.body;

  const updateTaskSql = `
    UPDATE task SET task_name=?, assign_to=?, comment=?, status=?, priority=?, due_date=?,submission_date=? WHERE id=?
  `;

  db.query(
    updateTaskSql,
    [task_name, assign_to, comment, status, priority, due_date,submission_date, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });

      // ✅ If task status is "Doing", get project_id and update project status
      if (status === "Doing") {
        const getProjectIdSql = `SELECT project_id FROM task WHERE id = ?`;
        db.query(getProjectIdSql, [id], (err2, result2) => {
          if (err2) return res.status(500).json({ error: err2 });

          if (result2.length > 0) {
            const projectId = result2[0].project_id;
            const updateProjectSql = `UPDATE projects SET status = ? WHERE project_id = ?`;
            db.query(updateProjectSql, ["Doing", projectId], (err3) => {
              if (err3) return res.status(500).json({ error: err3 });
              res.json({ message: 'Task and project status updated' });
            });
          } else {
            res.status(404).json({ error: "Project not found for this task" });
          }
        });
      } else {
        res.json({ message: 'Task updated' });
      }
    }
  );
});


// Delete Task

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM task WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Task deleted' });
  });
});

//                                                TASK PAGE END


//                                                 ALL Task Page

app.get('/api/alltask', (req, res) => {
  const sql = 'SELECT * FROM task ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


//  Add single task

// POST /api/alltaskadd - Add new task
app.post('/api/alltaskadd', (req, res) => {
  const {
    task_name,
    assign_to,
    status,
    project_id,
    comment,
    priority,
    due_date
  } = req.body;

  // Generate task_id on server
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  const namePart = (task_name || 'TASK')
    .replace(/[^a-zA-Z]/g, '')  // Remove non-alphabet characters
    .toUpperCase()
    .slice(0, 3) || 'XXX';       // First 3 letters of task_name

  const task_id = `TK${randomDigits}${namePart}`;

  const sql = `
    INSERT INTO task (
      task_id,
      task_name,
      assign_to,
      status,
      project_id,
      comment,
      priority,
      due_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [task_id, task_name, assign_to, status, project_id, comment, priority, due_date],
    (err, result) => {
      if (err) {
        console.error('Error inserting task:', err);
        res.status(500).json({ error: 'Database error while adding task' });
      } else {
        res.status(200).json({ message: 'Task added successfully', id: result.insertId, task_id });
      }
    }
  );
});



app.post('/api/tasks/:taskId/comments', (req, res) => {
  const { taskId } = req.params;
  const { newComment } = req.body;

  // Fetch existing comments
  const selectSql = 'SELECT comment FROM task WHERE task_id = ?';
  db.query(selectSql, [taskId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    let existingComments = [];

    if (results.length > 0 && results[0].comment) {
      try {
        existingComments = JSON.parse(results[0].comment);
      } catch (e) {
        existingComments = [];
      }
    }

    // Append new comment
    existingComments.push(newComment);

    // Save updated comments array
    const updateSql = 'UPDATE task SET comment = ? WHERE task_id = ?';
    db.query(updateSql, [JSON.stringify(existingComments), taskId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error updating comment' });
      res.json({ message: 'Comment saved', comments: existingComments });
    });
  });
});

app.get('/api/tasks/:taskId/comments', (req, res) => {
  const { taskId } = req.params;
  const sql = 'SELECT comment FROM task WHERE task_id = ?';
  db.query(sql, [taskId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    let comments = [];
    if (results.length && results[0].comment) {
      try {
        comments = JSON.parse(results[0].comment);
      } catch (e) {
        comments = [];
      }
    }
    res.json({ comments }); // <-- ensure you return an object with `comments` key
  });
});






app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


