
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const run = async () => {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenAI(apiKey);

    try {
        console.log("Listing available models...");
        // The SDK doesn't have a direct listModels but we can try to hit the REST endpoint or use a known method
        // Actually, let's just try the most common model names for Imagen 3
        const models = [
            "imagen-3.0-generate-001",
            "imagen-3.0-fast-generate-001",
            "imagen-2.0-generate-001",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash-exp"
        ];

        for (const model of models) {
            try {
                const m = genAI.getGenerativeModel({ model });
                console.log(`Checking model: ${model}... Success (object created)`);
            } catch (e) {
                console.log(`Checking model: ${model}... Failed`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

run();
