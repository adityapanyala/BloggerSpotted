import express from "express";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const hf = new HfInference(process.env.HF_API_KEY);

router.post("/enhance", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const prompt = `
    As an expert editor, enhance the following blog post while maintaining its original message, style, and personal voice. 
    Make it more engaging and professional, improve clarity and flow, but keep the core content intact.
    Do not change the content of the blog post, only enhance it. The blog post should have the same opinion and message as the original. Do not add any new information. Do not remove any information. Do not change the tone of the blog post. You can change the lenght of the blog post but do not change it by a large number and do make it more engaging and professional. Do not add your own references or links.
    
    Provide the result in this format:
    "Title: <Enhanced Title>
    Body: <Enhanced Blog Body>"


    Original Blog:
    ${content}

    Enhanced version:`;

    const result = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    console.log(result);

    const enhancedText = result.choices[0].message.content?.trim();

    if (!enhancedText) {
      throw new Error("Empty response from AI model");
    }

    const titleMatch = enhancedText.match(/Title:\s*(.+)/);
    const bodyMatch = enhancedText.match(/Body:\s*([\s\S]+)/);

    const enhancedTitle = titleMatch ? titleMatch[1].trim() : "Untitled Blog";
    const enhancedBody = bodyMatch ? bodyMatch[1].trim() : "";

    res.json({
      enhancedContent: {
        enhancedTitle,
        enhancedBody,
      },
    });
  } catch (error) {
    console.error("AI Enhancement error:", error);
    res.status(500).json({
      message: "Error enhancing content",
      error: error.message,
    });
  }
});

export default router;
