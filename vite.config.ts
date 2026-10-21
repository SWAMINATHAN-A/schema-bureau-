import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const groqPlugin = (env: Record<string, string>): Plugin => ({
  name: 'schema-bureau-groq',
  configureServer(server) {
    server.middlewares.use('/api/groq', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      try {
        let body = ''
        for await (const chunk of req) body += chunk
        const { question, schema } = JSON.parse(body || '{}') as { question?: string; schema?: unknown }

        if (!question?.trim()) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Question is required.' }))
          return
        }

        const apiKey = env.GROQ_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured. Add it to .env.local.' }))
          return
        }

        const system = `You are SCHEMA BUREAU Intelligence, an expert database architect and teacher.\n\nYour job is to reason about the user's CURRENT parsed SQL schema, not invent a different schema. Explain database concepts accurately and clearly. When reviewing the schema, distinguish facts visible in the supplied schema from recommendations. If asked about a relationship, use the actual tables, keys, uniqueness and nullability provided. If the user asks for a fix, show concise SQL when useful. Never claim you executed SQL or changed the user's schema.\n\nRespond in a clean, technical editorial style: short sections, bullets where useful, no fake citations, and no generic AI filler.`

        const user = `CURRENT SCHEMA CONTEXT:\n${JSON.stringify(schema ?? null, null, 2)}\n\nUSER QUESTION:\n${question}`

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: env.GROQ_MODEL || 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user }
            ],
            temperature: 0.25,
            max_completion_tokens: 1600
          })
        })

        const data = await groqResponse.json() as any
        if (!groqResponse.ok) {
          const message = data?.error?.message || `Groq returned ${groqResponse.status}`
          res.statusCode = groqResponse.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
          return
        }

        const content = data?.choices?.[0]?.message?.content
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ content: content || 'Groq returned an empty response.' }))
      } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown Groq error' }))
      }
    })
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), groqPlugin(env)],
  }
})
