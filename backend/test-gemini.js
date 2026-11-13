
require("dotenv").config();

async function testGemini() {
  console.log("Step 1: Checking API key...");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("API key not found.");
    return;
  }

  console.log("Step 2: Connecting to Gemini...");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash-lite",
          input: "Say hello to Portfor-U.",
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    console.log("Step 3: HTTP Status:", response.status);

    const result = await response.json();

    if (!response.ok) {
      console.log("API Error:", JSON.stringify(result, null, 2));
      return;
    }

    console.log("Step 4: Gemini Response:");
    const outputText = (result.steps || [])
    .flatMap(step => step.content || [])
    .filter(item => item.type === "text")
    .map(item => item.text)
    .join("\n");

    console.log(outputText || "No text response found.");
    console.log("Gemini API connection successful!");

  } catch (error) {
    console.log("Connection failed:", error.message);
  }
}

testGemini();