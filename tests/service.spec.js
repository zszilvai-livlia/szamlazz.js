/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const mockery = require('mockery')
const expect = require('chai').expect

let requestStub

let client
let seller
let buyer
let soldItem1
let soldItem2
let invoice

let InvoiceModule

describe('Client #issueInvoice()', function () {
  before(function (done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })

    requestStub = sinon.stub()
    requestStub.jar = function () {}

    mockery.registerMock('request', requestStub)

    InvoiceModule = require('../index.js')

    /**
     * Creates a client
     * @type {Client}
     */
    client = new InvoiceModule.Client({
      user: 'USERNAME',
      password: 'PASSWORD',
      eInvoice: false,
      passpharase: '',
      requestInvoiceDownload: true,
      downloadedInvoiceCount: 0,
      responseVersion: 1
    })

    /**
     * Creates a Seller
     * Optional and can be used to override the default data.
     * @type {Seller}
     */
    seller = new InvoiceModule.Seller({
      bank: {
        name: 'Test Bank <name>',
        accountNumber: '11111111-11111111-11111111'
      },
      email: {
        replyToAddress: 'test@email.com',
        subject: 'Invocie email subject',
        message: 'This is an email message'
      },
      issuerName: ''
    })

    /**
     * Creates a Buyer
     * Required, you should supply basic data: name, zip, city, address as a minimum. Hungary is the default country.
     * @type {Buyer}
     */
    buyer = new InvoiceModule.Buyer({
      name: 'Test ' + Math.random(),
      country: '',
      zip: '1234',
      city: 'City',
      address: 'Some street address',
      taxNumber: '12345678-1-42',
      postAddress: {
        name: 'Some Buyer Name',
        zip: '1234',
        city: 'City',
        address: 'Some street address'
      },
      issuerName: '',
      identifier: 1,
      phone: '',
      comment: ''
    })

    /**
     * Creates an item
     * @type {Item}
     */
    soldItem1 = new InvoiceModule.Item({
      label: 'First item',
      quantity: 2,
      unit: 'qt',
      vat: 27, // can be a number or a special string
      netUnitPrice: 100.55, // calculates gross and net values from per item net
      comment: 'An item'
    })

    /**
     * Creates another item
     * @type {Item}
     */
    soldItem2 = new InvoiceModule.Item({
      label: 'Second item',
      quantity: 5,
      unit: 'qt',
      vat: 27,
      grossUnitPrice: 1270 // calculates net and total values from per item gross
    })

    /**
     * Creates an invoice
     * Buyer and seller can be shared between invoices.
     * @type {Invoice}
     */
    invoice = new InvoiceModule.Invoice({
      paymentMethod: InvoiceModule.PaymentMethod.BankTransfer,
      currency: InvoiceModule.Currency.Ft,
      language: InvoiceModule.Language.Hungarian,
      seller: seller,
      buyer: buyer,
      items: [ soldItem1, soldItem2 ]
    })

    done()
  })

  after(function (done) {
    mockery.disable()
    done()
  })

  it('should handle error response in text format', function (done) {
    // With text response, the invoice creation has failed
    requestStub.yields(new Error('An error message from our api'), {
      statusCode: 200,
      headers: {
        szlahu_error_code: '57',
        szlahu_error: 'Some error message from the remote service'
      }
    })

    // Issue an invoice
    client.issueInvoice(invoice, function (err, body, response) {
      expect(err).to.be.a('error')
      expect(response.headers).to.have.property('szlahu_error_code')
      expect(response.headers).to.have.property('szlahu_error')
      done()
    })
  })

  it('should handle error response in xml format ', function (done) {
    // With XML response, the invoice creation has failed
    requestStub.yields(new Error('An error message from our api'), {
      statusCode: 200,
      headers: {
        szlahu_error_code: '3',
        szlahu_error: 'Failed login error message from the remote service'
      }
    })

    // Issue an invoice
    client.issueInvoice(invoice, function (err, body, response) {
      expect(err).to.be.a('error')
      expect(response.headers).to.have.property('szlahu_error_code')
      expect(response.headers).to.have.property('szlahu_error')
      done()
    })
  })

  it('should handle success response without download request', function (done) {
    // With XML response besides to szamlaLetoltes=false, the invoice creation has succeeded
    requestStub.yields(null, {
      statusCode: 200,
      headers: {
        szlahu_bruttovegosszeg: '6605',
        szlahu_nettovegosszeg: '5201',
        szlahu_szamlaszam: '2016-139'
      }
    })

    // Without download request
    client.setRequestInvoiceDownload(false)

    // Issue an invoice
    client.issueInvoice(invoice, function (err, result, response) {
      expect(err).to.be.a('null')

      expect(response.headers).to.have.all.keys(
        'szlahu_bruttovegosszeg',
        'szlahu_nettovegosszeg',
        'szlahu_szamlaszam'
      )

      done()
    })
  })

  it('should handle success response with download request', function (done) {
    // With XML response besides to szamlaLetoltes=true, the invoice creation has succeeded
    requestStub.yields(null, {
      statusCode: 200,
      headers: {
        szlahu_bruttovegosszeg: '6605',
        szlahu_nettovegosszeg: '5201',
        szlahu_szamlaszam: '2016-139'
      }
    })

    // With download request
    client.setRequestInvoiceDownload(true)

    // Issue an invoice
    client.issueInvoice(invoice, function (err, result, response) {
      expect(err).to.be.a('null')

      expect(result).to.have.property('pdf')

      expect(response.headers).to.have.all.keys(
        'szlahu_bruttovegosszeg',
        'szlahu_nettovegosszeg',
        'szlahu_szamlaszam'
      )

      done()
    })
  })
})
