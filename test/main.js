var assert = require('assert');
var Loader = require('../');

describe('Bundle-Loader', function() {

  var path = 'test/fixtures/';
  var fireEvent = function (element, event) {
    var evt;
    if (document.createEvent) {
        evt = document.createEvent("MouseEvents");
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, 0, null);
        element.dispatchEvent(evt);
      } else {
        evt = document.createEventObject();
        element.fireEvent('on' + event);
      }
  };

  describe('bundle loading', function () {
    beforeEach(function () {
      var div = document.createElement('div');
      div.setAttribute('data-require', 'load');
      document.body.appendChild(div);
    });
    afterEach(function () {
      Loader.clearStorage();
      document.LOADED = null;
      document.body.removeChild(document.querySelector('[data-require]'));
      document.head.removeChild(document.querySelector('script'));
    });
    it('should load one js bundle after load() is called', function (done) {
      var loader = Loader({path: path, autoload: false}).done(function () {
        assert.equal(document.LOADED, 'DONE');
        done();
      }).load();
    });
    it('should load one js bundle instantly', function (done) {
      var loader = Loader({ path: path, autoload: true}).done(function () {
        assert.equal(document.LOADED, 'DONE');
        done();
      });
    });
    it('should save loaded source in localstorage and then get bundle from localstorage', function (done) {
      var data = null;
      var loader = new Loader({ path: path, autoload: true}).done(function () {
        data = JSON.parse(localStorage.getItem('loader-load'));
        assert.equal(document.LOADED, 'DONE');
        assert(data.data);
        assert(data.time);
        assert.equal(data.buster, '');
        assert(data.expire);
        Loader.clearStorage();
        assert.deepEqual(localStorage, {});
        done();
      });
    });
  });

  describe('on click loading', function () {
    before(function () {
      var a = document.createElement('a');
      a.setAttribute('id', 'load-test');
      document.body.appendChild(a);
    });
    after(function () {
      document.body.removeChild(document.getElementById('load-test'));
      document.head.removeChild(document.querySelector('script'));
    });
    it('should load one js bundle on click event', function (done) {
      var loader = new Loader({ path: path, autoload: false });
      var startCount = 0;

      loader.onclick('#load-test', 'load', function () {
        assert.equal(document.LOADED, 'DONE');
        assert.equal(startCount, 1);
        done();
      }, function () {
        startCount++;
      });
      document.getElementById('load-test').click();
    });
  });

  describe('load error', function () {
    before(function () {
      var div = document.createElement('div');
      div.setAttribute('data-require', 'foo');
      document.body.appendChild(div);
    });
    after(function () {
      document.body.removeChild(document.querySelector('[data-require]'));
    });
    it('should fail', function (done) {
      var errorCount = 0;
      var loader = new Loader({path: path, autoload: false});
      loader.done(function (d, f) {
        assert.equal(f.length, 1);
        done();
      });
      loader.load();
    });
  });

  describe('custom data attribute', function () {
    before(function () {
      var div = document.createElement('div');
      div.setAttribute('data-load', 'load');
      document.body.appendChild(div);
    });
    after(function () {
      document.head.removeChild(document.querySelector('script'));
      document.body.removeChild(document.querySelector('[data-load]'));
    });
    it('should load one js bundle instantly', function (done) {
      var loader = new Loader({attr: 'data-load', path: path, autoload: true});
      loader.done(function (d) {
        assert.equal(d.length, 1);
        assert.equal(document.LOADED, 'DONE');
        done();
      });
    });
  });

});
