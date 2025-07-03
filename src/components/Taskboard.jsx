import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash,faChartGantt,faComment } from '@fortawesome/free-solid-svg-icons';
import GanttView from './GanttView'; // Adjust path
import CommentPopup from './CommentPopup';

const Taskboard = () => {
  const { projectId } = useParams();
  const [taskData, setTaskData] = useState([]);
  const [newTask, setNewTask] = useState({});
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showGantt, setShowGantt] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeCommentTaskId, setActiveCommentTaskId] = useState(null);



  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  useEffect(() => {
  const fetchTasksAndUpdateProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${projectId}`);
      const tasks = res.data;
      setTaskData(tasks);

      const assignToList = tasks.map(t => t.assign_to).filter(Boolean);
      await axios.put(`http://localhost:5000/api/projects/${projectId}/update-members`, {
        team_members: assignToList
      });
    } catch (err) {
      console.error('Error loading tasks or updating project:', err);
    }
  };

  fetchTasksAndUpdateProject();
}, [projectId]);


  const handleInputChange = (field, value) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };
  

  const handleAddTask = () => {
    if (!newTask.name) return;

    const isUnassigned = !newTask.assigned || newTask.assigned.trim() === '';

    const newTaskObj = {
      task_id: `TK${Math.floor(1000 + Math.random() * 9000)}${(newTask.name || '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 3) || 'XYZ'}`,
      task_name: newTask.name,
      assign_to: newTask.assigned,
      comment: newTask.comment,
      status: isUnassigned ? 'Hold' : (newTask.status || 'To Do'),
      priority: newTask.priority,
      due_date: newTask.dueDate,
      submission_date: newTask.SubmissionDate,
      project_id: projectId,
    };

    axios.post('http://localhost:5000/api/tasks', newTaskObj)
      .then((res) => {
        const dbId = res.data.id;
        setTaskData(prev => [...prev, { ...newTaskObj, id: dbId }]);
        setNewTask({});
        setShowForm(false);
      })
      .catch(err => console.error('Error adding task:', err));
  };

  const updateTask = (id, updatedFields) => {
    const task = taskData.find(t => t.id === id);
    const updatedTask = { ...task, ...updatedFields };

    setTaskData(prev => prev.map(t => (t.id === id ? updatedTask : t)));

    axios.put(`http://localhost:5000/api/tasks/${id}`, {
      task_name: updatedTask.task_name,
      assign_to: updatedTask.assign_to,
      comment: updatedTask.comment,
      status: updatedTask.status,
      priority: updatedTask.priority,
      due_date: updatedTask.due_date,
      submission_date: updatedTask.submission_date,
    }).catch(err => console.error('Error updating task:', err));
  };

  const openDrawer = (task) => {
    setSelectedTask(task);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setSelectedTask(null);
    setShowDrawer(false);
  };

  const deleteTask = (id) => {
  if (window.confirm('Are you sure you want to delete this task?')) {
    axios.delete(`http://localhost:5000/api/tasks/${id}`)
      .then(() => {
        setTaskData(prev => prev.filter(task => task.id !== id));
      })
      .catch(err => console.error('Error deleting task:', err));
  }
};



  return (
    <div>
      <h1 className="text-xl font-bold mt-4 ml-10">Project ID: {projectId}</h1>

      <div className="max-w-full mx-auto p-10 space-y-6">
        <div className="flex justify-between mb-2">
            <button className="flex items-center">
              <span className="text-lg font-semibold text-gray-800">
                Tasks: {taskData.length}
              </span>
            </button>
            <button className="text-gray-800 px-3 py-1 rounded  text-sm"
                onClick={() => setShowForm(!showForm)}
            >
              ➕ Add Task
            </button>
        </div>

        <div className="bg-white border border-gray-200 mb-20 ">
          <table className="min-w-full text-sm text-left text-gray-700 ">
            <thead className="bg-gray-200 text-gray-800 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Task ID</th>
                <th className="px-4 py-3">Task Name</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Deadline</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              {taskData.map((task) => (
                <tr key={task.id} className="border-b border-b-gray-300  hover:bg-gray-50">
                  <td
                    className="px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openDrawer(task)}
                  >
                    {task.task_id}
                  </td>
                  
                  <td className="px-4 py-2 w-45">
                    <TextField
                      variant="standard"
                      size="small"
                      value={task.task_name}
                      onChange={(e) => updateTask(task.id, { task_name: e.target.value })}
                       InputProps={{
                              disableUnderline: true,
                              sx: {
                                fontSize: '13px',
                                '&:hover': { borderBottom: 'none' },
                                '&.Mui-focused': { borderBottom: 'none' },
                              },
                            }}
                    />

                    
                  </td>
                  <td className="px-4 py-2 flex">
                    <FormControl variant="standard" size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={task.assign_to}
                        onChange={(e) => updateTask(task.id, { assign_to: e.target.value })}
                        disableUnderline
                              sx={{
                                fontSize: '13px',
                                '&:hover': { borderBottom: 'none' },
                                '&.Mui-focused': { borderBottom: 'none' },
                              }}
                      >
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.name}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                     {(() => {
                    let commentArray = [];
                    try {
                      commentArray = JSON.parse(task.comment);
                    } catch (e) {
                      commentArray = [];
                    }
                    const commentCount = Array.isArray(commentArray) ? commentArray.length : 0;
                    return (
                      <div className="w-0 ml-3">
                  
                    <button onClick={() => setActiveCommentTaskId(task.task_id)} className="relative">
                      <FontAwesomeIcon icon={faComment} />
                      {commentCount > 0 && (
                        <span className="absolute bottom-3 left-3 bg-gray-600 text-white rounded-full text-[0.5rem] px-1 ">
                          {commentCount}
                        </span>
                      )}
                    </button>
                    
                  {activeCommentTaskId === task.task_id && (
                    <CommentPopup
                      show={true}
                      onClose={() => setActiveCommentTaskId(null)}
                      taskId={task.task_id}
                      
                    />
                  )}
                  </div>
                    );
                  })()}
                  </td>
                  
                 
                  

                  <td className="px-4 py-2 ">
                    <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
  <Select
    value={task.status}
    onChange={(e) => updateTask(task.id, { status: e.target.value })}
    disableUnderline
    IconComponent={null}      // <- Hide the dropdown icon here
    sx={{
      fontSize: '13px',
      borderRadius: '10px',
      textAlign: 'center',
      paddingTop: '5px',
      paddingLeft: '20px',
      backgroundColor:
        task.status === "To Do"
          ? "#fde68a"
          : task.status === "Doing"
          ? "#bfdbfe"
          : task.status === "Done"
          ? "#bbf7d0"
          : "transparent",
      '&:hover': { borderBottom: 'none' },
      '&.Mui-focused': { borderBottom: 'none' },
    }}
    MenuProps={{
      PaperProps: {
        sx: {
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: 'none',
        },
      },
    }}
  >
    {["To Do", "Doing", "Done"].map((status) => {
      const statusColors = {
        "To Do": "#fde68a",
        "Doing": "#bfdbfe",
        "Done": "#bbf7d0",
      };

      return (
        <MenuItem
          key={status}
          value={status}
          sx={{
            fontSize: '13px',
            borderRadius: '10px',
            backgroundColor: statusColors[status],
            '&:hover': {
              backgroundColor: statusColors[status],
            },
            my: 0.5,
          }}
        >
          {status}
        </MenuItem>
      );
    })}
  </Select>
</FormControl>
                  </td>
                  <td className="px-4 py-2 ">
                    <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                        disableUnderline
                        IconComponent={null} 
                        sx={{
        fontSize: '13px',
        textAlign: 'center',
        borderRadius: '10px',
        paddingTop: '5px',
        paddingLeft: '20px',
        backgroundColor:
          task.priority === "Medium"
            ? "#d1fae5"
            : task.priority === "Urgent"
            ? "#f87171"
            : "transparent",
        color: task.priority === "Urgent" ? "white" : "inherit",
        '&:hover': { borderBottom: 'none' },
        '&.Mui-focused': { borderBottom: 'none' },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: 2,
            
            boxShadow: 'none',
            backgroundColor: 'white',
          },
        },
      }}
                        
                      >
                        <MenuItem
        value="Medium"
        sx={{
          fontSize: '13px',
          backgroundColor: '#d1fae5',
          borderRadius: '10px',
          my: 0.5,
        }}
      >
        Medium
      </MenuItem>
      
      <MenuItem
        value="Urgent"
        sx={{
          fontSize: '13px',
          backgroundColor: '#f87171',
          color: 'white',
          borderRadius: '10px',
          my: 0.5,
        }}
      >
        Urgent
      </MenuItem>
                      </Select>
                    </FormControl>
                  </td>
                  <td className="px-4 py-2">
                    <TextField
                      variant="standard"
                      type="date"
                      size="small"
                      value={task.submission_date?.includes('T') ? task.submission_date.slice(0, 10) : task.submission_date}
                      onChange={(e) => updateTask(task.id, { submission_date: e.target.value })}
                      InputProps={{ disableUnderline: true,
                        sx: {
                                fontSize: '13px',
                                '&:hover': { borderBottom: '1px solid lightgray' },
                                '&.Mui-focused': { borderBottom: '1px solid #1976d2' },
                              },
                       }}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <TextField
                      variant="standard"
                      type="date"
                      size="small"
                      value={task.due_date?.includes('T') ? task.due_date.slice(0, 10) : task.due_date}
                      onChange={(e) => updateTask(task.id, { due_date: e.target.value })}
                      InputProps={{ disableUnderline: true,
                        sx: {
                                fontSize: '13px',
                                '&:hover': { borderBottom: '1px solid lightgray' },
                                '&.Mui-focused': { borderBottom: '1px solid #1976d2' },
                              },
                       }}
                    />
                  </td>
                  <td >
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.assign_to); // set selected task ID
                          setShowGantt(true);              // open modal
                        }}
                      >
                        <FontAwesomeIcon icon={faChartGantt} />
                      </button>


                  </td>
                  <td></td>
                  <td className="px-4 py-2 text-right">
                    <button
                      className="text-gray-500 hover:text-black-800 text-sm"
                      onClick={() => deleteTask(task.id)}
                      color='#1e2939'
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
               {showForm && (
                <tr>
                  <td></td>
                  <td>
                    <TextField
                      variant="standard"
                      label="Task Name"
                      size="small"
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      InputProps={{
                              style: {
                                fontSize: '16px', // Change this to any desired size
                              },
                            }}
                            InputLabelProps={{
                              style: {
                                fontSize: '14px', // Label font size
                              },
                            }}
                    />
                  </td>
                  <td>
                    <FormControl variant="standard" size="small" sx={{ minWidth: 130 }}>
                      <InputLabel>Select User</InputLabel>
                      <Select
                        value={newTask.assigned || ""}
                        onChange={(e) => handleInputChange("assigned", e.target.value)}
                        label="Select User"
                      >
                        <MenuItem value="">Select User</MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.user_id} value={user.name}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  
                  <td>
                    <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newTask.status || ""}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        label="Status"
                        sx={{
                              backgroundColor: 'transparent', // Make the closed select transparent
                              fontSize: '15px',
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  borderRadius: 2,
                                  backgroundColor: 'transparent', // Optional: make dropdown transparent
                                  boxShadow: 'none', // Optional: remove shadow
                                },
                              },
                            }}
                      >
                        {["To Do", "Doing", "Done"].map((status) => {
                            const statusColors = {
                              "To Do": "#fde68a",   // light yellow
                              "Doing": "#bfdbfe",   // light blue
                              "Done": "#bbf7d0",    // light green
                            };

                          return (
                            <MenuItem
                              key={status}
                              value={status}
                              sx={{
                                backgroundColor: statusColors[status],
                                borderRadius: '5px',
                                fontSize: '13px',
                                '&:hover': {
                                  backgroundColor: '',
                                },
                                my: 0.5,
                              }}
                            >
                              {status}
                            </MenuItem>
                          );
                            })}
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                    <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={newTask.priority || ""}
                        onChange={(e) => handleInputChange("priority", e.target.value)}
                      >
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                    <TextField
                      variant="standard"
                      type="date"
                      label="Submission Date"
                      size="small"
                     
                      onChange={(e) => handleInputChange("SubmissionDate", e.target.value)}
                      InputLabelProps={{
                            shrink: true,
                            style: { fontSize: '14px' }, // Label size
                          }}
                          InputProps={{
                            style: {
                              fontSize: '13px',  // Input text size
                              paddingTop: 0,     // Adjust vertical spacing if needed
                              paddingBottom: 0,
                            },
                          }}
                    />
                  </td>
                  <td>
                    <TextField
                      variant="standard"
                      type="date"
                      label="Due Date"
                      size="small"
                     
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      InputLabelProps={{
                            shrink: true,
                            style: { fontSize: '14px' }, // Label size
                          }}
                          InputProps={{
                            style: {
                              fontSize: '13px',  // Input text size
                              paddingTop: 0,     // Adjust vertical spacing if needed
                              paddingBottom: 0,
                            },
                          }}
                    />
                  </td>
                  <td></td>
                  <td className=''>
                    <button
                      className="bg-blue-600 text-white rounded  hover:bg-blue-700"
                      onClick={handleAddTask}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
     {showGantt && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Gantt Chart</h2>
        <button
          className="text-gray-600 hover:text-red-600 text-xl"
          onClick={() => {
            setShowGantt(false);
            setSelectedTaskId(null); // reset on close
          }}
        >
          &times;
        </button>
      </div>

      <GanttView
        tasks={Object.values(taskData).flat()} // pass all tasks
        selectedTaskId={selectedTaskId}        // filter inside component
      />
    </div>
  </div>
)}



      {showDrawer && selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0" onClick={closeDrawer} />
          <div className="w-[400px] bg-white h-full shadow-xl p-6 overflow-y-auto z-50 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Task Details</h2>
              <button className="text-gray-600 hover:text-red-600 text-xl" onClick={closeDrawer}>
                &times;
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p><strong>Task ID:</strong> {selectedTask.task_id}</p>
              <p><strong>Task Name:</strong> {selectedTask.task_name}</p>
              <p><strong>Assigned To:</strong> {selectedTask.assign_to}</p>
              <p><strong>Status:</strong> {selectedTask.status}</p>
              <p><strong>Priority:</strong> {selectedTask.priority}</p>
              <p><strong>Due Date:</strong> {selectedTask.due_date}</p>
              <p><strong>Comment:</strong> {selectedTask.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Taskboard;
