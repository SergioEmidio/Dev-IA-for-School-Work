import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export class GeminiService {

static async generateResponse(prompt){

try{

const API_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

const response = await fetch(API_URL,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{ text: prompt }
]
}
],
generationConfig:{
temperature:0.7,
topK:40,
topP:0.95,
maxOutputTokens:2048
}
})
});

if(!response.ok){

const err = await response.text();

throw new Error(err);

}

const data = await response.json();

return data.candidates?.[0]?.content?.parts?.[0]?.text
|| "Não consegui gerar resposta.";

}catch(error){

console.error("Gemini Error:",error);

return "Erro interno da IA.";

}

}

}