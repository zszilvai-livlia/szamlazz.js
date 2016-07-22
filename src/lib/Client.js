'use strict'

const assert = require('assert')
const merge = require('merge')
const request = require('request')
const XMLUtils = require('./XMLUtils')

const xmlHeader =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
  'xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla xmlszamla.xsd">\n'

const xmlFooter = '</xmlszamla>'

const szamlazzURL = 'https://www.szamlazz.hu/szamla/'

const defaultOptions = {
  eInvoice: false,
  requestInvoiceDownload: false,
  downloadedInvoiceCount: 1,
  responseVersion: 1
}

class Client {
  constructor (options) {
    this._options = merge(defaultOptions, options || {})

    assert(typeof this._options.user === 'string' && this._options.user.trim().length > 1,
      'Valid User field missing form client options')

    assert(typeof this._options.password === 'string' && this._options.password.trim().length > 1,
      'Valid Password field missing form client options')

    this._cookieJar = request.jar()
  }

  issueInvoice (invoice, cb) {
    this._sendRequest('action-xmlagentxmlfile', this._generateInvoiceXML(invoice), cb)
  }

  setRequestInvoiceDownload (value) {
    this._options.requestInvoiceDownload = value
  }

  _generateInvoiceXML (invoice) {
    return xmlHeader +
      XMLUtils.wrapWithElement('beallitasok', [
        [ 'felhasznalo', this._options.user ],
        [ 'jelszo', this._options.password ],
        [ 'eszamla', this._options.eInvoice ],
        [ 'kulcstartojelszo', this._options.passpharase ],
        [ 'szamlaLetoltes', this._options.requestInvoiceDownload ],
        [ 'szamlaLetoltesPld', this._options.downloadedInvoiceCount ],
        [ 'valaszVerzio', this._options.responseVersion ]
      ], 1) +
      invoice._generateXML(1) +
      xmlFooter
  }

  _sendRequest (fileFieldName, data, cb) {
    const formData = {}

    formData[ fileFieldName ] = {
      value: data,
      options: {
        filename: 'request.xml',
        contentType: 'text/xml'
      }
    }

    request({
      formData,
      method: 'POST',
      url: szamlazzURL,
      jar: this._cookieJar,
      encoding: null
    }, (err, httpResponse, body) => {
      if (err) {
        return cb(err, body, httpResponse)
      }

      if (httpResponse.statusCode !== 200) {
        return cb(new Error(`${httpResponse.statusCode} ${httpResponse.statusMessage}`), body, httpResponse)
      }

      if (httpResponse.headers.szlahu_error_code) {
        err = new Error(decodeURIComponent(httpResponse.headers.szlahu_error.replace(/\+/g, ' ')))
        err.code = httpResponse.headers.szlahu_error_code
        return cb(err, body, httpResponse)
      }

      const result = {
        invoiceId: httpResponse.headers.szlahu_szamlaszam,
        netTotal: httpResponse.headers.szlahu_nettovegosszeg,
        grossTotal: httpResponse.headers.szlahu_bruttovegosszeg
      }

      if (this._options.requestInvoiceDownload) {
        if (this._options.responseVersion === 2) {
          XMLUtils.xml2obj(body, { 'xmlszamlavalasz.pdf': 'pdf' }, (err2, parsed) => {
            if (err2) {
              return cb(err2, body, httpResponse)
            }
            result.pdf = new Buffer(parsed.pdf, 'base64')
            cb(null, result, httpResponse)
          })
        } else {
          result.pdf = body
          cb(null, result, httpResponse)
        }
      } else {
        cb(null, result, httpResponse)
      }
    })
  }
}

module.exports = Client
