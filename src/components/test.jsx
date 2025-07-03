import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useEffect } from 'react';
import axios from 'axios'; 




const Taskboard = () => {
          const { projectId } = useParams();
  
          const initialTaskData = {
            "To Do": [],
            "Doing": [],
            "Done": []
          };

          const [taskData, setTaskData] = useState(initialTaskData);
          const [openSections, setOpenSections] = useState({
            "To Do": true,
            "Doing": true,
            "Done": true,
          });

          const [newTask, setNewTask] = useState({});
          const [showForm, setShowForm] = useState({});
          const [users, setUsers] = useState([]);

          useEffect(() => {
            axios.get('http://localhost:5000/api/users')
              .then(res => setUsers(res.data))
              .catch(err => console.error('Error fetching users:', err));
          }, []);

          useEffect(() => {
            axios.get(`http://localhost:5000/api/tasks/${projectId}`)
              .then(res => {
                const organized = { "To Do": [], "Doing": [], "Done": [] };
                res.data.forEach(task => {
                  const section = task.status;
                  if (!organized[section]) organized[section] = [];
                  organized[section].push({
                    id: task.id,
                    task_id: task.task_id,
                    name: task.task_name,
                    assigned: task.assign_to,
                    comment: task.comment,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.due_date,
                  });
                });
                setTaskData(organized);
              })
              .catch(err => console.error('Error loading tasks:', err));
          }, [projectId]);

          const toggleSection = (section) => {
            setOpenSections((prev) => ({
              ...prev,
              [section]: !prev[section],
            }));
          };

          const handleInputChange = (section, field, value) => {
            setNewTask((prev) => ({
              ...prev,
              [section]: {
                ...prev[section],
                [field]: value,
              },
            }));
          };

          const handleAddTask = (section) => {
            const task = newTask[section];
            if (!task || !task.name) return;
          
            const newTaskObj = {
              task_id: `TK${Math.floor(1000 + Math.random() * 9000)}${(task.name || '')
              .replace(/[^a-zA-Z]/g, '')
              .toUpperCase()
              .slice(0, 3) || 'XYZ'}`,
              task_name: task.name,
              assign_to: task.assigned,
              comment: task.comment,
              status: task.status || section,
              priority: task.priority,
              due_date: task.dueDate,
              project_id: projectId,
            };

            axios.post('http://localhost:5000/api/tasks', newTaskObj)
              .then((res) => {
                const dbId = res.data.id;
                setTaskData(prev => ({
                  ...prev,
                  [section]: [...prev[section], {
                    ...task,
                    id: dbId,
                    status: section,
                  }],
                }));
                setNewTask(prev => ({ ...prev, [section]: {} }));
                setShowForm(prev => ({ ...prev, [section]: false }));
              })
              .catch(err => console.error('Error adding task:', err));
          };

          const [selectedTask, setSelectedTask] = useState(null);
          const [showDrawer, setShowDrawer] = useState(false);
          
          const openDrawer = (task) => {
            setSelectedTask(task);
            setShowDrawer(true);
          };
          
          const closeDrawer = () => {
            setShowDrawer(false);
            setSelectedTask(null);
          };

    return (
        <div>

          <h1 className=" text-xl font-bold mt-4 ml-10">Project ID: {projectId}</h1>

          <div className="max-w-full mx-auto p-10 space-y-6">
              {Object.keys(taskData).map((section) => (
                <div key={section} className="rounded-xl ">
                  <div className="flex justify-between items-center px-4 py-3  rounded-t-xl">
                    <button
                      onClick={() => toggleSection(section)}
                      className="flex items-center text-left"
                    >
                      <span className="text-lg font-semibold text-gray-800">{section}</span>
                      <svg
                        className={`h-5 w-5 ml-3 transform transition-transform duration-300 ${
                          openSections[section] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        setShowForm((prev) => ({
                          ...prev,
                          [section]: !prev[section],
                        }))
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ➕ Add Task
                    </button>
            </div>

            {openSections[section] && (
              <div className="overflow-x-auto bg-white border-t border-gray-200">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-200 text-gray-800 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Task ID</th>
                      <th className="px-4 py-3">Task Name</th>
                      <th className="px-4 py-3">Assigned</th>
                      <th className="px-4 py-3">Comment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskData[section].map((task) => (
                      <tr key={task.id} className="border-b border-b-gray-300  hover:bg-gray-50">
                        <td 
                          className="px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                          onClick={() => openDrawer(task)}
                        >
                          {task.task_id}
                        </td>

                        <td className="px-4 py-2">
                          <TextField
                            variant="standard"
                            size="small"
                            value={task.name}
                            onChange={(e) => {
                              const updatedName = e.target.value;

                              // Update local state
                              setTaskData((prev) => ({
                                ...prev,
                                [section]: prev[section].map((t) =>
                                  t.id === task.id ? { ...t, name: updatedName } : t
                                ),
                              }));

                              // Update backend
                              axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
                                task_name: updatedName,
                                assign_to: task.assigned,
                                comment: task.comment,
                                status: task.status,
                                priority: task.priority,
                                due_date: task.dueDate,
                              }).catch(err => console.error('Error updating task name:', err));
                            }}
                            InputProps={{
                              disableUnderline: true,
                              sx: {
                                fontSize: '13px',
                                '&:hover': { borderBottom: 'none' },
                                '&.Mui-focused': { borderBottom: 'none' },
                              },
                            }}
                            sx={{ minWidth: 120 }}
                          />
                        </td>

                        <td className="px-4 py-2">
                          <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={task.assigned}
                              onChange={(e) => {
                          const updatedAssigned = e.target.value;
                          setTaskData((prev) => ({
                            ...prev,
                            [section]: prev[section].map((t) =>
                              t.id === task.id ? { ...t, assigned: updatedAssigned } : t
                            ),
                          }));
                          axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
                            task_name: task.name,
                            assign_to: updatedAssigned,
                            comment: task.comment,
                            status: task.status,
                            priority: task.priority,
                            due_date: task.dueDate,
                          }).catch(err => console.error('Error updating assign_to:', err));
                          }}
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
                        </td>

                        <td className="px-4 py-2">
                          <TextField
                              variant="standard"
                              size="small"
                              value={task.comment}
                              onChange={(e) => {
                            const updatedComment = e.target.value;
                            setTaskData((prev) => ({
                              ...prev,
                              [section]: prev[section].map((t) =>
                                t.id === task.id ? { ...t, comment: updatedComment } : t
                              ),
                            }));
                            axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
                              task_name: task.name,
                              assign_to: task.assigned,
                              comment: updatedComment,
                              status: task.status,
                              priority: task.priority,
                              due_date: task.dueDate,
                            }).catch(err => console.error('Error updating comment:', err));
                            }}

                                InputProps={{
                            disableUnderline: true,
                            sx: {
                              fontSize: '13px',
                              '&:hover': { borderBottom: 'none' },
                              '&.Mui-focused': { borderBottom: 'none' },
                            },
                          }}
                          sx={{ minWidth: 120 }}
                            />
                          </td>

                          <td className="px-4 py-2">
                            <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={task.status}
                                disableUnderline
                                onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus === task.status) return;

                              setTaskData((prev) => {
                                const updatedPrev = { ...prev };
                                updatedPrev[section] = updatedPrev[section].filter((t) => t.id !== task.id);
                                updatedPrev[newStatus] = [
                                  ...(updatedPrev[newStatus] || []),
                                  { ...task, status: newStatus },
                                ];
                                return updatedPrev;
                              });

                                axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
                                  task_name: task.name,
                                  assign_to: task.assigned,
                                  comment: task.comment,
                                  status: newStatus,
                                  priority: task.priority,
                                  due_date: task.dueDate,
                                }).catch(err => console.error('Error updating status:', err));
                              }}

                              sx={{
                                fontSize: '13px',
                                borderRadius: '10px',
                                textAlign: 'center',
                                paddingTop: '5px',
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
                                    backgroundColor: task.status === status ? statusColors[status] : statusColors[status],
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

                        <td className="px-4 py-2">
 <td className="px-4 py-2">
  <FormControl variant="standard" size="small" sx={{ minWidth: 80 }}>
    <Select
      value={task.priority}
      disableUnderline
      onChange={(e) => {
        const updatedPriority = e.target.value;
        setTaskData((prev) => ({
          ...prev,
          [section]: prev[section].map((t) =>
            t.id === task.id ? { ...t, priority: updatedPriority } : t
          ),
        }));
        axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
          task_name: task.name,
          assign_to: task.assigned,
          comment: task.comment,
          status: task.status,
          priority: updatedPriority,
          due_date: task.dueDate,
        }).catch(err => console.error('Error updating priority:', err));
      }}
      sx={{
        fontSize: '13px',
        textAlign: 'center',
        borderRadius: '10px',
        paddingTop: '5px',
        backgroundColor:
          task.priority === "Low"
            ? "#d1fae5"
            : task.priority === "Medium"
            ? "#fef08a"
            : task.priority === "High"
            ? "#fca5a5"
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
            mt: 1,
            boxShadow: 'none',
            backgroundColor: 'white',
          },
        },
      }}
    >
      <MenuItem
        value="Low"
        sx={{
          fontSize: '13px',
          backgroundColor: '#d1fae5',
          borderRadius: '10px',
          my: 0.5,
        }}
      >
        Low
      </MenuItem>
      <MenuItem
        value="Medium"
        sx={{
          fontSize: '13px',
          backgroundColor: '#fef08a',
          borderRadius: '10px',
          my: 0.5,
        }}
      >
        Medium
      </MenuItem>
      <MenuItem
        value="High"
        sx={{
          fontSize: '13px',
          backgroundColor: '#fca5a5',
          borderRadius: '10px',
          my: 0.5,
        }}
      >
        High
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

</td>


                        <td className="px-4 py-2">
                          <TextField
                          variant="standard"
                          type="date"
                          size="small"
                          value={task.dueDate && task.dueDate.includes('T') ? task.dueDate.slice(0, 10) : task.dueDate}
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) => {
                            const updatedDueDate = e.target.value;
                            setTaskData((prev) => ({
                              ...prev,
                              [section]: prev[section].map((t) =>
                                t.id === task.id ? { ...t, dueDate: updatedDueDate } : t
                              ),
                            }));

                              axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
                                task_name: task.name,
                                assign_to: task.assigned,
                                comment: task.comment,
                                status: task.status,
                                priority: task.priority,
                                due_date: updatedDueDate,
                              }).catch(err => console.error('Error updating due date:', err));
                            }}
                            InputProps={{
                              disableUnderline: true,
                              sx: {
                                fontSize: '13px',
                                '&:hover': { borderBottom: '1px solid lightgray' },
                                '&.Mui-focused': { borderBottom: '1px solid #1976d2' },
                              },
                            }}
                            sx={{ minWidth: 120 }}
                          />
                      </td>
                      <td></td>
                    </tr>
                    ))}
                    {showForm[section] && (
                      <tr>
                        <td></td>

                        <td>
                          <TextField
                            variant="standard"
                            label="Task Name"
                            size="small"
                            onChange={(e) => handleInputChange(section, "name", e.target.value)}
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
                              value={newTask[section]?.assigned || ""}
                              onChange={(e) => handleInputChange(section, "assigned", e.target.value)}
                              label="Select User"
                            >
                              <MenuItem  value="">
                                Select User
                              </MenuItem>
                              {users.map((user) => (
                                <MenuItem key={user.user_id} value={user.name}>
                                  {user.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </td>

                        <td>
                          <TextField
                            variant="standard"
                            label="Comment"
                            size="small"
                            onChange={(e) => handleInputChange(section, "comment", e.target.value)}
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
                          <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={newTask[section]?.status || ""}
                            onChange={(e) => handleInputChange(section, "status", e.target.value)}
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
                            value={newTask[section]?.priority || ""}
                            onChange={(e) => handleInputChange(section, "priority", e.target.value)}
                            label="Priority"
                          >
                            <MenuItem value=""><em>Priority</em></MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Urgent">Urgent</MenuItem>
                          </Select>
                        </FormControl>
                      </td>

                      <td>
                        <TextField
                          variant="standard"
                          type="date"
                          label="Due Date"
                          size="small"
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
                          className="px-2 pt-1" // Optional Tailwind padding
                          onChange={(e) => handleInputChange(section, "dueDate", e.target.value)}
                        />
                    </td>

                    <td>
                      <button
                        className="bg-blue-600 text-white rounded px-1 py-0 hover:bg-blue-700"
                        onClick={() => handleAddTask(section)}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Drawer Sidebar */}
{showDrawer && selectedTask && (
  <div className="fixed inset-0 z-50 flex justify-end">
    {/* Overlay */}
    <div 
      className="fixed inset-0 " 
      onClick={closeDrawer}
    />

    {/* Drawer Panel */}
    <div className="w-[400px] bg-white h-full shadow-xl p-6 overflow-y-auto z-50 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Task Details</h2>
        <button 
          className="text-gray-600 hover:text-red-600 text-xl"
          onClick={closeDrawer}
        >
          &times;
        </button>
      </div>

      {/* Task Info */}
      <div className="space-y-4 text-sm">
        <p><strong>Task ID:</strong> {selectedTask.task_id}</p>
        <p><strong>Task Name:</strong> {selectedTask.name}</p>
        <p><strong>Assigned To:</strong> {selectedTask.assigned}</p>
        <p><strong>Status:</strong> {selectedTask.status}</p>
        <p><strong>Priority:</strong> {selectedTask.priority}</p>
        <p><strong>Due Date:</strong> {selectedTask.dueDate}</p>
        <p><strong>Comment:</strong> {selectedTask.comment}</p>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Taskboard;
