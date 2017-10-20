'use strict'

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const Nid = require('nid')
const Seneca = require('seneca')

lab.test('happy', fin => {
  var name = Nid()
  Seneca({legacy:{transport:false}})
    .test(fin)
    .add('a:1', function(msg, reply) {
      reply({y:1+msg.x})
    })
    .use('..')
    .listen({type:'browser', pin:'a:1'})
    .ready(function() {
      var handler = this.export('handler')
      handler({a:'1',x:2}, function(out) {
        expect(out.y).equal(3)
        fin()
      })
    })
})
