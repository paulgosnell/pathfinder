import { NextResponse } from 'next/server'

/**
 * Creates an ephemeral session token for OpenAI Realtime API
 *
 * This endpoint exchanges the server-side API key for a short-lived
 * client token that can be safely used in the browser.
 *
 * The ephemeral token expires in 60 seconds.
 */
export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Request ephemeral token from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'sage' // Warm, empathetic voice suitable for coaching
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI session creation failed:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to create OpenAI session' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Return the client_secret for WebRTC connection
    return NextResponse.json({
      client_secret: data.client_secret
    })

  } catch (error) {
    console.error('Error creating OpenAI realtime session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
