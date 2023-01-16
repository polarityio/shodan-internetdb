module.exports = {
  name: 'Shodan InternetDB',
  acronym: 'SHO-DB',
  description:
    'Shodan InternetDB provides a fast way to see the open ports for an IP address',
  entityTypes: ['IPv4'],
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
  }
};
