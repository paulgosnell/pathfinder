import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with anon key (for public access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email, earlyTester } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user agent and IP for analytics (optional)
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Insert into waitlist_signups table
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert({
        email: email.toLowerCase().trim(),
        early_tester: earlyTester || false,
        user_agent: userAgent,
        ip_address: ipAddress,
        source: 'landing_page',
        metadata: {
          submitted_at: new Date().toISOString(),
          referrer: request.headers.get('referer') || null
        }
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          {
            error: 'This email is already on the waitlist',
            message: 'Looks like you\'re already signed up! We\'ll be in touch soon.'
          },
          { status: 409 }
        );
      }

      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save signup. Please try again.' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: earlyTester
        ? 'Welcome to early testing! We\'ll contact you within 48 hours.'
        : 'You\'re on the list! We\'ll notify you when we launch.',
      data: {
        email: data.email,
        earlyTester: data.early_tester,
        signupDate: data.signup_date
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve waitlist count (optional - for marketing)
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { count, error } = await supabase
      .from('waitlist_signups')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      total: count || 0
    });

  } catch (error) {
    console.error('Error fetching waitlist count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist count' },
      { status: 500 }
    );
  }
}
