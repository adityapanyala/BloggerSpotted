import React, { useState } from "react";
import axios from "axios";
import "../StyleSheets/NewBlogPost.css";

const API_URL = import.meta.env.VITE_API_URL;

const NewBlogPost = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const clearBlog = (x) => {
    setContent("");
    setTitle("");
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first!");
      return;
    }

    setIsGenerating(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      console.log("Sending image:", selectedFile);
      const response = await axios.post(`${API_URL}/ai/imageai`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log("Server response:", response.data);

      if (response.data && response.data.blogPost) {
        setContent(response.data.blogPost);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(
        `Failed to generate blog: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceContent = async () => {
    setIsEnhancing(true);
    setOriginalContent(content);
    try {
      const response = await axios.post(
        `${API_URL}/ai/enhance`,
        { content },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.enhancedContent) {
        const { enhancedTitle, enhancedBody } = response.data.enhancedContent;
        setTitle(enhancedTitle);
        setContent(enhancedBody);
      } else {
        throw new Error("No enhanced content received");
      }
    } catch (error) {
      console.error("Error enhancing content:", error);
      alert(
        `Failed to enhance content: ${
          error.response?.data?.message || "Please try again"
        }`
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const revertContent = () => {
    if (originalContent) {
      setContent(originalContent);
      setOriginalContent("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content });
    setTitle("");
    setContent("");
    setOriginalContent("");
    setFile(null);
  };

  return (
    <div className="new-blog-post">
      <h2>Create New Blog Post</h2>
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

        <div className="image-upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={!selectedFile || isGenerating}
            className="generate-btn"
          >
            {isGenerating ? "Generating..." : "Generate Blog from Image"}
          </button>
        </div>

        {generatedBlog && (
          <div>
            <img
              src={generatedBlog.image}
              alt="Uploaded"
              style={{ maxWidth: "300px" }}
            />
            <textarea
              value={generatedBlog.aiGeneratedContent}
              onChange={(e) =>
                setGeneratedBlog({
                  ...generatedBlog,
                  aiGeneratedContent: e.target.value,
                })
              }
              rows={10}
              cols={50}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleEnhanceContent}
          disabled={isEnhancing}
        >
          {isEnhancing ? "Enhancing..." : "Enhance Content"}
        </button>

        {originalContent && (
          <button type="button" onClick={revertContent} className="revert-btn">
            Revert Changes
          </button>
        )}

        <button onClick={clearBlog}>Clear</button>

        <div className="form-buttons">
          <button type="submit">Post</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewBlogPost;
