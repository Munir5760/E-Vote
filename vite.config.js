import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function electionStateSyncPlugin() {
  const dataDir = path.resolve(__dirname, 'server_data')
  const dataFilePath = path.resolve(dataDir, 'election_live_store.json')
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch (e) {}
  }
  return {
    name: 'election-state-sync',
    configureServer(server) {
      server.middlewares.use('/api/state', (req, res, next) => {
        if (req.method === 'GET') {
          if (fs.existsSync(dataFilePath)) {
            try {
              const data = fs.readFileSync(dataFilePath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(data)
              return
            } catch (e) {
              console.error('Error reading state file:', e)
            }
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ empty: true }))
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              fs.writeFileSync(dataFilePath, body, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        } else {
          next()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electionStateSyncPlugin(),
  ],
  server: {
    host: true, // Allow multiple laptops and tablets to connect on LAN
    watch: {
      ignored: ['**/server_data/**', '**/src/data/election_live_store.json'],
    },
  },
})

