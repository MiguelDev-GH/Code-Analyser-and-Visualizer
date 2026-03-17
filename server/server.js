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
    const { code } = req.body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Analise o código abaixo e gere um mapa mental da arquitetura.
      Retorne APENAS um JSON válido seguindo esta estrutura exata para o React Flow:
      {
        "nodes": [
          {
            "id": "string única",
            "position": { "x": numero_aleatorio_entre_0_e_500, "y": numero_aleatorio_entre_0_e_300 },
            "data": { 
              "label": "Nome Principal do Bloco",
              "description": "Resumo de até 15 palavras do que esse bloco faz",
              "code": "O trecho de código exato referente a este bloco",
              "functions": ["nomeFuncao1", "nomeFuncao2"]
            }
          }
        ],
        "edges": [
          {
            "id": "string_unica",
            "source": "id_do_node_origem",
            "target": "id_do_node_destino",
            "label": "Motivo da conexão (ex: Chama API)"
          }
        ]
      }

      Código para analisar:
      ${code}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    res.json(JSON.parse(responseText));

  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar o código' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});