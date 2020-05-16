var env = process.env.NODE_ENV || "development";

exports.Keys = {
  ConektaConfig : {
    api_key : 'key_VkcAqVPCAigUVWMYWDE3Lw',
    api_version: '2.0.0',
    locale: 'es'
  },
  apnOptions : {
  	key : "crt/"+env+"key.pem",
    cert : "crt/"+env+"cert.pem",
    production : true
  },
  Mandrill : {
    key: 'uljFzC7YZIxLMUC3FlMPmA'
  },
  gcm : {
    key: 'AIzaSyBNZBt7XDZB39JcNzXoCqUdWvYgdvm2Bu0'
  },
  nexmo : {
    apiKey: 'dc273db0',
    apiSecret: '37e4df8dd752fb24',
    applicationId: '1016b546-0b13-4839-83d3-a39e582b8f28',
    privateKey: 'crt/nexmoKey.key'
  },
  hub : {
    authToken: 'l0ok4t271219986o0d5',
    source: 'lookatHub'
  }
}
