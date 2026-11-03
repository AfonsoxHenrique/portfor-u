
require("dotenv").config();

const fs = require("fs");
const path = require("path");

async function testResume() {
  try {
    console.log("Step 1: Preparing test resume...");

    const pdfPath = path.join(__dirname, "sample-resume.pdf");

    if (!fs.existsSync(pdfPath)) {
      console.log("Please place sample-resume.pdf inside the backend folder.");
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const fileBase64 = pdfBuffer.toString("base64");

    console.log("Step 2: Sending PDF to Portfor U Backend...");

    const response = await fetch(
      "http://localhost:3000/api/analyze-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64,
          fileName: "sample-resume.pdf",
          mimeType: "application/pdf",
          targetRole: "Junior Software Developer",
        }),
        signal: AbortSignal.timeout(120000),
      }
    );

    const result = await response.json();

    console.log("Step 3: HTTP Status:", response.status);

    if (!response.ok) {
      console.log("Analysis failed:", result);
      return;
    }

    console.log("\nStep 4: Resume Analysis Result:");
    console.log(JSON.stringify(result.analysis, null, 2));

    console.log("\nResume analysis test completed!");

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testResume();