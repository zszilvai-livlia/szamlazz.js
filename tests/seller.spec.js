/* eslint-env mocha */
'use strict'

const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const expect = require('chai').expect

const setup = require('./resources/setup')

let seller

let Szamlazz

beforeEach(function (done) {
  Szamlazz = require('..')

  seller = setup.createSeller(Szamlazz)

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
