# taxi.js [![NPM version](https://badge.fury.io/js/taxi.js.png)](http://badge.fury.io/js/taxi.js) [![devDependency Status](https://david-dm.org/aslansky/taxi.js/dev-status.png)](https://david-dm.org/aslansky/taxi.js#info=devDependencies)

[![browser support](https://ci.testling.com/aslansky/taxi.js.png)](https://ci.testling.com/aslansky/taxi.js)

Loads javascript bundles on demand or on click.
Bundles are combined files of javascript code you would generate with browserify, grunt, gulp or other build tools.

## Options

```
{
  // path to the bundle files
  path: '/',
  // html attribute
  attr: 'data-require',
  // load automatically on Taxi()
  autoload: true,
  // store scripts in localStorage
  store: true,
  // cache scripts / if false will append timestamp as query string to script url
  cache: true,
  // prefix for localStorage objects
  storagePrefix: 'taxi-',
  // default expire time in hours (2h)
  expiration: 2,
  // invalidation string, if changed stored object will be invalidated
  cacheBuster: '',
  // either load packes with .min.js or .js
  usMin: false
}
```

## Usage ##

```
var taxi = Taxi({
  path: '/javascript/build/'
})
.bundle(function (type, bundle, error, errorObj) {
  // type is 'loaded' or 'error'
  // bundle loaded or error
})
.done(function (loaded, failed) {
  // all bundles loaded
});
```

```
<div data-require="bundle-name"></div>
```

### On click loading ###

```
var taxi = Taxi({
  path: '/javascript/build/'
});

taxi.onclick(selector, 'bundle-name', loadEnd, loadStart);
```
