import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/analyze', async (req, res) => {
  try {
    const code = req.body.code;
    const language = req.body.language || 'english';

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Analyze the code below and generate a mental map of the architecture.
      The labels and descriptions must be in ${language}.
      Return ONLY a valid JSON following this exact structure for React Flow:
      {
        "nodes": [
          {
            "id": "unique_string",
            "data": { 
              "label": "Main Action Name (e.g., Fetch Data, Validate Input)",
              "description": "Summary up to MAX 30 words, most legible and concise possible",
              "code": "Exact full code snippet",
              "functions": ["func1", "func2"]
            }
          }
        ],
        "edges": [
          {
            "id": "unique_string",
            "source": "source_id",
            "target": "target_id",
            "label": "Connection reason (e.g., If Valid, On Error)",
            "style": { 
              "stroke": "Determine the color based on context: '#22c55e' (green) for success/valid paths, '#ef4444' (red) for error/exception paths, or '#b1b1b7' (gray) for default/neutral flows.",
              "strokeWidth": 2
            },
            "labelStyle": { "fill": "Match the stroke color", "fontWeight": 700 }
          }
        ]
      }

      Code to analyze:
      ${code}
    `;

    console.log('Sending prompt to AI...');
    const result = await model.generateContent(prompt);
    console.log('Response: ', result.response.text());
    const responseText = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('AI response is not a valid JSON');
    }

    res.json(parsed);

  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Error processing the code' });
  }
});

let PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running in PORT ${PORT}`);
});