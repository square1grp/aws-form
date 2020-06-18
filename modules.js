require('dotenv').config()
const axios = require('axios')
const moment = require('moment')
const crypto = require('crypto');
var amazonMws = require('amazon-mws')(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)

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
          resolve([])
        } else {
          try {
            resolve(res.OrderItems['OrderItem'])
          } catch (error) {
            resolve([])
          }
        }
      })
    });
  },

  saveEmail: (email) => {
    return true
  }
}