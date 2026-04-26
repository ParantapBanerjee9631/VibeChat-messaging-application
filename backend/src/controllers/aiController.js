const { GoogleGenAI } = require('@google/genai');
const Message = require('../models/Message');

// Initialize Gemini SDK
// It will automatically pick up GEMINI_API_KEY from process.env if present
const ai = new GoogleGenAI({});

const generateAIResponse = async (req, res) => {
  try {
    const { roomId, input } = req.body;
    
    // Fetch context
    const messages = await Message.find({ roomId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(15);
      
    const context = messages.reverse().map(m => `${m.sender?.username || 'AI'}: ${m.text}`).join('\n');

    if (!process.env.GEMINI_API_KEY) {
       return res.json({ response: "[Simulated AI] Please set your GEMINI_API_KEY to use real AI features." });
    }

    const prompt = `You are a helpful and friendly AI assistant inside a chat application called VibeChat.
Here is the recent chat history for context:
${context}

User says: ${input}

Respond naturally to the user. Do not prefix your response with "AI:" or your name.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    res.json({ response: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'AI generation failed', error: error.message });
  }
};

const summarizeRoom = async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const messages = await Message.find({ roomId })
        .populate('sender', 'username')
        .sort({ createdAt: -1 })
        .limit(50);
        
      if (messages.length === 0) {
          return res.json({ summary: "There are no messages in this room to summarize yet." });
      }

      const context = messages.reverse().map(m => `${m.sender?.username || 'AI'}: ${m.text}`).join('\n');
  
      if (!process.env.GEMINI_API_KEY) {
         return res.json({ summary: "[Simulated Summary] People are chatting about various topics. (Set GEMINI_API_KEY for a real summary)." });
      }
  
      const prompt = `You are a helpful AI assistant. Summarize the following chat conversation into a few bullet points highlighting the main topics discussed:
  
  ${context}`;
  
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
  
      res.json({ summary: response.text });
    } catch (error) {
      console.error('Summarize Error:', error);
      res.status(500).json({ message: 'Summarization failed', error: error.message });
    }
};

const generateSmartReplies = async (req, res) => {
    try {
        const { lastMessage } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ replies: ["Sounds good!", "I'll let you know.", "Thanks!"] });
        }

        const prompt = `Generate exactly 3 short, natural-sounding quick replies (under 5 words each) to the following message:
        "${lastMessage}"
        
        Format the output as a simple JSON array of strings, like this: ["reply1", "reply2", "reply3"]. Do not include markdown code block formatting in your response, just the raw JSON.`;
    
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        try {
            // Strip potential markdown formatting if the model adds it anyway
            let jsonText = response.text.trim();
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.substring(7, jsonText.length - 3).trim();
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.substring(3, jsonText.length - 3).trim();
            }
            const replies = JSON.parse(jsonText);
            res.json({ replies });
        } catch (parseError) {
             console.error("Failed to parse smart replies JSON", response.text);
             res.json({ replies: ["Yes", "No", "Ok"] });
        }
    } catch (error) {
        console.error('Smart Reply Error:', error);
        res.status(500).json({ message: 'Smart reply generation failed', error: error.message });
    }
};

const checkToxicity = async (text) => {
    if (!process.env.GEMINI_API_KEY) return false; // Fail open if no key

    try {
        const prompt = `Analyze the following text for severe toxicity, hate speech, or severe harassment.
        Text: "${text}"
        
        Respond ONLY with a single boolean value: "true" if it is severely toxic/hateful, or "false" if it is acceptable or just mildly annoying.`;
    
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const isToxic = response.text.trim().toLowerCase() === 'true';
        return isToxic;
    } catch (error) {
        console.error('Toxicity Check Error:', error);
        return false; // In case of error, default to allowing the message to avoid breaking chat entirely
    }
};

module.exports = { generateAIResponse, summarizeRoom, generateSmartReplies, checkToxicity };
