
/*
  用更优雅的方式调用RESTful APIs
  Author: wvv8oo
  Github: https://github.com/wvv8oo/charm.js
 */

(function() {
  var __slice = [].slice;

  (function() {
    var SegmentEntity, SegmentModel, charm, jQueryAjax;
    SegmentEntity = (function() {
      function SegmentEntity(parent, segmentModel) {
        this.parent = parent;
        this.segmentModel = segmentModel;
        this.params = [];
        this._updateProperties();
        this._addMethods();
      }

      SegmentEntity.prototype._addMethod = function(verb, funcName) {
        var self;
        self = this;
        return this[funcName] = function(data, cb) {
          if (typeof data === 'function') {
            cb = data;
            data = {};
          }
          return self._doAction(verb, data, cb);
        };
      };

      SegmentEntity.prototype._addMethods = function() {
        var funcName, map, method, methods, _results;
        map = {
          post: 'create',
          put: 'update',
          patch: 'patch',
          "delete": 'delete',
          get: 'retrieve',
          jsonp: 'jsonp'
        };
        methods = this.segmentModel.options.methods || map;
        _results = [];
        for (funcName in methods) {
          method = methods[funcName];
          _results.push(this._addMethod(funcName, method));
        }
        return _results;
      };

      SegmentEntity.prototype._addPlainParam = function(param, index) {
        var placeholder;
        placeholder = this.segmentModel.placeholders[index];
        return this.params[index] = {
          key: placeholder.key,
          value: String(param)
        };
      };

      SegmentEntity.prototype._addObjectParam = function(param) {
        var findIndex, index, item, key, value, _i, _len, _ref, _results;
        _results = [];
        for (key in param) {
          value = param[key];
          findIndex = -1;
          _ref = this.segmentModel.placeholders;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            item = _ref[index];
            if (item.key === key) {
              findIndex = index;
              break;
            }
          }
          _results.push(this._addPlainParam(value, findIndex));
        }
        return _results;
      };

      SegmentEntity.prototype._addParams = function(params) {
        var index, param, _i, _len, _ref, _results;
        _results = [];
        for (index = _i = 0, _len = params.length; _i < _len; index = ++_i) {
          param = params[index];
          if ((_ref = typeof param) === 'string' || _ref === 'number') {
            _results.push(this._addPlainParam(param, index));
          } else {
            _results.push(this._addObjectParam(param));
          }
        }
        return _results;
      };

      SegmentEntity.prototype._currentToString = function() {
        var param, url, _i, _len, _ref;
        url = this.segmentModel.name;
        _ref = this.params;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          if (param.value) {
            url += "/" + param.value;
          }
        }
        return url;
      };

      SegmentEntity.prototype._extractMethodName = function(name) {
        if (this.segmentModel.options.rawMethodName) {
          return name;
        }
        name = name.replace(/[\-](\w)/, function(m, n) {
          return n.toUpperCase();
        });
        return name;
      };

      SegmentEntity.prototype._updateProperties = function() {
        var child, method, _i, _len, _ref, _results;
        _ref = this.segmentModel.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          method = this._extractMethodName(child.name);
          if (this[method]) {
            continue;
          }
          _results.push(this[method] = SegmentEntity.create(this, child));
        }
        return _results;
      };

      SegmentEntity.prototype._doAction = function(method, data, cb) {
        var ajax, deferred, q, url;
        q = this.segmentModel.options.promise;
        ajax = this.segmentModel.options.ajax;
        url = this.toString();
        if (!q) {
          return ajax(url, method, data, cb);
        }
        deferred = q.defer();
        ajax(url, method, data, (function(result) {
          return deferred.resolve(result);
        }), function(result) {
          return deferred.reject(result);
        });
        return deferred.promise;
      };

      SegmentEntity.prototype.parse = function(urls) {
        this.segmentModel.parse(urls);
        return this._updateProperties();
      };

      SegmentEntity.prototype.toString = function(ignoreSuffix) {
        var ops, url, _ref;
        if (!this.parent) {
          return '';
        }
        ops = this.segmentModel.options;
        url = ((_ref = this.parent) != null ? _ref.toString(true) : void 0) || ops.prefix || '';
        url += "/" + (this._currentToString());
        if (!ignoreSuffix && ops.suffix) {
          url += ops.suffix;
        }
        return url;
      };

      return SegmentEntity;

    })();
    SegmentEntity.create = function(parent, segmentModel) {
      return function() {
        var args, entity;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        entity = new SegmentEntity(parent, segmentModel);
        entity._addParams(args);
        return entity;
      };
    };
    SegmentModel = (function() {
      function SegmentModel(parent, name, options) {
        this.parent = parent;
        this.name = name;
        this.options = options;
        this.children = [];
        this.placeholders = [];
      }

      SegmentModel.prototype.parseUrl = function(api) {
        var parent, part, url, _i, _len, _ref, _results;
        parent = this;
        url = api.url || api;
        _ref = url.split('/');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          part = _ref[_i];
          _results.push(parent = parent.addChild(part));
        }
        return _results;
      };

      SegmentModel.prototype.parse = function(apis) {
        var api, _i, _len, _results;
        if (!(apis instanceof Array)) {
          apis = [apis];
        }
        _results = [];
        for (_i = 0, _len = apis.length; _i < _len; _i++) {
          api = apis[_i];
          _results.push(this.parseUrl(api));
        }
        return _results;
      };

      SegmentModel.prototype.setPlaceholders = function(value, index) {
        if (typeof value === 'object') {
          return this.addPlaceholders(value);
        }
      };

      SegmentModel.prototype.addPlaceholder = function(identifier) {
        return this.placeholders.push({
          key: identifier
        });
      };

      SegmentModel.prototype.addChild = function(part) {
        var child, _i, _len, _ref;
        if (/^:.+/.test(part)) {
          this.addPlaceholder(part.substr(1));
          return this;
        }
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.name === part) {
            return child;
          }
        }
        return this.createSegmentModel(part);
      };

      SegmentModel.prototype.createSegmentModel = function(part) {
        var segment;
        segment = new SegmentModel(this, part);
        segment.options = this.options;
        this.children.push(segment);
        return segment;
      };

      return SegmentModel;

    })();
    jQueryAjax = function(url, type, data, cb) {
      var dataType;
      if (!(typeof $ !== "undefined" && $ !== null ? $.ajax : void 0)) {
        return console.error('请设置options.ajax参数或引用jQuery');
      }
      dataType = type === 'jsonp' ? 'JSONP' : 'JSON';
      if (type === 'jsonp') {
        type = 'GET';
      }
      return $.ajax(url, {
        type: type,
        data: data,
        dataType: dataType,
        success: function(response) {
          return typeof cb === "function" ? cb(response) : void 0;
        }
      });
    };
    charm = function(options) {
      var entity, model;
      options = options || {};
      options.ajax = options.ajax || jQueryAjax;
      model = new SegmentModel(null, null, options);
      entity = new SegmentEntity(null, model);
      return entity;
    };
    if (typeof define === 'function') {
      return define([], function() {
        return charm;
      });
    } else if (typeof exports === "object") {
      return module.exports = charm;
    } else {
      return window.charm = charm;
    }
  })();

}).call(this);
