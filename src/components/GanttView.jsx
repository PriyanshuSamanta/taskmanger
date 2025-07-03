import React from 'react';
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const GanttView = ({ tasks, selectedTaskId }) => {
  const today = new Date();

const filteredTasks = tasks.filter(task => task.assign_to === selectedTaskId);

  const formattedTasks = filteredTasks.length > 0
    ? filteredTasks.map((task, i) => ({
        id: task.task_id || `TK-${i}`,
        name: task.task_name || 'Untitled Task',
        start: new Date(task.dueDate || today),
        end: new Date(task.dueDate || today),
        type: "task",
        progress: 50,
        dependencies: "",
        project: task.project_id || "",
        isDisabled: false,
      }))
    : [
        {
          id: "EMPTY",
          name: "No Task Found",
          start: today,
          end: today,
          type: "task",
          progress: 0,
          dependencies: "",
          project: "",
          isDisabled: true,
        },
      ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-full overflow-x-auto">
      <Gantt tasks={formattedTasks} viewMode="Day" listCellWidth="" />
    </div>
  );
};

export default GanttView;
