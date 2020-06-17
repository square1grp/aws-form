const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const modules = require('./modules')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', (req, res) => {
  switch (req.body.action) {
    case 'check-order':
      params = JSON.parse(req.body.json)

      modules.getOrder(params.order)

      res.send('')
      break
    default:
      res.send('"action" is not determined.')
  }
})

app.listen(port, () => console.log(`AWS MWS Form app listening at http://localhost:${port}`))