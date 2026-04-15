import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";
import Navbar from "./Navbar";
import "../StyleSheets/Profile.css";
import NewBlogPost from "./NewBlogPost";
import EditBlogPost from "./EditBlogPost";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export const Profile = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showEditPostForm, setShowEditPostForm] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    if (user) {
      fetchUserBlogs();
    }
  }, [user]);

  const fetchUserBlogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs/user/${user._id}`);
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
    }
  };

  const summarizeBlog = async (blogId, content) => {
    try {
      const response = await axios.post(`${API_URL}/ai/summarize`, {
        text: content,
      });
      setSummaries((prev) => ({
        ...prev,
        [blogId]: response.data.summary,
      }));
    } catch (error) {
      console.error("Error summarizing blog:", error);
    }
  };

  const clearSummary = (blogId) => {
    setSummaries((prev) => {
      const newSummaries = { ...prev };
      delete newSummaries[blogId];
      return newSummaries;
    });
  };

  const deleteBlog = async (id) => {
    try {
      await axios.delete(`${API_URL}/blogs/${id}`);
      fetchUserBlogs();
    } catch (error) {
      console.error("Error deleting blog: ", error);
    }
  };

  const editBlog = (blog) => {
    setShowEditPostForm(true);
    setCurrentBlog(blog);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleUpdateBlog = (updatedBlog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === updatedBlog._id ? updatedBlog : blog
      )
    );
  };

  if (!user) {
    return (
      <div className="no-user-message">Please log in to view your profile.</div>
    );
  }

  return (
    <div className="page-container">
      <Navbar showLoginButton={true} />
      <div className="profile-content">
        <div className="profile-header">
          <h1>Your Profile</h1>
        </div>
        <div className="my-blogs-section">
          <h2>Blog Posts</h2>
          <div className="blogs-grid">
            {showEditPostForm && currentBlog && (
              <EditBlogPost
                blog={currentBlog}
                onCancel={() => {
                  setShowEditPostForm(false);
                  setCurrentBlog(null);
                }}
                onUpdate={handleUpdateBlog}
              />
            )}
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <div key={blog._id} className="blog-card">
                  <h3>{blog.title}</h3>
                  <p className="blog-topic">Topic: {blog.topic}</p>
                  <p className="blog-preview">
                    {blog.content.substring(0, 150)}...
                  </p>
                  <p className="blog-date">
                    Posted on: {formatDate(blog.createdAt)}
                  </p>
                  <Link to={`/blog/${blog._id}`} className="read-more-link">
                    Read More
                  </Link>
                  <div className="button-group">
                    <button
                      onClick={() => deleteBlog(blog._id)}
                      className="delete-button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-trash"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M3 6h18" />
                        <path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                      Delete
                    </button>
                    <button
                      className="update-button"
                      onClick={() => {
                        editBlog(blog);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-pencil"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 20h9" />
                        <path d="M16.5 3l4.5 4.5-1.5 1.5-4.5-4.5z" />
                        <path d="M3 21v-6.5L15.5 3l4.5 4.5L7.5 21H3z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      setLoadingSummary(true);
                      await summarizeBlog(blog._id, blog.content);
                      setLoadingSummary(false);
                    }}
                    className="summarize-btn"
                  >
                    Summarize
                  </button>
                  {summaries[blog._id] && (
                    <div className="summary-container">
                      <p className="blog-summary">{summaries[blog._id]}</p>
                      <button
                        onClick={() => clearSummary(blog._id)}
                        className="clear-summary-btn"
                      >
                        Clear Summary
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-blogs-message">
                You haven't posted any blogs yet.
              </p>
            )}
          </div>
        </div>
      </div>
      {showNewPostForm && (
        <NewBlogPost
          onCancel={() => {
            setShowNewPostForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
