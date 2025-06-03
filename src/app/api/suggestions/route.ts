import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const suggestionsFilePath = path.join(process.cwd(), 'suggestions.json');

export async function POST(request: Request) {
  const { suggestion } = await request.json();

  if (!suggestion) {
    return NextResponse.json({ message: 'Suggestion is required' }, { status: 400 });

    }

    try {
      let suggestions: string[] = [];
      if (fs.existsSync(suggestionsFilePath)) {
        const data = fs.readFileSync(suggestionsFilePath, 'utf-8');
        suggestions = JSON.parse(data);
      }

      suggestions.push(suggestion);

      fs.writeFileSync(suggestionsFilePath, JSON.stringify(suggestions, null, 2), 'utf-8');

      return NextResponse.json({ message: 'Suggestion saved successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error saving suggestion:', error);
      return NextResponse.json({ message: 'Error saving suggestion' }, { status: 500 });
    }

}