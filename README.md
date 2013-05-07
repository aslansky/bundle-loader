# BundleLoader

Loads js bundles on demand.

## What is a bundle

Multiple js files packaged into one single js file.

## Options

```
{
  // path to the bundle files
  path: '/',
  // html attribute
  attr: 'data-require',
  // load automatically on Loader()
  autoload: true,
  // if false a timestamp will be added to the script url to prevent browser caching
  cache: true,
  // store scripts in localStorage
  store: true,
  // prefix for localStorage objects
  storagePrefix: 'loader-',
  // default expire time in hours (2h)
  expiration: 2,
  // invalidation string, if changed stored object will be invalidated
  cacheBuster: ''
}
```

## Usage ##

```
var loader = Loader({
  path: '/javascript/build/'
})
.progress(function (type, bundle, error, errorObj) {
  // type is loaded or error
  // one bundle loaded or error
})
.done(function (loaded, failed) {
  // all bundles loaded
});
```

```
<div data-require="bundle-name"></div>
```

### On event loading ###

```
var loader = Loader({
  path: '/javascript/build/'
});

$('a').click(loader.callback('bundle-name', loadEnd, loadStart));
```

## Tests ##

```
$ npm install
$ npm test
```
