import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.AI_MODEL_KEY });


const History = [];

async function chatting(question) {
  History.push({
    role: 'user',
    parts: [{ text: question }]
  })
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History
  });
   History.push({
    role: 'model',
    parts: [{ text: response.text }]
  })
  console.log(response.text);
}


async function main() {
  const question = readlineSync.question("Ask me anything --> ");
  await chatting(question);
  main();
}

await main();