import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentPopup = ({ show, onClose, taskId }) => {
  const [commentText, setCommentText] = useState('');
  const [allComments, setAllComments] = useState([]);

 

  const handleAddComment = () => {
    if (commentText.trim()) {
      axios.post(`http://localhost:5000/api/tasks/${taskId}/comments`, { newComment: commentText })
        .then(res => setAllComments(Array.isArray(res.data.comments) ? res.data.comments : []))
        .catch(err => console.error(err));
      setCommentText('');
    }
  };
   useEffect(() => {
  if (show && taskId) {
    axios.get(`http://localhost:5000/api/tasks/${taskId}/comments`)
      .then(res => {
       
        setAllComments(Array.isArray(res.data.comments) ? res.data.comments : []);
         console.log('Fetched comments:', res.data.comments);
      })
      .catch(err => console.error(err));
  }
}, [show, taskId]);

  if (!show) return null;
  
  

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b backdrop-blur-sm from-blue-10 to-black flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Comments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">&times;</button>
        </div>

        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
          
          {allComments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
          {allComments.map((cmt, idx) => (
            <div key={idx} className="bg-gray-100 p-2 rounded text-sm">{cmt}</div>
          ))}
        </div>

        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-2"
          rows="3"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => {
  const value = e.target.value;
  const filtered = value.replace(/["',]/g, '');
  setCommentText(filtered);
}}
        />

        <button
          onClick={handleAddComment}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default CommentPopup;
