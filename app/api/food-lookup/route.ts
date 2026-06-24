import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query, mealType } = await req.json();
  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });

  const isRestaurant = mealType === 'restaurant';

  // Two separate prompts — restaurant uses web search, home does not
  const prompt = isRestaurant
    ? `Search for the exact official nutrition info for this restaurant item: "${query}"

Search specifically for "[restaurant name] [item] nutrition calories" and find the official source.
Only search once — use the first reliable result you find (official website, MyFitnessPal, Nutritionix, or CalorieKing).

Then return ONLY this JSON array and nothing else — no explanation, no markdown, no text before or after:
[{"name":"item name","calories":number,"proteinG":number,"carbsG":number,"fatG":number,"source":"official"}]

If you truly cannot find exact data after searching, estimate and use "source":"estimated".
CRITICAL: Your entire response must be ONLY the JSON array starting with [ and ending with ]. Nothing else.`

    : `Give me the nutrition info for this home-cooked food: "${query}"

Use standard nutrition values for the exact quantity given. If no quantity, use a standard serving.
If multiple ingredients are listed, return each one separately.

Return ONLY this JSON array and nothing else — no explanation, no markdown, no text before or after:
[{"name":"food with portion","calories":number,"proteinG":number,"carbsG":number,"fatG":number,"source":"estimated"}]

CRITICAL: Your entire response must be ONLY the JSON array starting with [ and ending with ]. Nothing else.`;

  try {
    const body: Record<string, unknown> = {
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    };

    // Only add web search tool for restaurant lookups
    if (isRestaurant) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return NextResponse.json({ error: `Anthropic error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();

    // Pull all text blocks from the response (tool_use responses may have multiple content blocks)
    const allText = (data.content || [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('');

    console.log('Raw AI response:', allText);

    // Strip any markdown fences
    const clean = allText.replace(/```json|```/g, '').trim();

    // Find the JSON array — be flexible about where it starts/ends
    const start = clean.indexOf('[');
    const end = clean.lastIndexOf(']');

    if (start === -1 || end === -1 || end <= start) {
      console.error('No JSON array found in response:', clean);
      // Last resort: try parsing the whole thing
      try {
        const parsed = JSON.parse(clean);
        return NextResponse.json({ results: Array.isArray(parsed) ? parsed : [parsed] });
      } catch {
        return NextResponse.json({ error: 'Could not find nutrition data. Try being more specific, e.g. "McDonald\'s Cheeseburger" or "Starbucks Grande Caramel Latte".' }, { status: 500 });
      }
    }

    const jsonStr = clean.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    return NextResponse.json({ results: Array.isArray(parsed) ? parsed : [parsed] });

  } catch (err) {
    console.error('Food lookup error:', err);
    return NextResponse.json({ error: `Lookup failed: ${String(err)}` }, { status: 500 });
  }
}
