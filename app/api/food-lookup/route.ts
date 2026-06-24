import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Give me accurate nutritional info for: "${query}"

Return ONLY a valid JSON array, no markdown, no explanation, no backticks.
Each item format: {"name": "food name with portion", "calories": number, "proteinG": number, "carbsG": number, "fatG": number}

Rules:
- Use the exact quantity/amount specified in the query
- If it is a meal with multiple items, return each item separately
- Round all numbers to nearest integer
- Return 1-4 items max
- Be accurate with portions — if they say 200g rice, use 200g not a default serving`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json({ results: parsed });
  } catch (err) {
    console.error('Food lookup error:', err);
    return NextResponse.json({ error: 'Failed to look up food' }, { status: 500 });
  }
}
