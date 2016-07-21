/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const xmljs = require('libxmljs')
const parser = new xml2js.Parser()
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

beforeEach(function (done) {
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

afterEach(function (done) {
  mockery.disable()
  done()
})

describe('Seller', function () {
  describe('constructor', function () {
    it('should set _options property', function (done) {
      expect(seller).to.have.property('_options').that.is.an('object')
      done()
    })
  })

  describe('_generateXML', function () {
    it('should return valid XML', function (done) {
      parser.parseString(seller._generateXML(), function (err, result) {
        if (!err) {
          expect(result).to.have.property('elado').that.is.an('object')
          done()
        }
      })
    })
  })
})

describe('Buyer', function () {
  describe('constructor', function () {
    it('should set _options property', function (done) {
      expect(buyer).to.have.property('_options').that.is.an('object')
      done()
    })
  })

  describe('_generateXML', function () {
    it('should return valid XML', function (done) {
      parser.parseString(buyer._generateXML(), function (err, result) {
        if (!err) {
          expect(result).to.have.property('vevo').that.is.an('object')
          done()
        }
      })
    })

    describe('generated XML', function () {
      let obj

      beforeEach(function (done) {
        parser.parseString(buyer._generateXML(), function (err, result) {
          if (!err) obj = result.vevo
        })

        done()
      })

      it('should have `nev` property', function (done) {
        expect(obj).to.have.property('nev')
        done()
      })

      it('should have `irsz` property', function (done) {
        expect(obj).to.have.property('irsz')
        done()
      })

      it('should have `telepules` property', function (done) {
        expect(obj).to.have.property('telepules')
        done()
      })

      it('should have `cim` property', function (done) {
        expect(obj).to.have.property('cim')
        done()
      })

      it('should have `adoszam` property', function (done) {
        expect(obj).to.have.property('adoszam')
        done()
      })

      it('should have `postazasiNev` property', function (done) {
        expect(obj).to.have.property('postazasiNev')
        done()
      })

      it('should have `postazasiIrsz` property', function (done) {
        expect(obj).to.have.property('postazasiIrsz')
        done()
      })

      it('should have `postazasiTelepules` property', function (done) {
        expect(obj).to.have.property('postazasiTelepules')
        done()
      })

      it('should have `postazasiCim` property', function (done) {
        expect(obj).to.have.property('postazasiCim')
        done()
      })

      it('should have `azonosito` property', function (done) {
        expect(obj).to.have.property('azonosito')
        done()
      })
    })
  })
})

describe('Item', function () {
  describe('constructor', function () {
    it('should set _options property', function (done) {
      expect(soldItem1).to.have.property('_options').that.is.an('object')
      done()
    })

    it('should set label', function (done) {
      expect(soldItem1._options).to.have.property('label').that.is.a('string')
      done()
    })

    it('should set quantity', function (done) {
      expect(soldItem1._options).to.have.property('quantity').that.is.a('number')
      done()
    })

    it('should set unit', function (done) {
      expect(soldItem1._options).to.have.property('unit').that.is.a('string')
      done()
    })

    it('should set vat', function (done) {
      expect(soldItem1._options).to.have.property('vat').that.is.a('number')
      done()
    })

    it('should set netUnitPrice or grossUnitPrice', function (done) {
      let price = soldItem1._options.netUnitPrice || soldItem1._options.grossUnitPrice
      expect(price).is.a('number')
      done()
    })
  })

  describe('_generateXML', function () {
    it('should calculate netUnitPrice', function (done) {
      expect(soldItem1._options).to.have.property('netUnitPrice').that.is.a('number')
      done()
    })

    it('should calculate vatValue', function (done) {
      expect(soldItem1._options).to.have.property('vatValue').that.is.a('number')
      done()
    })

    it('should return valid XML', function (done) {
      parser.parseString(soldItem1._generateXML(null, invoice._options.currency), function (err, result) {
        if (!err) {
          expect(result).to.have.property('tetel').that.is.an('object')
          done()
        }
      })
    })

    describe('generated XML', function () {
      let obj

      beforeEach(function (done) {
        parser.parseString(soldItem1._generateXML(null, invoice._options.currency), function (err, result) {
          if (!err) obj = result.tetel
        })

        done()
      })

      it('should have `megnevezes` property', function (done) {
        expect(obj).to.have.property('megnevezes')
        done()
      })

      it('should have `mennyiseg` property', function (done) {
        expect(obj).to.have.property('mennyiseg')
        done()
      })

      it('should have `mennyisegiEgyseg` property', function (done) {
        expect(obj).to.have.property('mennyisegiEgyseg')
        done()
      })

      it('should have `nettoEgysegar` property', function (done) {
        expect(obj).to.have.property('nettoEgysegar')
        done()
      })
      it('should have `afakulcs` property', function (done) {
        expect(obj).to.have.property('afakulcs')
        done()
      })

      it('should have `nettoErtek` property', function (done) {
        expect(obj).to.have.property('nettoErtek')
        done()
      })

      it('should have `afaErtek` property', function (done) {
        expect(obj).to.have.property('afaErtek')
        done()
      })

      it('should have `bruttoErtek` property', function (done) {
        expect(obj).to.have.property('bruttoErtek')
        done()
      })
    })
  })
})

describe('Invoice', function () {
  describe('constructor', function () {
    it('should set _options property', function (done) {
      expect(invoice).to.have.property('_options').that.is.an('object')
      done()
    })

    it('should set seller', function (done) {
      expect(invoice._options).to.have.property('seller').to.be.an.instanceof(InvoiceModule.Seller)
      done()
    })

    it('should set buyer', function (done) {
      expect(invoice._options).to.have.property('buyer').to.be.an.instanceof(InvoiceModule.Buyer)
      done()
    })

    it('should set items', function (done) {
      expect(invoice._options).to.have.property('items').that.is.an('array')
      done()
    })
  })
  describe('_generateXML', function () {
    it('should return valid XML', function (done) {
      parser.parseString('<wrapper>' + invoice._generateXML() + '</wrapper>', function (err, result) {
        if (!err) {
          expect(result).to.have.property('wrapper').that.is.an('object')
          done()
        }
      })
    })

    describe('generated XML', function () {
      let obj

      beforeEach(function (done) {
        parser.parseString('<wrapper>' + invoice._generateXML() + '</wrapper>', function (err, result) {
          if (!err) obj = result.wrapper
        })

        done()
      })

      it('should have `fejlec` node', function (done) {
        expect(obj).to.have.property('fejlec')
        done()
      })

      it('should have `elado` node', function (done) {
        expect(obj).to.have.property('elado')
        done()
      })

      it('should have `vevo` node', function (done) {
        expect(obj).to.have.property('vevo')
        done()
      })

      it('should have `tetelek` node', function (done) {
        expect(obj).to.have.property('tetelek')
        done()
      })
    })
  })
})

describe('Client', function () {
  describe('constructor', function () {
    it('should set _options property', function (done) {
      expect(client).to.have.property('_options').that.is.an('object')
      done()
    })

    it('should set user', function (done) {
      expect(client._options).to.have.property('user').that.is.a('string')
      done()
    })

    it('should set password', function (done) {
      expect(client._options).to.have.property('password').that.is.a('string')
      done()
    })
  })

  describe('_generateInvoiceXML', function () {
    it('should return valid XML', function (done) {
      fs.readFile(path.join(__dirname, 'xmlszamla.xsd'), function (err, data) {
        if (!err) {
          let xsd = xmljs.parseXmlString(data)
          let xml = xmljs.parseXmlString(client._generateInvoiceXML(invoice))
          expect(xml.validate(xsd)).to.be.true
          done()
        }
      })
    })
  })

  describe('issueInvoice', function () {
    describe('error', function () {
      it('should handle error response in text format', function (done) {
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

      it('should handle error response in xml format ', function (done) {
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

    describe('success', function () {
      it('should handle success response without download request', function (done) {
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

      it('should handle success response with download request', function (done) {
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
    })
  })
})
