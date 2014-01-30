var assert = require('assert');
var Loader = require('../');

describe('Bundle-Loader', function() {

  var path = 'test/fixtures/';

  describe('bundle loading', function () {
    var loader;
    beforeEach(function () {
      loader = null;
      var div = document.createElement('div');
      div.setAttribute('data-require', 'load');
      document.getElementsByTagName('body')[0].appendChild(div);
    });

    afterEach(function () {
      loader.clearStorage();
      document.LOADED = null;
      if (document.querySelector('[data-require]')) {
        document.getElementsByTagName('body')[0].removeChild(document.querySelector('[data-require]'));
      }
      document.getElementsByTagName('head')[0].removeChild(document.querySelector('script'));
    });

    it('should load one js bundle after load() is called', function (cb) {
      loader = Loader({path: path, autoload: false}).done(function () {
        assert.equal(document.LOADED, 'DONE');
        cb();
      }).load();
    });

    it('should load one js bundle instantly', function (cb) {
      loader = Loader({ path: path, autoload: true, test: 'instant'}).done(function () {
        assert.equal(document.LOADED, 'DONE');
        cb();
      });
    });

    it('should save loaded source in localstorage and then get bundle from localstorage', function (cb) {
      var data = null;
      loader = new Loader({ path: path, autoload: true}).done(function () {
        data = JSON.parse(window.localStorage.getItem('loader-load'));
        assert.equal(document.LOADED, 'DONE');
        assert(data.data);
        assert(data.time);
        assert.equal(data.buster, '');
        assert(data.expire);
        loader.clearStorage();
        assert.deepEqual(localStorage, {});
        cb();
      });
    });

    it('should load one js bundle on click event', function (cb) {
      after(function () {
        document.getElementsByTagName('body')[0].removeChild(document.getElementById('load-test'));
      });
      document.getElementsByTagName('body')[0].removeChild(document.querySelector('[data-require]'));
      var a = document.createElement('a');
      a.setAttribute('id', 'load-test');
      document.getElementsByTagName('body')[0].appendChild(a);
      loader = new Loader({ path: path, autoload: false });
      var startCount = 0;
      loader.onclick('#load-test', 'load', function () {
        assert.equal(document.LOADED, 'DONE');
        assert.equal(startCount, 1);
        cb();
      }, function () {
        startCount++;
      });
      document.getElementById('load-test').click();
    });

    it('should fail', function (cb) {
      after(function () {
        document.getElementsByTagName('body')[0].removeChild(document.querySelector('[data-require]'));
      });
      var div = document.createElement('div');
      div.setAttribute('data-require', 'foo');
      document.getElementsByTagName('body')[0].appendChild(div);
      var errorCount = 0;
      loader = new Loader({path: path, autoload: false});
      loader.done(function (d, f) {
        assert.equal(f.length, 1);
        cb();
      });
      loader.load();
    });

    it('should load one js bundle instantly', function (cb) {
      after(function () {
        document.getElementsByTagName('body')[0].removeChild(document.querySelector('[data-load]'));
      });
      var div = document.createElement('div');
      div.setAttribute('data-load', 'load');
      document.getElementsByTagName('body')[0].appendChild(div);
      loader = new Loader({attr: 'data-load', path: path, autoload: true});
      loader.done(function (d) {
        assert.equal(d.length, 1);
        assert.equal(document.LOADED, 'DONE');
        cb();
      });
    });

  });
});
