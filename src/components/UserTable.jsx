import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', id: null });
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEdit = (user) => {
    setForm({ ...user });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this user?')) return;
    await axios.delete(`http://localhost:5000/api/users/${id}`);
    fetchUsers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.id) {
      await axios.put(`http://localhost:5000/api/users/${form.id}`, form);
    } else {
      await axios.post('http://localhost:5000/api/users', form);
    }
    setShowModal(false);
    setForm({ name: '', email: '', password: '', id: null });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="rounded-lg  p-9">
      <div className="flex justify-between mb-5">
        <h2 className="text-xl font-medium text-gray-600">Users</h2>
        <button
          className="px-4 py-1 font-semibold border-2 border-gray-600 text-white bg-gray-600 rounded hover:bg-white hover:text-gray-600"
          onClick={() => {
            setForm({ name: '', email: '', password: '', id: null });
            setShowModal(true);
          }}
        >
          Create User
        </button>
      </div>

      <table className="min-w-full text-sm text-left bg-white">
        <thead className="bg-gray-600 text-white sticky top-0">
          <tr>
            <th className="px-3 py-3">User ID</th>
            <th className="px-3 py-3">Name</th>
            <th className="px-3 py-3">Email</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-100">
              <td className="px-3 py-2">{user.user_id}</td>
              <td className="px-3 py-2">{user.name}</td>
              <td className="px-3 py-2">{user.email}</td>
              <td className="px-3 py-2">
                <div className="flex items-center space-x-4 text-lg">
                  <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50 bg-gradient-to-b backdrop-blur-sm from-blue-10 to-black">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {form.id ? 'Edit User' : 'Create User'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required={!form.id}
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {form.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
