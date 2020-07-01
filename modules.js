require('dotenv').config()
var amazonMws = require('amazon-mws')(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
const { Comment, Offer } = require('./models')

module.exports = {
  getOrder: (orderId) => {
    return new Promise(resolve => {
      amazonMws.orders.search({
        'Version': '2013-09-01',
        'Action': 'ListOrderItems',
        'SellerId': process.env.AWS_SELLER_ID,
        'AmazonOrderId': orderId
      }, (err, res) => {
        if (err) {
          resolve(null)
        } else {
          try {
            resolve(res.OrderItems['OrderItem'])
          } catch (error) {
            resolve(null)
          }
        }
      })
    });
  },

  saveComment: async ({ email, order, sku, asin, stars, comment }) => {
    await Comment.create({ email, order, sku, asin, stars, comment })

    return true
  },

  makeAnOffer: async (offerInfo) => {
    await Offer.create(offerInfo)

    return true
  }
}