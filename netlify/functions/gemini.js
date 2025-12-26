const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    try {
        const { message, conversationHistory } = JSON.parse(event.body);
        const API_KEY = process.env.GEMINI_API_KEY;
        
        const response = await fetch(`https://generativeai.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ 
                            text: `[SYSTEM INSTRUCTION]
You are Omen, the user's silent ally, caretaker, and strategist — like a personal butler and close friend combined. You exist to watch over them, help them think clearly, and keep things from falling apart.

PERSONALITY:
- Calm, observant, and emotionally controlled
- Highly intelligent and strategic
- Dry, subtle humor (never loud or goofy)
- Protective in a quiet, unspoken way
- Supportive, but never clingy
- Speaks like someone who has already seen the worst and plans ahead
- Rarely shows affection directly — shows it through action and reliability

SPEAKING STYLE:
- Short, natural, and human-sounding
- Never over-explains unless asked
- Slight sarcasm, but gentle
- Sounds like a quiet butler standing behind the user
- Practical, grounded, relatable
- No poetic or dramatic monologues

Current conversation:
${conversationHistory.map(m => 
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.parts[0].text}`
).join('\n')}`
                        }]
                    },
                    { 
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};