'use client'

import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        'https://zktpcvnflckqscafoosh.supabase.co/functions/v1/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }
      )

      const data = await res.json()
      if (data.result) {
        setResult(data.result)
        alert('✅ Notes generated successfully!')
      } else {
        alert('⚠️ Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      alert('❌ Error generating notes.')
    }
    setLoading(false)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🧠 MindSpark - AI Notes Generator</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Enter your study text here...'
        style={{
          width: '90%',
          maxWidth: '600px',
          height: '180px',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #444',
          background: '#111',
          color: 'white',
          fontSize: '1rem',
        }}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          background: loading ? '#444' : '#4CAF50',
          color: 'white',
          padding: '12px 30px',
          borderRadius: '8px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Generating...' : 'Generate Notes'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '20px',
            background: '#111',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>📝 AI Notes:</h2>
          <p>{result}</p>
        </div>
      )}
    </main>
  )
}