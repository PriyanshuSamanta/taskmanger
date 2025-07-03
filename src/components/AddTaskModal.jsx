import React from 'react';
import { TextField, MenuItem, Select, InputLabel, FormControl, OutlinedInput,} from '@mui/material';


const AddTaskModal = ({ show, onClose, newTask, setNewTask, onSave, users }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b backdrop-blur-sm from-blue-10 to-black">
      <div className="bg-white p-6 rounded-lg w-[800px] space-y-4 shadow-xl">
        <h2 className="text-lg font-semibold">Add New Task</h2>

        {/* Row 1: Task Name, Project ID, Due Date */}
        <div className="flex gap-4">
          <TextField
            label="Task Name"
            fullWidth
            value={newTask.task_name}
            onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
          />
          
          <TextField
            type="date"
            label="Deadline"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />
        </div>

        {/* Row 2: Assign To, Status, Priority */}
        <div className="flex gap-4">
          <FormControl fullWidth>
            <InputLabel >Assign To</InputLabel>
            <Select
              value={newTask.assign_to}
              onChange={(e) => setNewTask({ ...newTask, assign_to: e.target.value })}
              input={<OutlinedInput label="Assign To" />}
              
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.name}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel >Priority</InputLabel>
            <Select
              
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              input={<OutlinedInput label="Priority" />}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Row 3: Comment */}
       

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded text-sm border border-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1 rounded text-sm bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
