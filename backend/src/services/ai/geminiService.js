
const { GoogleGenAI } = require("@google/genai");

function getAIClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from the backend/.env file.");
    }
    return new GoogleGenAI({ apiKey });
}

// Wait before retrying a failed request.
function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isTemporaryError(error) {
    const message = String(
        error?.message || error
    ).toLowerCase();

    return (
        message.includes("503") ||
        message.includes("unavailable") ||
        message.includes("overloaded") ||
        message.includes("high demand") ||
        message.includes("429") ||
        message.includes("resource_exhausted")
    );
}

async function generateProjectSummary(repositoryData) {
    if (!repositoryData) {
        throw new Error("Repository data is required.");
    }

    const prompt = `
You are an expert software project documentation assistant.

Analyze the GitHub repository information provided below.

Use only the supplied repository information.
Do not invent features, technologies, or setup instructions.
If information is unavailable, clearly mention that.

Generate a structured project summary containing:

1. projectOverview
2. projectPurpose
3. mainFeatures (array of strings)
4. technologies (array of objects containing name and purpose)
5. prerequisites (array of strings)
6. setupSteps (array of strings)
7. targetAudience
8. difficultyLevel
9. limitations (array of strings)

Repository information:

${JSON.stringify(repositoryData, null, 2)}
`;

    const maxAttempts = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(
                `Gemini request attempt ${attempt}/${maxAttempts}`
            );

            const ai = getAIClient();
            const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            projectOverview: { type: "STRING" },
                            projectPurpose: { type: "STRING" },
                            mainFeatures: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            },
                            technologies: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        name: { type: "STRING" },
                                        purpose: { type: "STRING" }
                                    },
                                    required: ["name", "purpose"]
                                }
                            },
                            prerequisites: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            },
                            setupSteps: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            },
                            targetAudience: { type: "STRING" },
                            difficultyLevel: { type: "STRING" },
                            limitations: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            }
                        },
                        required: [
                            "projectOverview",
                            "projectPurpose",
                            "mainFeatures",
                            "technologies",
                            "prerequisites",
                            "setupSteps",
                            "targetAudience",
                            "difficultyLevel",
                            "limitations"
                        ]
                    }
                }
            });

            const responseText = response.text;

            if (!responseText) {
                throw new Error("Gemini returned an empty response.");
            }

            const summary = JSON.parse(responseText);

            console.log("Project summary generated successfully.");

            return summary;

        } catch (error) {
            lastError = error;

            console.error(
                `Gemini attempt ${attempt} failed:`,
                error.message
            );

            if (!isTemporaryError(error) || attempt === maxAttempts) {
                break;
            }

            const waitTime = 2000 * Math.pow(2, attempt - 1);

            console.log(
                `Retrying in ${waitTime / 1000} seconds...`
            );

            await delay(waitTime);
        }
    }

    throw new Error(
        `Gemini summary generation failed after ${maxAttempts} attempts. ${lastError?.message || "Unknown error"}`
    );
}

module.exports = {
    generateProjectSummary
};
