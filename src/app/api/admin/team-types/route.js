import { NextResponse } from 'next/server';
import { createTeamType } from '@/lib/organizations.js';
import { getDatabase } from '@/lib/database.js';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json(db.orgLevels.sort((a, b) => a.levelRank - b.levelRank));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newLevel = createTeamType({
      name: body.name,
      levelRank: body.levelRank,
      actor: 'admin', // Hardcoded for now until session integration
    });
    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
