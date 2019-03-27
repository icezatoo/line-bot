import express from 'express'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'

export const app = express()
export const port = process.env.PORT || 4000

app.disable('x-powered-by')
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.sendStatus(200)
})

export const start = () => {
  app.listen(port, () => {
    console.log(`REST API on http://localhost:${port}/`)
  })
}
