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

describe('szamlazz.hu service answers', function () {

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

    client = new InvoiceModule.Client({
      user: 'USERNAME',
      password: 'PASSWORD',
      eInvoice: false,
      passpharase: '',
      requestInvoiceDownload: true,
      downloadedInvoiceCount: 0,
      responseVersion: 1
    })

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

    soldItem1 = new InvoiceModule.Item({
      label: 'First item',
      quantity: 2,
      unit: 'qt',
      vat: 27,
      netUnitPrice: 100.55,
      comment: 'Ez egy árvíztűrő tükörfúrógép'
    })

    soldItem2 = new InvoiceModule.Item({
      label: 'Second item',
      quantity: 5,
      unit: 'qt',
      vat: 27,
      grossUnitPrice: 1270
    })

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

  it('With text response, the invoice creation has failed', function (done) {
    requestStub.yields(new Error('An error message from our api'), {
      statusCode: 200,
      headers: {
        szlahu_error_code: '57',
        szlahu_error: 'Some error message from the remote service'
      }
    })

    client.issueInvoice(invoice, function (err, body, response) {
      expect(err).to.be.a('error')
      expect(response.headers).to.have.property('szlahu_error_code')
      expect(response.headers).to.have.property('szlahu_error')
      done()
    })
  })

  it('With XML response besides to szamlaLetoltes=false, the invoice creation has succeeded', function (done) {
    requestStub.yields(null, {
      statusCode: 200,
      headers: {
        szlahu_bruttovegosszeg: '6605',
        szlahu_nettovegosszeg: '5201',
        szlahu_szamlaszam: '2016-139'
      }
    })

    client.setRequestInvoiceDownload(false)

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

  it('With XML response besides to szamlaLetoltes=true, the invoice creation has succeeded', function (done) {
    requestStub.yields(null, {
      statusCode: 200,
      headers: {
        szlahu_bruttovegosszeg: '6605',
        szlahu_nettovegosszeg: '5201',
        szlahu_szamlaszam: '2016-139'
      }
    })

    client.setRequestInvoiceDownload(true)

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

  it('with XML response, the invoice creation has failed ', function (done) {
    requestStub.yields(new Error('An error message from our api'), {
      statusCode: 200,
      headers: {
        szlahu_error_code: '3',
        szlahu_error: 'Failed login error message from the remote service'
      }
    })

    client.issueInvoice(invoice, function (err, body, response) {
      expect(err).to.be.a('error')
      expect(response.headers).to.have.property('szlahu_error_code')
      expect(response.headers).to.have.property('szlahu_error')
      done()
    })
  })
})
