import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query, mealType } = await req.json();
  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
  }

  const isRestaurant = mealType === 'restaurant';

  const prompt = isRestaurant
    ? `I ordered this from a restaurant or fast food place: "${query}"

Use web_search to find the EXACT nutritional information from:
1. The restaurant's official website nutrition page
2. Or a reliable source like MyFitnessPal, Nutritionix, or CalorieKing

Do NOT estimate — always search for the real menu data first.

After searching, return ONLY a valid JSON array, no markdown, no backticks:
[{"name": "dish name (restaurant name)", "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "source": "official"}]

- Round all numbers to nearest integer
- Return 1 item for the full meal or up to 4 for separate components
- If you cannot find official data, use your best estimate and set source to "estimated"`

    : `I cooked this at home: "${query}"

Use standard nutritional values based on the exact ingredients and measurements provided.
If no measurement is given, use a standard serving size.

Return ONLY a valid JSON array, no markdown, no backticks:
[{"name": "food name with measurement", "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "source": "estimated"}]

- Round all numbers to nearest integer
- If multiple ingredients are mentioned, return each separately
- Be accurate with the measurements given`;

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
        max_tokens: 1500,
        tools: isRestaurant ? [{ type: 'web_search_20250305', name: 'web_search' }] : [],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return NextResponse.json({ error: `Anthropic error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    const text = textBlock?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found:', text);
      return NextResponse.json({ error: 'Could not parse nutrition data' }, { status: 500 });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ results: parsed });
  } catch (err) {
    console.error('Food lookup error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
