const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const modules = require('./modules')

const models = require('./models')

const site_admin_email = 'support@DRfreeoffer.com'

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
              'answer': "We are unable to find your order. Please confirm you entered the correct order ID and try again. If you continue to have issues, email <a href=\"mailto:" + site_admin_email + "?subject=Mail from Site\">" + site_admin_email + "<\/a>"
            })
          }
        })
        break

      case 'save-email':
      case 'save-comment':
        params = JSON.parse(req.body.json)

        modules.saveComment(params)

        res.send({
          'status': 'success'
        })
        break

      case 'make-an-offer':
        params = JSON.parse(req.body.json)

        modules.makeAnOffer({
          first_name: params.first_name,
          last_name: params.last_name,
          email: params.email,
          address: params.address,
          city: params.city,
          state: params.state,
          zipcode: params.zipcode,
          phone: params.phone,
          receive_by: params.receive_by
        })

        res.send({
          'status': 'success'
        })
        break

      default:
        res.send('"action" is not determined.')
    }
  })

  app.listen(port, () => console.log(`AWS MWS Form app listening at http://localhost:${port}`))
})