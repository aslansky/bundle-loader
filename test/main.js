var assert = require('assert');
var bonzo = require('bonzo');
var qwery = require('qwery');
var bean = require('bean');
var Loader = require('../');
var path = 'test/fixtures/';
var loader;

bonzo.setQueryEngine(qwery);
bean.setSelectorEngine(qwery);
function s(selector) {
  return bonzo(qwery(selector));
}

describe('Bundle-Loader', function() {
  describe('bundle loading', function () {
    beforeEach(function () {
      loader = null;
      bonzo(bonzo.create('<div>')).attr('data-require', 'load').appendTo(s('body'));
    });

    afterEach(function () {
      loader.clearStorage();
      document.LOADED = null;
      s('[data-require]').remove();
      s('script', 'head').remove();
    });

    it('should load one js bundle after load() is called', function (cb) {
      loader = new Loader({path: path, autoload: false}).done(function () {
        assert.equal(document.LOADED, 'DONE');
        cb();
      }).load();
    });

    it('should load one js bundle instantly', function (cb) {
      loader = new Loader({ path: path, autoload: true, test: 'instant'}).done(function () {
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
        s('#load-test').remove();
      });
      s('[data-require]').remove();
      bonzo(bonzo.create('<a>')).attr('id', 'load-test').appendTo(qwery('body'));
      loader = new Loader({ path: path, autoload: false });
      var startCount = 0;
      loader.onclick('#load-test', 'load', function () {
        assert.equal(document.LOADED, 'DONE');
        assert.equal(startCount, 1);
        cb();
      }, function () {
        startCount++;
      });
      if (s('#load-test').get(0).fireEvent) {
        var evObj = document.createEventObject();
        var res = s('#load-test').get(0).fireEvent('onclick', evObj);
      }
      else {
        bean.fire(s('#load-test')[0], 'click');
      }
    });

    it('should load one js bundle instantly', function (cb) {
      after(function () {
        s('[data-load]').remove();
      });
      bonzo(bonzo.create('<div>')).attr('data-load', 'load').appendTo(qwery('body'));
      loader = new Loader({attr: 'data-load', path: path, autoload: true});
      loader.done(function (d) {
        assert.equal(d.length, 1);
        assert.equal(document.LOADED, 'DONE');
        cb();
      });
    });

  });
});
