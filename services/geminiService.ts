
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Loop, Response, Member } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestQuestions = async (category: string, description: string, existingQuestions: string[]): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 5 unique, engaging, and mostly lighthearted questions for a ${category} newsletter.
    The group description is: "${description}".
    
    CRITICAL RULES:
    1. One question MUST be: "Share a photo of the highlight of your week."
    2. The other 4 questions should be lighthearted, fun, and relevant to the group's description.
    3. Avoid these existing questions: ${existingQuestions.join(', ')}.
    4. Keep the questions short and open-ended.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["questions"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data.questions || [];
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};

export const generateNewsletterIntro = async (loopName: string, responses: Response[], members: Member[]): Promise<string> => {
  const ai = getAI();
  const memberMap = new Map(members.map(m => [m.id, m.name]));
  const responseData = responses.map(r => `${memberMap.get(r.memberId)} answered: ${r.answer}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a warm, engaging, and slightly poetic newsletter introduction for a group called "${loopName}". 
    The tone should be cozy and connective. 
    Here is a summary of what members have been up to this week:
    ${responseData}
    
    Make it feel like a professional editor wrote a sweet preamble to a family or friends magazine. Keep it under 150 words.`,
  });

  return response.text || "Welcome to another edition of our collective journey. It's time to pause and catch up with the beautiful souls in this loop.";
};

export const generateNarrativeCollation = async (loopName: string, questions: Question[], responses: Response[], members: Member[]): Promise<string> => {
  const ai = getAI();
  const memberMap = new Map(members.map(m => [m.id, m.name]));
  const questionMap = new Map(questions.map(q => [q.id, q.text]));
  
  const dataString = responses.map(r => {
    const qText = questionMap.get(r.questionId);
    const mName = memberMap.get(r.memberId);
    return `[Question: ${qText}] [Member: ${mName}] [Answer: ${r.answer}]`;
  }).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are a world-class magazine editor for a private group called "${loopName}". 
    Below are the responses members shared this week. 
    Transform these raw answers into a beautiful, cohesive narrative story. 
    
    RULES:
    1. Do NOT just list them. Weave them together into a flowing "Week in Review" article.
    2. Mention members by name naturally (e.g., "While Alex was conquering a 10k run, Jordan was discovering the city's best espresso...").
    3. Keep the tone warm, witty, and celebratory.
    4. Group similar vibes or themes together.
    5. Length: 300-500 words.
    
    RESPONSES:
    ${dataString}`,
  });

  return response.text || "The week unfolded in a tapestry of small moments and big wins...";
};

export const generateHeaderImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `An artistic, minimalist, high-quality banner image for a newsletter. Theme: ${prompt}. Aesthetic: Soft watercolor, pastel colors, clean composition, professional photography style.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return 'https://picsum.photos/1200/400';
};
