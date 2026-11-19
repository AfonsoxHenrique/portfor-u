
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini settings
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

// Check API key
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "12mb" }));

// Test Backend
app.get("/", (req, res) => {
  res.json({
    message: "Portfor-U AI Backend is running!",
    model: GEMINI_MODEL,
  });
});

// Resume Analyzer
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { fileBase64, fileName, mimeType, targetRole } = req.body;

    // Check uploaded file
    if (!fileBase64 || !fileName) {
      return res.status(400).json({
        error: "Please upload a resume PDF.",
      });
    }

    if (mimeType !== "application/pdf") {
      return res.status(400).json({
        error: "Only PDF files are supported.",
      });
    }

    // Remove Base64 data URL prefix if present
    const cleanBase64 = fileBase64.replace(
      /^data:application\/pdf;base64,/i,
      ""
    );

    // Check PDF size
    const pdfBuffer = Buffer.from(cleanBase64, "base64");

    if (pdfBuffer.length === 0) {
      return res.status(400).json({
        error: "The uploaded PDF is empty or invalid.",
      });
    }

    // Check PDF file signature
    if (pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
      return res.status(400).json({
        error: "The uploaded file is not a valid PDF.",
      });
    }

    // Maximum file size: 7 MB
    if (pdfBuffer.length > 7 * 1024 * 1024) {
      return res.status(400).json({
        error: "PDF file must be smaller than 7 MB.",
      });
    }

    console.log(`Analyzing resume: ${fileName}`);

    // Resume analysis prompt
    const prompt = `
You are a professional resume reviewer for Portfor U.

Analyze the uploaded resume carefully.

Target job role: ${targetRole || "General job application"}

Return ONLY valid JSON. Do not include Markdown or code fences.

Use exactly this structure:

{
  "overallScore": 0,
  "summary": "Short overall assessment",
  "breakdown": [
    { "label": "Format & Structure", "score": 0 },
    { "label": "Content Quality", "score": 0 },
    { "label": "Keywords & ATS", "score": 0 },
    { "label": "Readability", "score": 0 }
  ],
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "suggestions": [
    "Improvement suggestion 1",
    "Improvement suggestion 2",
    "Improvement suggestion 3"
  ],
  "missingSections": [
    "Missing section 1"
  ],
  "targetRoleAdvice": "Advice for the target job role"
}

Rules:
- All scores must be integers between 0 and 100.
- Be fair, specific and constructive.
- Do not invent qualifications or work experience.
- Give practical suggestions based on the actual resume.
- If information is missing, explain what is missing.
- Use an empty array if there are no missing sections.
- Keep the response concise and suitable for a mobile app.
`;

    // Send PDF and prompt to Gemini Interactions API
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: [
          {
            type: "document",
            data: cleanBase64,
            mime_type: "application/pdf",
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      }),
      signal: AbortSignal.timeout(90000),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", result);

      return res.status(response.status).json({
        error:
          result.error?.message ||
          "Gemini API could not analyze the resume.",
      });
    }

    // Extract generated text
    let outputText = result.output_text;

    if (!outputText && Array.isArray(result.steps)) {
      outputText = result.steps
        .flatMap((step) => step.content || [])
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n");
    }

    if (!outputText && Array.isArray(result.outputs)) {
      outputText = result.outputs
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n");
    }

    if (!outputText) {
      throw new Error("Gemini returned no text output.");
    }

    // Convert AI response into JSON
    const cleanedText = outputText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    // Validate basic analysis structure
    if (
      typeof analysis.overallScore !== "number" ||
      !Array.isArray(analysis.breakdown) ||
      !Array.isArray(analysis.strengths) ||
      !Array.isArray(analysis.suggestions)
    ) {
      throw new Error("Gemini returned an invalid analysis format.");
    }

    console.log("Resume analysis completed successfully.");

    // Return analysis to App
    res.json({
      success: true,
      fileName,
      analysis,
    });

  } catch (error) {
    console.error("Resume analysis error:", error);

    res.status(500).json({
      error:
        error.name === "TimeoutError"
          ? "Resume analysis timed out. Please try again."
          : "Resume analysis failed. Please try again.",
    });
  }
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Portfor U Backend running on port ${PORT}`);
  console.log(`Gemini model: ${GEMINI_MODEL}`);
});