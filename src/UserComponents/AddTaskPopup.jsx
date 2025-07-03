import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  InputLabel,
  FormControl,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddTaskPopup = ({ onClose }) => {
  const [taskType, setTaskType] = useState('Single');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  return (
    <div className="fixed inset-0 bg-gradient backdrop-blur-sm from-blue-10 to-black  z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          className="!absolute !top-2 !right-2 !text-gray-500 hover:!text-black"
        >
          <CloseIcon />
        </IconButton>

        <h2 className="text-xl font-bold mb-6">Add New Task</h2>

        <form className="space-y-4 ">
          {/* Task Name */}
          <TextField
            fullWidth
            label="Task Name"
            variant="outlined"
            size="small"
          />

          {/* Task Type + Project ID (conditionally shown) */}
          <div className="flex gap-4 mt-6">
            <div className={taskType === 'Current' ? 'w-1/2' : 'w-full'}>
              <FormControl fullWidth size="small">
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={taskType}
                  label="Task Type"
                  onChange={(e) => setTaskType(e.target.value)}
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Current">Current</MenuItem>
                </Select>
              </FormControl>
            </div>

            {taskType === 'Current' && (
              <div className="w-1/2">
                <TextField
                  fullWidth
                  label="Project ID"
                  variant="outlined"
                  size="small"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Priority + Due Date in one row */}
          <div className="flex gap-4 mt-6">
            <div className="w-1/3">
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">Urgent</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="w-1/3">
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                size="small"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="w-1/3">
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                size="small"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="!mt-2"
            
          >
            Save Task
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskPopup;
