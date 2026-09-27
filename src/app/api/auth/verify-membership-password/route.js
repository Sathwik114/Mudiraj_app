import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // The membership password managed by the Super Admin to prevent public spam
    // Hardcoded for now based on user requirement: 'SuperAdmin8790'
    const VALID_PASSWORD = 'SuperAdmin8790';
    
    if (password === VALID_PASSWORD) {
      return NextResponse.json({ success: true, message: 'Password verified successfully.' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid Membership Password.' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
  }
}
