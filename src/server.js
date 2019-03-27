import express from 'express'
import dotenv from 'dotenv'
import * as line from '@line/bot-sdk'

dotenv.config()
export const app = express()
export const port = process.env.PORT || 4000

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result))
})

// create LINE SDK client
const client = new line.Client(config)
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text
  })
}

export const start = () => {
  app.listen(port, () => {
    console.log(`REST API on http://localhost:${port}/`)
  })
}
