import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, MenuItem, Select, InputLabel, FormControl, OutlinedInput,} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-solid-svg-icons';

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const TABS = ["TODO", "Done"];

const ProjectTableTabs = () => {
  const [activeTab, setActiveTab] = useState("TODO");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);


  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    category: '',
    submisssion_date: '',
    company_name: '',
    assign_to: '',
    members: []
  });

  const [userOptions, setUserOptions] = useState([]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUserOptions(res.data);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEdit
        ? `http://localhost:5000/api/projects/${editingId}`
        : 'http://localhost:5000/api/projects';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(isEdit ? 'Project updated successfully!' : 'Project saved successfully!');
        setFormData({
          projectName: '',
          client: '',
          category: '',
          submisssion_date: '',
          company_name: '',
          assign_to: '',
        });
        setShowModal(false);
        setIsEdit(false);
        setEditingId(null);
      } else {
        alert('Error saving project');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit');
    }
  };

  const handleEditProject = (project) => {
    setFormData({
      projectName: project.name,
      client: project.client,
      category: project.category,
      submisssion_date: project.submisssion_date,
      assign_to: project.assign_to,
      company_name: project.company_name,
      status: project.status,
      members: project.members || []
    });
    setEditingId(project.id);
    setIsEdit(true);
    setShowModal(true);
  };
  // Helper to convert ISO to local date string (YYYY-MM-DD)
const toLocalDate = (isoString) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset); // neutralize timezone
  return date.toISOString().split('T')[0];
};

  return (
    <div className="p-9">
      <div className="flex justify-between mb-6">
        <div className="flex space-x-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-9 py-0 font-semibold ${
                activeTab === tab
                  ? "text-gray-600 bg-white-600 rounded-[3px] h-8 shadow-lg"
                  : "border-2 border-gray-600 text-white bg-gray-600 rounded-[3px] hover:bg-white hover:border-white hover:text-gray-600 hover:shadow-lg h-8"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setFormData({
              projectName: '',
              client: '',
              category: '',
              assign_to: '',
              submisssion_date:'',
              company_name: '',
              members: []
            });
            setIsEdit(false);
            setShowModal(true);
          }}
          className="px-4 py-0 font-semibold border-2 border-gray-600 text-white bg-gray-600 rounded-[3px] hover:bg-white hover:border-white hover:text-gray-600 hover:shadow-lg h-8"
        >
          Create Project
        </button>
      </div>
      <ProjectTable tabName={activeTab} onEdit={handleEditProject} />
      {/* The modal code follows (already included above) */}
       {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b backdrop-blur-sm from-blue-10 to-black">
                <div className="bg-white rounded-lg shadow-lg w-[800px] max-w-2xl p-6 relative">
                  <h2 className="font-semibold mb-4 text-center text-xl pb-7">New Project</h2>
                  <form className="space-y-7" onSubmit={handleSubmit}>
                    <div className="flex gap-4">
        <TextField
        id="project-name"
        label="Project Name"
        variant="outlined"
        fullWidth
        
        value={formData.projectName}
        onChange={(e) =>
          setFormData({ ...formData, projectName: e.target.value })
        }
      />
      
        <TextField
          id="client"
          label="Client"
          variant="outlined"
          fullWidth
          value={formData.client}
          onChange={(e) => setFormData({ ...formData, client: e.target.value })}
        />
      </div>
      <div className="flex gap-4">
        <TextField
          id="category"
          label="Category"
          variant="outlined"
          fullWidth
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
         <TextField
        id="company_name"
        label="Company"
        variant="outlined"
        select
        fullWidth
        value={formData.company_name}
        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
      >
        {["AGPH", "Leela Greens", "Academic Guru", "IJISEM"].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      </div>
      <div className="flex gap-4">
        <FormControl fullWidth>
  <InputLabel id="members-label">Manager By</InputLabel>
  <Select
    labelId="assign_to-label"
    id="assign_to"
    value={formData.assign_to}
    onChange={(e) => setFormData({ ...formData, assign_to: e.target.value })}
    input={<OutlinedInput label="Manager By" />}
  >
    {userOptions.map((user) => (
      <MenuItem key={user.user_id} value={user.user_id}>
        {user.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
      
<TextField
  type="date"
  id="submisssion_date"
  label="Submission Date"
  variant="outlined"
  fullWidth
  value={formData.submisssion_date ? toLocalDate(formData.submisssion_date) : ""}
  onChange={(e) =>
    setFormData({ ...formData, submisssion_date: e.target.value })
  }
  InputLabelProps={{
    shrink: true,
  }}
/>
      </div>
      
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
    </div>
  );
};

const ProjectTable = ({ tabName, onEdit }) => {
  const [projects, setProjects] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userprojectOptions, setUserprojectOptions] = useState([]);
  


  
  

  useEffect(() => {
    const fetchUsersproject = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUserprojectOptions(res.data);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    fetchUsersproject();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects");
        const formatted = res.data.map(project => ({
          ...project,
          members: project.team_members || [],
          updated: '1h ago',
          progress: Math.floor(Math.random() * 100),
        }));
        setProjects(formatted);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/usernames");
        const map = {};
        res.data.forEach(user => {
          map[user.user_id] = user.name;
        });
        setUserMap(map);
      } catch (error) {
        console.error("Failed to load user names:", error);
      }
    };
    fetchUserNames();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project.");
    }
  };

  const handleEdit = (project) => {
    onEdit(project);
  };

  const filtered = projects.filter(p => {
  if (tabName === "TODO") {
    return p.status === "Todo" || p.status === "Doing" || p.status === "Hold";
  }
  else {
    return p.status === tabName;
  }
});
  const sortedProjects = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };
  const navigate = useNavigate();
  const renderTaskStatusSquares = (taskCountJson) => {
  let parsed = {
    "Hold": 0,
    "To Do": 0,
    "Doing": 0,
    "Done": 0
    
  };

  try {
    if (typeof taskCountJson === 'string') {
      const temp = JSON.parse(taskCountJson);
      parsed = { ...parsed, ...temp };
    } else if (typeof taskCountJson === 'object' && taskCountJson !== null) {
      parsed = { ...parsed, ...taskCountJson };
    }
  } catch (e) {
    // fail silently
  }

  const colorMap = {
    'Hold': 'text-gray-300',
    'To Do': 'text-red-300',
    'Doing': 'text-yellow-300',
    'Done': 'text-green-300',
    
    
  };

  return (
    <div className="flex flex-wrap gap-0.5">
      {['Hold','To Do', 'Doing', 'Done'].map((key) =>
        parsed[key] > 0
          ? [...Array(parsed[key])].map((_, idx) => (
              <FontAwesomeIcon
                key={`${key}-${idx}`}
                icon={faSquare}
                className={`text-[9px] ${colorMap[key]}`}
              />
            ))
          : null
      )}
    </div>
  );
};

  return (
     
    <div className="bg-white shadow-md rounded-lg">
      <table className="min-w-full text-xs text-left">
        <thead className="bg-gray-600 text-white sticky top-0 z-10 shadow-md">
          <tr>
            {["Project id", "Client", "Project Name", "Category", "Manage By","Assignees","Progress","DeadLine"].map((label, idx) => (
              <th
                key={idx}
                className="px-3 py-3 cursor-pointer select-none"
                onClick={() => label !== "Members" && handleSort(label.toLowerCase())}
              >
                {label} {sortField === label.toLowerCase() && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            ))}
            <th className="px-3 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedProjects.map((project, index) => {
           
            return (
              <tr
                key={project.id}
                className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer "
                onClick={() => navigate(`/taskboard/${project.project_id}`)}
              >
                <td className="px-3 py-3">{project.project_id}</td>
                <td className="px-3 py-3">{project.client}</td>
                <td className="px-3 py-3">{project.name}</td>
                
                <td className="px-3 py-3">{project.category}</td>
                
                <td className="px-3 py-3">
                  {userprojectOptions.find(u => u.user_id === project.assign_to)?.name || 'Unknown'}
                </td>
                
                  <td className="pl-3">
                    {project.members.length > 0 && (
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-gray-700 bg-gray-200"
                        title={project.members.map((m) => userMap[m] || m).join(', ')}
                      >
                        {project.members.length}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm">
                  {renderTaskStatusSquares(project.no_of_task)}
                </td>
                  <td className="px-3 py-3">
                    {project.submisssion_date
                      ? new Date(project.submisssion_date).toLocaleDateString('en-GB')
                      : ''}
                  </td>
                  <td className="px-3 py-3">
                  <div className="flex items-center space-x-2">
                    <button
                        className="text-gray-600 hover:text-blue-600 border border-gray-300 rounded-[10px] p-1"
                        onClick={(e) => {
                          e.stopPropagation(); // prevents triggering row click
                          handleEdit(project);
                        }}
                    >✏️</button>

                    <button
                      className="text-gray-600 hover:text-red-600 border border-gray-300 rounded-[10px] p-1 px-1"
                      onClick={(e) => {
                        e.stopPropagation(); // prevents triggering row click
                        handleDelete(project.id);
                      }}
                    >🗑️</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-between items-center p-3 text-sm bg-gray-50">
        <div>Page <b>{currentPage}</b> of <b>{totalPages}</b></div>
        <div className="flex items-center gap-4">
          <button
            className="text-blue-600 disabled:text-gray-400"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          >{"<"}</button>
          <button
            className="text-blue-600 disabled:text-gray-400"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          >{">"}</button>
          <select
            className="border px-2 py-1 rounded"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((count) => (
              <option key={count} value={count}>{count} / page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectTableTabs;
