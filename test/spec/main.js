describe('Bundle-Loader', function() {

  var path = '/base/test/fixtures/';
  var expect = chai.expect;

  beforeEach(function () {
    this.xhr = sinon.useFakeXMLHttpRequest();
    var requests = this.requests = [];
    this.xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    Loader.clearStorage();
    this.xhr.restore();
    $('[data-require]').remove();
  });

  describe('bundle loading', function () {
    before(function () {
      $('body').append('<div data-require="test"></div>');
    });
    it('should load one js bundle after load() is called', function () {
      var callback = sinon.spy();
      var loader = Loader({path: path, autoload: false}).done(callback).load();

      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(200, { "Content-Type": "text/javascript" }, '(function (){})();');
      expect(callback).to.be.calledWith(["test"], []);
    });
  });

  describe('bundle auto loading', function () {
    before(function () {
      $('body').append('<div data-require="test"></div>');
    });
    it('should load one js bundle instantly', function () {
      var callback = sinon.spy();
      var loader = Loader({ path: path, autoload: true}).done(callback);

      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(200, { "Content-Type": "text/javascript" }, '(function (){})();');
      expect(callback).to.be.calledWith(["test"], []);
    });
  });

  describe('load on event', function () {
    before(function () {
      $('body').append('<div id="test"></div>');
    });
    after(function () {
      $('#test').remove();
    });
    it('should load one js bundle on click event', function () {
      var hideLoader = sinon.spy();
      var showLoader = sinon.spy();
      var loader = Loader({ path: path });

      $('#test').click(loader.callback('test', hideLoader, showLoader));

      var e = jQuery.Event("click");
      $('#test').trigger(e);

      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(200, { "Content-Type": "text/javascript" }, '(function (){})();');
      expect(hideLoader).to.be.calledOnce;
      expect(showLoader).to.be.calledOnce;
    });
  });

  describe('bundle caching in locastorage', function () {
    before(function () {
      $('body').append('<div data-require="test"></div>');
    });
    it('should save loaded source in localstorage and then get bundle from localstorage', function () {
      var callback = sinon.spy();
      var loader = Loader({ path: path, autoload: true}).done(callback);

      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(200, { "Content-Type": "text/javascript" }, '(function (){})();');
      expect(callback).to.be.calledWith(["test"], []);
      expect(JSON.parse(localStorage.getItem('loader-test'))).to.have.keys('data', 'time', 'buster', 'expire');
      loader.load(true);
      expect(this.requests.length).to.be.equal(1);
      loader.clearStorage();
      expect(localStorage).to.be.empty;
    });
  });

  describe('load error', function () {
    before(function () {
      $('body').append('<div data-require="foo"></div>');
    });
    it('should fail', function () {
      var callback = sinon.spy();
      var loader = Loader({path: path, autoload: true}).fail(callback);

      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(404, { "Content-Type": "text/html" }, 'Not found.');
      expect(callback).to.be.calledWith([], ["foo"]);
    });
  });

  describe('syntax error in javascript', function () {
    before(function () {
      $('body').append('<div data-require="bar"></div>');
    });
    it('should raise an exception', function () {
      // callback for loader call
      var callback = sinon.spy();
      // spy for console.log
      var spy = sinon.spy();
      // stub console log
      sinon.stub(console, 'log', spy);
      var loader = Loader({path: path, autoload: true}).fail(callback);
      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(200, { "Content-Type": "text/javascript" }, '(function (){test})();');
      expect(callback).to.be.calledWith([], ["bar"]);
      // check if console.log was called once
      expect(spy).to.be.calledOnce;
      console.log.restore();
    });
  });

  describe('custom data attribute', function () {
    before(function () {
      $('body').append('<div data-load="test"></div>');
    });
    after(function () {
      $('[data-load]').remove();
    });
    it('should load one js bundle instantly', function () {
      var callback = sinon.spy();
      var loader = Loader({attr: 'data-load', path: path, autoload: true}).done(callback);

      expect(this.requests.length).to.be.equal(1);
      this.requests[0].respond(200, { "Content-Type": "text/javascript" }, '(function (){})();');
      expect(callback).to.be.calledWith(["test"], []);
    });
  });

});
