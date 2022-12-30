module.exports = {
  name: 'Shodan InternetDB',
  acronym: 'SHODB',
  description: '',
  entityTypes: ['*'],
  styles: ['./styles/styles.less'],
  defaultColor: 'light-blue',
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'Shodan InternetDB URL',
      description: 'URL for Shodan InternetDB API',
      default: 'https://internetdb.shodan.io',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
