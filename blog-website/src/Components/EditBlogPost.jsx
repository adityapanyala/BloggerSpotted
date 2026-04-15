import React, { useState, useEffect } from "react";
import axios from "axios";
import "../StyleSheets/NewBlogPost.css";

const API_URL = import.meta.env.VITE_API_URL;

const EditBlogPost = ({ blog, onCancel, onUpdate }) => {
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/blogs/${blog._id}`, {
        title,
        content,
      });
      onUpdate(response.data.blog);
      onCancel();
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  return (
    <div className="new-blog-post">
      <h2>Edit Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Blog Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <div className="form-buttons">
          <button type="submit">Update</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogPost;
