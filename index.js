/**
 * BundleLoader.js
 *
 * Copyright 2013, Alexander Slansky
 * Licensed under MIT
 *
*/
(function (root, factory, doc) {
    if (typeof exports === 'object') {
      module.exports = factory(root, doc);
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        root.Loader = factory(root, doc);
        return root.Loader;
      });
    } else {
      root.Loader = factory(root, doc);
    }
}(this, function (root, doc) {
  'use strict';

  var errors = 0,
      required = [],
      failed = [],
      loaded = [],
      // check if localStorage is available
      hasStore = hasLocalStorage(),
      toLoad = 0,
      cb = null,
      // default options
      defaults = {
        onfile: null,
        onerror: null,
        ondone: null,
        // path to the js files
        path: '/',
        // html attribute
        attr: 'data-require',
        // load automaticaly on Loader()
        autoload: true,
        // store scripts in localStorage
        store: true,
        // prefix for localStorage objects
        storagePrefix: 'loader-',
        // default expire time (2h)
        expiration: 2,
        // invalidation string, if changed stored object will be invalidated
        cacheBuster: ''
      };

  var Loader = function (options) {
    errors = 0, required = [], failed = [], loaded = [];
    // merge default options with options
    extend(defaults, options);
    hasStore = hasStore && defaults.store;
    // init loader
    init();
    // return jquery deferred
    return Loader;
  };

  Loader.load = function (force) {
    setTimeout(function () {
      var storeObj = false;
      toLoad = required.length;
      if (force) {
        loaded = [];
        failed = [];
        getRequired();
      }
      for (var i = 0, len = required.length; i < len; i++) {
        if (!inArray(loaded, file)) {
          var file = required[i];
          if (hasStore) {
            storeObj = isStored(file);
          }
          if (storeObj) {
            includeFromStore(file, storeObj);
          }
          else {
            getFromServer(file);
          }
        }
      }
    }, 0);
    return Loader;
  };

  // function to attach event to element and load something on click
  Loader.onclick = function (selector, bundle, fn, onstart) {
    // save loader scope
    var eles = doc.querySelectorAll(selector);
    var that = this;
    for (var i = 0, len = eles.length; i < len; i++) {
      addEvent(eles[i], 'click', function (e) {
        handleClick(e, bundle, fn, onstart, that);
      });
    }
  };

  Loader.clearStorage = function () {
      localStorage.clear();
      return Loader;
  };

  Loader.done = function (fn) {
    defaults.ondone = fn;
    return Loader;
  };

  Loader.bundle = function (fn) {
    defaults.onload = fn;
    return Loader;
  };

  Loader.error = function (fn) {
    defaults.onerror = fn;
    return Loader;
  };

  Loader.loaded = loaded;
  Loader.failed = failed;

  function init () {
    getRequired();
    if (defaults.autoload) {
      Loader.load();
    }
  }

  function getRequired() {
    var eles = doc.querySelectorAll('[' + defaults.attr + ']');
    for (var i = 0, len = eles.length; i < len; i++) {
      var req = eles[i].getAttribute(defaults.attr);
      req = req.split(',');
      for (var j = 0, l = req.length; j < l; j++) {
        if (!inArray(required, req[j] + '')) {
          required.push(trim(req[j]));
        }
      }
    }
  }

  function getFromServer (bundle) {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if (this.status > 400) {
        failBundle(bundle);
      }
      else {
        createScript(this.response);
        doneBundle(bundle, this.response);
      }
      if (toLoad <= 0) doneAll();
    };
    req.onerror = function () {
      failBundle(bundle);
      if (toLoad <= 0) doneAll();
    };
    req.open('get', defaults.path + bundle + '.js', true);
    req.send();
  }

  function createScript (code, src, cb) {
    var script = document.createElement('script');
    var content = document.createTextNode(code);
    script.setAttribute('defer', 'defer');
    script.setAttribute('async', 'async');
    if (code) {
      script.appendChild(content);
    }
    else {
      script.setAttribute('src', src);
      addEvent(script, 'load', function (evt) {
        cb.call(this, evt.type, script.textContent || script.innerText);
      });
      addEvent(script, 'error', function (evt) {
        doc.querySelector('head').removeChild(script);
        cb.call(this, evt.type);
      });
    }
    doc.querySelector('head').appendChild(script);
  }

  function includeFromStore (name, obj) {
    createScript(obj.data);
    doneBundle(name);
    if (toLoad <= 0) doneAll();
  }

  function doneBundle (bundle, script) {
    toLoad--;
    if (hasStore && script) {
      storeScript(bundle, script);
    }
    loaded.push(bundle.toString());
    if (defaults.onload && typeof defaults.onload === 'function') {
      defaults.onload.call(root, bundle, !script);
    }
  }

  function failBundle (bundle, error, errorObj) {
    toLoad--;
    failed.push(bundle.toString());

    if (defaults.onerror && typeof defaults.onerror === 'function') {
      defaults.onerror.call(root, bundle);
    }
  }

  function doneAll () {
    if (failed.length > 0 && defaults.onerror && typeof defaults.onerror === 'function') {
      defaults.onerror.call(root, loaded, failed);
    }
    else if (defaults.ondone && typeof defaults.ondone === 'function') {
      defaults.ondone.call(root, loaded, failed);
    }
    if (cb && typeof cb === 'function') {
      cb.call(root);
    }
  }

  function storeScript (name, data) {
    var now = +new Date(),
        obj = {};

    obj.data = data;
    obj.time = now;
    obj.buster = defaults.cacheBuster;
    obj.expire = now + (defaults.expiration * 60 * 60 * 1000);
    localStorage.setItem(defaults.storagePrefix + name, JSON.stringify(obj));
  }

  function isValid (item) {
    return item.data && item.expire - +new Date() > 0 && item.buster === defaults.cacheBuster;
  }

  function isStored (name) {
    try {
        var item = JSON.parse(localStorage.getItem(defaults.storagePrefix + name));
        if (isValid(item)) {
          return item;
        }
        localStorage.removeItem(defaults.storagePrefix + name);
        return false;
    } catch(e) {
      return false;
    }
  }

  function hasLocalStorage () {
    try {
      return 'localStorage' in root && root.localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  function handleClick (evt, bundle, fn, onstart, l) {
    var ele = evt.target;
    if (inArray(loaded, bundle) && fn && typeof fn === 'function') {
      fn.call(ele, evt, loaded, failed);
    }
    else {
      // trigger onstart
      if (onstart && typeof onstart === 'function') {
        onstart.call(ele);
      }
      evt.preventDefault();
      // push bundle to required array
      required.push(bundle);
      cb = function () {
        if (fn && typeof fn === 'function') {
          fn.call(ele, evt, loaded, failed);
        }
      };
      l.load();
    }
  }

  function addEvent (elem, eventType, handler) {
    if (elem.addEventListener) {
      elem.addEventListener(eventType, handler, false);
    }
    else if (elem.attachEvent) {
     elem.attachEvent('on' + eventType, handler);
    }
  }

  function extend () {
    for (var i = 1, len = arguments.length; i < len; i++) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  }

  function inArray (arr, search) {
    for(var i = 0, len = arr.length; i < len; i++) {
        if(arr[i] == search) return true;
    }
    return false;
  }

  function trim (value) {
    if (String.prototype.trim) {
      return value.trim();
    }
    return value.replace(/^\s+|\s+$/g,'');
  }

  return Loader;
}, document));
