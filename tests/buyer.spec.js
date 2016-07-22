/* eslint-env mocha */
'use strict'

const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const expect = require('chai').expect

const setup = require('./resources/setup')

let buyer

let Szamlazz

beforeEach(function (done) {
  Szamlazz = require('..')

  buyer = setup.createBuyer(Szamlazz)

  done()
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
