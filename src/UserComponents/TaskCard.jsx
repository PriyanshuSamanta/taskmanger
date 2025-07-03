import React, { useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';

const TaskCard = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [tasks, setTasks] = useState([{ id: 1, title: 'work' }]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask }]);
      setNewTask('');
    }
  };

  return (
    <div className="w-102 bg-gray-100 border border-gray-100 rounded-lg shadow p-4 ml-10 min-h-100 shadow-xl">
      {/* Header with switcher */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2 text-sm font-semibold">
          <button
            className={`px-2 py-1 rounded ${
              activeTab === 'single' ? 'bg-gray-200' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('single')}
          >
            Single Task
          </button>
          <button
            className={`px-2 py-1 rounded ${
              activeTab === 'due' ? 'bg-gray-200' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('due')}
          >
            Due Task
          </button>
        </div>
        <FaSyncAlt className="text-gray-500 cursor-pointer hover:rotate-90 transition-transform duration-300" />
      </div>

      {/* Task Input */}
      <div className="mb-3">
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Search ..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
      </div>

      {/* Task List */}
      {activeTab === 'single' && (
        <ul>
         
        </ul>
      )}

      {activeTab === 'due' && (
        <p className="text-sm text-gray-500 italic">No due tasks.</p>
      )}
    </div>
  );
};

export default TaskCard;
