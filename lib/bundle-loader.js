/**
 * BundleLoader.js
 *
 * Copyright 2013, Alexander Slansky
 * Licensed under MIT
 *
*/
(function (root, factory) {
    if (typeof exports === 'object') {
      module.exports = factory(require('jQuery'));
    } else if (typeof define === 'function' && define.amd) {
      define(['jQuery'], function ($) {
        root.Loader = factory($);
        return root.Loader;
      });
    } else {
      root.Loader = factory(root.jQuery);
    }
}(this, function ($) {
  "use strict";

  var dfd = null,
      errors = 0,
      required = [],
      failed = [],
      loaded = [],
      // check if localStorage is available
      hasStore = hasLocalStorage(),
      toLoad = 0,
      // default options
      defaults = {
        // path to the js files
        path: '/',
        // html attribute
        attr: 'data-require',
        // load automaticaly on Loader()
        autoload: true,
        // if false a timestamp will be added to the script url to prevent browser caching
        cache: true,
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
    dfd = $.Deferred(), errors = 0, required = [], failed = [], loaded = [];
    // merge default options with options
    jQuery.extend(defaults, options);
    hasStore = hasStore && defaults.store;
    // init loader
    init();
    // return jquery deferred
    return dfd.promise(Loader);
  };

  Loader.load = function (force) {
    var storeObj = false;
    toLoad = required.length;
    if (force) {
      loaded = [];
      failed = [];
      getRequired();
    }
    $.each(required, function () {
      if ($.inArray(file, loaded) === -1) {
        var file = this;
        if (hasStore) storeObj = isStored(file);
        if (storeObj) {
          includeFromStore(file, storeObj);
        }
        else {
          getFromServer(file);
        }
      }
    });
    return dfd.promise(Loader);
  };

  // callback function to use when loading on user event (like click)
  Loader.callback = function (module, fn, onstart) {
    // save loader scope
    var that = this;
    return function (e) {
      // save event element scope
      var ele = this;
      // trigger onstart
      if (jQuery.isFunction(onstart)) onstart.call(ele);
      e.preventDefault();
      // push module to required array
      required.push(module);
      // promise when done
      that.done(function (loaded, failed) {
        // detach bound event when done
        if (e.handleObj && e.handleObj.handler) $(ele).off(e.type, e.handleObj.handler).trigger(e);
        // call callback function
        if (jQuery.isFunction(fn)) fn.call(ele, e, loaded, failed);
      }).load();
    };
  };

  Loader.clearStorage = function () {
      localStorage.clear();
      return dfd.promise(Loader);
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
    $('[' + defaults.attr + ']').each(function () {
      var req = $(this).data()[defaults.attr.replace('data-', '')];
      req = req.split(',');
      $.each(req, function () {
        if ($.inArray(this + '', required) === -1) {
          required.push($.trim(this));
        }
      });
    });
  }

  function getFromServer (file) {
    $.ajax({
      url: defaults.path + file + '.js',
      dataType: 'script',
      cache: defaults.cache
    })
    .done(function(script) {
      doneFile(file, script);
    })
    .fail(function(xhrObj, errorMsg, error) {
      failFile(file, errorMsg, error);
    })
    .always(function () {
      if (toLoad <= 0) done();
    });
  }

  function includeFromStore (name, obj) {
    var script = $('<script type="text/javascript" defer>' + obj.data + '</script>');
    script.text();
    $('head').append(script);
    doneFile(name);
    if (toLoad <= 0) done();
  }

  function doneFile (file, script) {
    toLoad--;
    if (hasStore && script) storeScript(file, script);
    loaded.push(file.toString());
    dfd.notify('loaded', file, !script);
  }

  function failFile (file, error, errorObj) {
    toLoad--;
    failed.push(file.toString());
    if (console && typeof console.log === 'function' && errorObj.name) {
      if (errorObj.stack) console.log(errorObj.stack);
      else console.log(errorObj.name + ': ' + errorObj.message);
    }
    dfd.notify('error', file, error, errorObj);
  }

  function done () {
    if (failed.length > 0) dfd.reject(loaded, failed);
    else dfd.resolve(loaded, failed);
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

  function isStored (name) {
    var item = localStorage.getItem(defaults.storagePrefix + name);
    try {
        item = JSON.parse(item || 'false');
        if (item.data && item.expire - +new Date() > 0 && item.buster === defaults.cacheBuster) {
          return item;
        }
        else {
          localStorage.removeItem(defaults.storagePrefix + name);
        }
        return false;
    } catch(e) {
      return false;
    }
  }

  function hasLocalStorage () {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  return Loader;
}));
