/* eslint-env mocha */
'use strict'

const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const expect = require('chai').expect

const setup = require('./resources/setup')

let seller
let buyer
let soldItem1
let soldItem2
let invoice

let Szamlazz

beforeEach(function (done) {
  Szamlazz = require('..')

  seller = setup.createSeller(Szamlazz)
  buyer = setup.createBuyer(Szamlazz)
  soldItem1 = setup.createSoldItemNet(Szamlazz)
  soldItem2 = setup.createSoldItemGross(Szamlazz)
  invoice = setup.createInvoice(Szamlazz, seller, buyer, [ soldItem1, soldItem2 ])

  done()
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
