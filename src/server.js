import express from 'express'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import * as line from '@line/bot-sdk'
// import { middleware, Client } from '@line/bot-sdk'

dotenv.config()
export const app = express()
export const port = process.env.PORT || 4000

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

const client = new line.Client(config)

app.disable('x-powered-by')
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send(`Hi there! This is a nodejs-line-api running on PORT: ${PORT}`)
})

app.post('/webhook', line.middleware(config), (req, res) => {
  try {
    // console.error(req, 'req')
    let replyToken = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text

    console.log(`Message token : ${replyToken}`)
    console.log(`Message from chat : ${msg}`)

    res.json({
      status: 200,
      message: `Webhook is working!`
    })
    // Promise.all(req.body.events.map(handleEvent)).then(result =>
    //   res.json(result)
    // )
  } catch (error) {
    console.error(error)
  }
})

function handleEvent(event) {
  console.log(event, 'event Line')
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
