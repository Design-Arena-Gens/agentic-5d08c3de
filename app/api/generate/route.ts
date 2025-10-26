import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, temperature } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ success: false, error: 'No prompt provided' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ success: true, response: `Echo: ${prompt}` });
    }

    // Use Google Generative AI (REST) to avoid heavy SDKs
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: typeof temperature === 'number' ? temperature : 0.5,
      }
    };

    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ success: false, error: `API Error: ${resp.status} ${errText}` }, { status: 500 });
    }

    const json = await resp.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';

    return NextResponse.json({ success: true, response: text });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
