import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "../StyleSheets/BlogTopicPage.css";
import { useAuth } from "../AuthContext";
import NewBlogPost from "./NewBlogPost";

const BlogTopicPage = () => {
  const { topic } = useParams();
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicBlogs, setTopicBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const { user } = useAuth();
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const addNewBlog = async (blogData) => {
    try {
      const response = await axios.post(
        `${API_URL}/blogs`,
        {
          ...blogData,
          topic: topic,
        },
        {
          withCredentials: true,
        }
      );

      setTopicBlogs((prevBlogs) => [response.data, ...prevBlogs]);
      setShowNewPostForm(false);
    } catch (error) {
      console.error("Error creating blog:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  useEffect(() => {
    fetchTopicAndBlogs();
  }, [topic]);

  const fetchTopicAndBlogs = async () => {
    try {
      const topicResponse = await axios.get(
        `${API_URL}/trending/trending-topics`
      );

      const matchingTopic = topicResponse.data.find(
        (t) => encodeURIComponent(t.name) === encodeURIComponent(topic)
      );

      if (matchingTopic) {
        setCurrentTopic(matchingTopic);
      }

      const blogsResponse = await axios.get(
        `${API_URL}/blogs/topic/${encodeURIComponent(topic)}`
      );

      setTopicBlogs(blogsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch blogs for this topic");
      setLoading(false);
    }
  };

  const handleAddNewPost = () => {
    if (user) {
      setShowNewPostForm(true);
    } else {
      window.location.href = "/login";
    }
  };

  if (loading)
    return (
      <div className="page-container">
        <Navbar showLoginButton={true} />
        <div className="blog-topic-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-container">
        <Navbar showLoginButton={true} />
        <div className="blog-topic-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );

  return (
    <div className="page-container">
      <Navbar showLoginButton={true} />
      <div className="blog-topic-content">
        <div className="topic-header-container">
          <h1 className="full-topic-title">{topic}</h1>
          <button onClick={handleAddNewPost} className="add-new-post-button">
            Add New Post
          </button>
        </div>

        <p className="full-topic-description">{currentTopic.description}</p>

        {showNewPostForm && (
          <NewBlogPost
            onSubmit={addNewBlog}
            onCancel={() => setShowNewPostForm(false)}
          />
        )}

        <div className="blogs-container">
          {topicBlogs.length > 0 ? (
            topicBlogs.map((blog) => (
              <div key={blog._id} className="blog-card">
                <div className="blog-card-header">
                  <h2 className="blog-card-title">{blog.title}</h2>
                  <div className="blog-meta">
                    <span className="blog-date">
                      {formatDate(blog.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="blog-card-preview">
                  {blog.content.substring(0, 200)}...
                </p>

                <div className="blog-card-actions">
                  <Link to={`/blog/${blog._id}`} className="read-more-link">
                    Read More
                  </Link>
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
              </div>
            ))
          ) : (
            <div className="no-blogs-message">
              <p>No blogs have been posted about this topic yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogTopicPage;
