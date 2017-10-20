
var Patrun = require('patrun')
var Jsonic = require('jsonic')


module.exports = function handler(options) {
  var seneca = this
  var tu = this.export('transport/utils')
  var allow = Patrun({gex: true})
  

  // TODO: fix seneca so that this can be first inward task
  seneca.inward(function(ctxt, data) {
    if (false === data.msg.__safe__) {
      if(!allow.find(data.msg)) {
        return {
          kind: 'error',
          code: 'unsafe'
        }
      }
    }
  })
  
  seneca.add('role:transport,hook:listen,type:browser', hook_listen_browser)

  function hook_listen_browser(msg, reply) {
    var seneca = this

    var pins = Array.isArray(msg.pin) ? msg.pin : [msg.pin]

    pins.forEach(function(pin) {
      pin = 'string' == typeof pin ? Jsonic(pin) : pin

      // TODO: should use optioner
      if (null == pin || 0 == Object.keys('object' == typeof pin ? pin : {}).length) {
        return reply(new Error('pin required'))
      }

      allow.add(pin,true)
    })
    
    reply()
  }

  var action_seneca = seneca.root.delegate()
  
  return {
    export: function handler(data, respond) {
      var json = 'string' === typeof data ? tu.parseJSON(data) : data
      var msg = tu.internalize_msg(seneca, json)
      
      // FIX: should be meta property
      msg.__safe__ = false
      
      action_seneca.act(msg, function (err, out, meta) {
        // TODO: make configurable
        if(err) {
          err.stack = null
        }

        respond(tu.externalize_reply(this, err, out, meta))
      })
    }
  }
}



