import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddTaskModal from './AddTaskModal';
import CommentPopup from './CommentPopup';
import {faComment } from '@fortawesome/free-solid-svg-icons';


const AllTaskTable = () => {
          const [activeCommentTaskId, setActiveCommentTaskId] = useState(null);

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

          const [users, setUsers] = useState([]);
          const [showAddTaskModal, setShowAddTaskModal] = useState(false);
          const [newTask, setNewTask] = useState({
            task_id: '',
            task_name: '',
            assign_to: '',
            status: 'To Do',
            comment: '',
            priority: '',
            due_date: '',
          });
          const handleAddTask = async () => {
            try {
              await axios.post('http://localhost:5000/api/alltaskadd', newTask);
              setShowAddTaskModal(false);
              setNewTask({
                task_id: '',
                task_name: '',
                assign_to: '',
                status: 'To Do',
                comment: '',
                priority: '',
                due_date: '',
              });

          // Refresh task list
          const res = await axios.get(`http://localhost:5000/api/alltask`);
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
              subMissionDate: task.submission_date,
              project_id: task.project_id,
            });
          });
            setTaskData(organized);
          } catch (err) {
            console.error('Error adding task:', err);
          }
        };

          useEffect(() => {
            axios.get('http://localhost:5000/api/users')
              .then(res => setUsers(res.data))
              .catch(err => console.error('Error fetching users:', err));
          }, []);

          useEffect(() => {
            axios.get(`http://localhost:5000/api/alltask`)
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
                    subMissionDate: task.submission_date,
                    project_id: task.project_id,
                  });
                });
                setTaskData(organized);
              })
              .catch(err => console.error('Error loading tasks:', err));
          }, []);

          const toggleSection = (section) => {
            setOpenSections((prev) => ({
              ...prev,
              [section]: !prev[section],
            }));
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
        <div className="overflow-y-auto scrollbar-hide h-140 bg-gray-50">
          <div className="max-w-full mx-auto space-y-6">
              {Object.keys(taskData).map((section) => (
                <div key={section} className="rounded-xl ">
                  <div className="flex justify-between items-center px-9 pt-3  rounded-t-xl">
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
                  {section === 'To Do' && (
                        <button
                          className="text-gray-800 px-3 py-1 rounded text-sm"
                          onClick={() => setShowAddTaskModal(true)}
                        >
                          ➕ Add Task
                        </button>
                      )}         
                             </div>

            {openSections[section] && (
              <div className="pl-4 pt-4">
                <table className="bg-white min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-200 text-gray-800 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3">Project ID</th>
                      <th className="px-4 py-3">Task ID</th>
                      <th className="px-4 py-3">Task Name</th>
                      <th className="px-4 py-3">Assigned</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Submission Date</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskData[section].map((task) => (
                      <tr key={task.id} className="border-b border-b-gray-300  hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {task.project_id || "SINGLETASK"}
                        </td>
                        <td 
                          className="px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                          onClick={() => openDrawer(task)}
                        >
                          {task.task_id}
                        </td>

                        <td className="px-4 py-2 flex">
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
                                submission_date: task.subMissionDate,
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
                            sx={{ minWidth: 100 }}
                          />

                           {(() => {
                              let commentArray = [];
                              try {
                                commentArray = JSON.parse(task.comment);
                              } catch (e) {
                                commentArray = [];
                              }
                              const commentCount = Array.isArray(commentArray) ? commentArray.length : 0;
                              return (
                                <div className="">
                            
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
                            submission_date: task.subMissionDate,
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
                            <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={task.status}
                                disableUnderline
                                IconComponent={null} 
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
                                  submission_date: task.subMissionDate,
                                }).catch(err => console.error('Error updating status:', err));
                              }}

                              sx={{
                                fontSize: '13px',
                                borderRadius: '10px',
                                textAlign: 'center',
                                paddingTop: '5px',
                                paddingLeft: '15%',
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

  <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
    <Select
      value={task.priority}
      disableUnderline
      IconComponent={null} 
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
          submission_date: task.subMissionDate,
        }).catch(err => console.error('Error updating priority:', err));
      }}
      sx={{
        fontSize: '13px',
        textAlign: 'center',
        borderRadius: '10px',
        paddingTop: '5px',
        paddingLeft: '15%',
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
            mt: 1,
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
                          value={task.subMissionDate && task.subMissionDate.includes('T') ? task.subMissionDate.slice(0, 10) : task.subMissionDate}
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) => {
                            const updatedsubMissionDate = e.target.value;
                            setTaskData((prev) => ({
                              ...prev,
                              [section]: prev[section].map((t) =>
                                t.id === task.id ? { ...t, subMissionDate: updatedsubMissionDate } : t
                              ),
                            }));

                              axios.put(`http://localhost:5000/api/tasks/${task.id}`, {
                                task_name: task.name,
                                assign_to: task.assigned,
                                comment: task.comment,
                                status: task.status,
                                priority: task.priority,
                                due_date: task.dueDate,
                                submission_date: updatedsubMissionDate,
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
                                submission_date: task.subMissionDate,
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
                   
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

         <AddTaskModal
  show={showAddTaskModal}
  onClose={() => setShowAddTaskModal(false)}
  newTask={newTask}
  setNewTask={setNewTask}
  onSave={handleAddTask}
  users={users}
/>
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
    
  )
}

export default AllTaskTable