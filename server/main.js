const express = require('express')
const path = require('path')
const webpack = require('webpack')
const logger = require('../build/lib/logger')
const webpackConfig = require('../build/webpack.config')
const project = require('../project.config')
const compress = require('compression')
const port = 3001
const app = express()
const os = require('os')
const fetch =require ('node-fetch');
const url = require('url');
app.use(compress())

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (project.env === 'development') {
  const compiler = webpack(webpackConfig)

  logger.info('Enabling webpack development and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackConfig.output.publicPath,
    contentBase : path.resolve(project.basePath, project.srcDir),
    hot         : true,
    quiet       : false,
    noInfo      : false,
    lazy        : false,
    stats       : 'normal',
  }))
  app.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr'
  }))

  // Serve static assets from ~/public since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(path.resolve(project.basePath, 'public')))


  app.get('/getip', function(req, res) {
    var ifaces = os.networkInterfaces();
    var result = [];

    Object.keys(ifaces).forEach(function (ifname) {

      ifaces[ifname].forEach(function (iface) {

        if ('IPv4' == iface.family && iface.internal == false && ifname.indexOf("VirtualBox")<0) {
          // skip over internal (i.e. 127.0.0.1), non-ipv4 addresses and virtualbox interfaces
          result.push(iface.address);
        }
      });
    });

    const promises = result.map(url => {
      return fetch("http://"+url+":"+port);
    })

    const invert  = p  => new Promise((res, rej) => p.then(rej, res));
    const firstOf = ps => invert(Promise.all(ps.map(invert)));
    const sendToClient = p  => p.then(v => res.send(url.parse(v.url, true).host), e => res.json(e));

    return sendToClient(firstOf(promises));
  })


  // This rewrites all routes requests to the root /index.html file
  // (ignoring file requests). If you want to implement universal
  // rendering, you'll want to remove this middleware.
  app.use('*', function (req, res, next) {
    const filename = path.join(compiler.outputPath, 'index.html')
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err)
      }
      res.set('content-type', 'text/html')
      res.send(result)
      res.end()
    })
  })
} else {
  logger.warn(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(path.resolve(project.basePath, project.outDir)))
}

module.exports = app
