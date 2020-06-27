const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const modules = require('./modules')


const models = require('./models');

models.sequelize.sync().then(() => {
  app.use(express.static('public'))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.post('/', (req, res) => {
    let params = {}
    switch (req.body.action) {
      case 'check-order':
        params = JSON.parse(req.body.json)

        modules.getOrder(params.order).then(orderItem => {
          if (orderItem) {
            res.send({
              'status': 'success',
              'order': true,
              'asin': orderItem.ASIN,
              'buyer': '',
              'order': params.order,
              'sku': orderItem.SellerSKU,
              'title': orderItem.Title
            })
          } else {
            res.send({
              'status': 'success',
              'answer': 'We are unable to&nbsp;find your order. Make sure it’s<br>the&nbsp;order&nbsp;ID for&nbsp;ELLIEVE ORGANICS.<br>If&nbsp;you have placed an&nbsp;order recently, wait<br>for the&nbsp;goods to&nbsp;be delivered.'
            })
          }
        })
        break

      case 'save-comment':
        params = JSON.parse(req.body.json)

        modules.saveComment(params.email, params.comment)

        res.send({
          'status': 'success'
        })
        break

      default:
        res.send('"action" is not determined.')
    }
  })

  app.listen(port, () => console.log(`AWS MWS Form app listening at http://localhost:${port}`))
});