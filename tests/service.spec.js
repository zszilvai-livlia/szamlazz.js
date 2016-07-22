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

const setup = require('./resources/setup')

let requestStub

let client
let seller
let buyer
let soldItem1
let soldItem2
let invoice

let Szamlazz

beforeEach(function (done) {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  requestStub = sinon.stub()
  requestStub.jar = function () {}

  mockery.registerMock('request', requestStub)

  Szamlazz = require('..')
  client = setup.createClient(Szamlazz)
  seller = setup.createSeller(Szamlazz)
  buyer = setup.createBuyer(Szamlazz)
  soldItem1 = setup.createSoldItemNet(Szamlazz)
  soldItem2 = setup.createSoldItemGross(Szamlazz)
  invoice = setup.createInvoice(Szamlazz, seller, buyer, [soldItem1, soldItem2])

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
      expect(invoice._options).to.have.property('seller').to.be.an.instanceof(Szamlazz.Seller)
      done()
    })

    it('should set buyer', function (done) {
      expect(invoice._options).to.have.property('buyer').to.be.an.instanceof(Szamlazz.Buyer)
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
      fs.readFile(path.join(__dirname, 'resources', 'xmlszamla.xsd'), function (err, data) {
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
    describe('HTTP status', function () {
      it('should handle failed requests', function (done) {
        requestStub.yields(null, {
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })

        client.issueInvoice(invoice, function (err, body, response) {
          expect(err).to.be.a('error')
          done()
        })
      })
    })

    describe('error response in text format', function () {
      beforeEach(function (done) {
        requestStub.yields(null, {
          statusCode: 200,
          headers: {
            szlahu_error_code: '57',
            szlahu_error: 'Some error message from the remote service'
          }
        })
        done()
      })

      it('should have error parameter', function (done) {
        client.issueInvoice(invoice, function (err) {
          expect(err).to.be.a('error')
          done()
        })
      })

      it('should have `szlahu_error_code` property', function (done) {
        client.issueInvoice(invoice, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error_code')
          done()
        })
      })

      it('should have `szlahu_error` property', function (done) {
        client.issueInvoice(invoice, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error')
          done()
        })
      })
    })

    describe('error response in xml format', function () {
      beforeEach(function (done) {
        fs.readFile(path.join(__dirname, 'resources', 'error.xml'), function (e, xml) {
          requestStub.yields(null, {
            statusCode: 200,
            headers: {
              szlahu_error_code: '3',
              szlahu_error: 'Failed login error message from the remote service'
            },
            xml
          })
          done()
        })
      })

      it('should have error parameter', function (done) {
        client.issueInvoice(invoice, function (err) {
          expect(err).to.be.a('error')
          done()
        })
      })

      it('should have result parameter')

      it('should have `szlahu_error_code` property', function (done) {
        client.issueInvoice(invoice, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error_code')
          done()
        })
      })

      it('should have `szlahu_error` property', function (done) {
        client.issueInvoice(invoice, function (e, body, response) {
          expect(response.headers).to.have.property('szlahu_error')
          done()
        })
      })
    })

    describe('successful invoice generation without download request', function () {
      beforeEach(function (done) {
        fs.readFile(path.join(__dirname, 'resources', 'success_without_pdf.xml'), function (e, data) {
          requestStub.yields(null, {
            statusCode: 200,
            headers: {
              szlahu_bruttovegosszeg: '6605',
              szlahu_nettovegosszeg: '5201',
              szlahu_szamlaszam: '2016-139'
            }
          }, data)

          client.setRequestInvoiceDownload(false)
          done()
        })
      })

      it('should have result parameter', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')

          expect(result).to.have.all.keys(
            'invoiceId',
            'netTotal',
            'grossTotal'
          )

          done()
        })
      })

      it('should have `invoiceId` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(result).to.have.property('invoiceId').that.is.a('string')
          done()
        })
      })

      it('should have `netTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.netTotal)).is.a('number')
          done()
        })
      })

      it('should have `grossTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.grossTotal)).is.a('number')
          done()
        })
      })
    })

    describe('successful invoice generation with download request', function () {
      beforeEach(function (done) {
        fs.readFile(path.join(__dirname, 'resources', 'success_without_pdf.xml'), function (e, data) {
          requestStub.yields(null, {
            statusCode: 200,
            headers: {
              szlahu_bruttovegosszeg: '6605',
              szlahu_nettovegosszeg: '5201',
              szlahu_szamlaszam: '2016-139'
            }
          }, data)

          client.setRequestInvoiceDownload(true)
          done()
        })
      })

      it('should have result parameter', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')

          expect(result).to.have.all.keys(
            'invoiceId',
            'netTotal',
            'grossTotal',
            'pdf'
          )

          done()
        })
      })

      it('should have `invoiceId` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(result).to.have.property('invoiceId').that.is.a('string')
          done()
        })
      })

      it('should have `netTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.netTotal)).is.a('number')
          done()
        })
      })

      it('should have `grossTotal` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(parseFloat(result.grossTotal)).is.a('number')
          done()
        })
      })

      it('should have `pdf` property', function (done) {
        client.issueInvoice(invoice, function (err, result) {
          expect(err).to.be.a('null')
          expect(result.pdf).to.be.an.instanceof(Buffer)
          done()
        })
      })
    })
  })
})
