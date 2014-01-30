/**
 * BundleLoader.js
 *
 * Copyright 2013, Alexander Slansky
 * Licensed under MIT
 *
*/
(function (factory, root, win, doc) {
    if (typeof exports === 'object') {
      module.exports = factory(root, win, doc);
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        root.Loader = factory(root, win, doc);
        return root.Loader;
      });
    } else {
      root.Loader = factory(root, win, doc);
    }
}(function (root, win, doc) {
  'use strict';

  var errors = 0,
      required = [],
      failed = [],
      loaded = [],
      conf = {},
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
    conf = extend({}, defaults, options);
    hasStore = hasStore && conf.store;
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
    conf.ondone = fn;
    return Loader;
  };

  Loader.bundle = function (fn) {
    conf.onload = fn;
    return Loader;
  };

  Loader.error = function (fn) {
    conf.onerror = fn;
    return Loader;
  };

  Loader.loaded = loaded;
  Loader.failed = failed;

  function init () {
    getRequired();
    if (conf.autoload) {
      Loader.load();
    }
  }

  function getRequired() {
    var eles = doc.querySelectorAll('[' + conf.attr + ']');
    for (var i = 0, len = eles.length; i < len; i++) {
      var req = eles[i].getAttribute(conf.attr);
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
    req.open('get', conf.path + bundle + '.js', true);
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
    if (conf.onload && typeof conf.onload === 'function') {
      conf.onload.call(root, bundle, !script);
    }
  }

  function failBundle (bundle, error, errorObj) {
    toLoad--;
    failed.push(bundle.toString());

    if (conf.onerror && typeof conf.onerror === 'function') {
      conf.onerror.call(root, bundle);
    }
  }

  function doneAll () {
    if (failed.length > 0 && conf.onerror && typeof conf.onerror === 'function') {
      conf.onerror.call(root, loaded, failed);
    }
    else if (conf.ondone && typeof conf.ondone === 'function') {
      conf.ondone.call(root, loaded, failed);
    }
    if (cb && typeof cb === 'function') {
      cb.call(root);
      cb = null;
    }
  }

  function storeScript (name, data) {
    var now = +new Date(),
        obj = {};

    obj.data = data;
    obj.time = now;
    obj.buster = conf.cacheBuster;
    obj.expire = now + (conf.expiration * 60 * 60 * 1000);
    localStorage.setItem(conf.storagePrefix + name, JSON.stringify(obj));
  }

  function isValid (item) {
    return item.data && item.expire - +new Date() > 0 && item.buster === conf.cacheBuster;
  }

  function isStored (name) {
    try {
        var item = JSON.parse(localStorage.getItem(conf.storagePrefix + name));
        if (isValid(item)) {
          return item;
        }
        localStorage.removeItem(conf.storagePrefix + name);
        return false;
    } catch(e) {
      return false;
    }
  }

  function hasLocalStorage () {
    try {
      return 'localStorage' in win && win.localStorage !== null;
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

  /*global document */
  /**
   * define document.querySelector & document.querySelectorAll for IE7
   *
   * A not very fast but small hack. The approach is taken from
   * http://weblogs.asp.net/bleroy/archive/2009/08/31/queryselectorall-on-old-ie-versions-something-that-doesn-t-work.aspx
   *
   */
  if (!document.querySelectorAll && !document.querySelector) {
    var style = document.createStyleSheet();
    var select = function (selector, maxCount) {
      var all = document.all,
          l = all.length,
          i,
          resultSet = [];

      style.addRule(selector, "foo:bar");
      for (i = 0; i < l; i += 1) {
        if (all[i].currentStyle.foo === "bar") {
          resultSet.push(all[i]);
          if (resultSet.length > maxCount) {
            break;
          }
        }
      }
      style.removeRule(0);
      return resultSet;
    };
    //  be rly sure not to destroy a thing!
    document.querySelectorAll = function (selector) {
      return select(selector, Infinity);
    };
    document.querySelector = function (selector) {
      return select(selector, 1)[0] || null;
    };
  }

  return Loader;
}, this, window, document));
