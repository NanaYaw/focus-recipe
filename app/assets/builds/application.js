 (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // ../../node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "../../node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: self.console,
        WebSocket: self.WebSocket
      };
    }
  });

  // ../../node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "../../node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // ../../node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "../../node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => new Date().getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // ../../node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "../../node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // ../../node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "../../node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              return this.subscriptions.notify(identifier, "connected");
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // ../../node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "../../node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // ../../node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "../../node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // ../../node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "../../node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        // Private
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // ../../node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "../../node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
      };
    }
  });

  // ../../node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "../../node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // ../../node_modules/cash-dom/dist/cash.js
  var require_cash = __commonJS({
    "../../node_modules/cash-dom/dist/cash.js"(exports, module) {
      (function() {
        "use strict";
        var doc = document;
        var win = window;
        var docEle = doc.documentElement;
        var createElement = doc.createElement.bind(doc);
        var div = createElement("div");
        var table = createElement("table");
        var tbody = createElement("tbody");
        var tr = createElement("tr");
        var isArray = Array.isArray, ArrayPrototype = Array.prototype;
        var concat = ArrayPrototype.concat, filter = ArrayPrototype.filter, indexOf2 = ArrayPrototype.indexOf, map = ArrayPrototype.map, push = ArrayPrototype.push, slice = ArrayPrototype.slice, some = ArrayPrototype.some, splice = ArrayPrototype.splice;
        var idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
        var classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
        var htmlRe = /<.+>/;
        var tagRe = /^\w+$/;
        function find(selector, context) {
          var isFragment = isDocumentFragment(context);
          return !selector || !isFragment && !isDocument(context) && !isElement(context) ? [] : !isFragment && classRe.test(selector) ? context.getElementsByClassName(selector.slice(1).replace(/\\/g, "")) : !isFragment && tagRe.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
        }
        var Cash = (
          /** @class */
          function() {
            function Cash2(selector, context) {
              if (!selector)
                return;
              if (isCash(selector))
                return selector;
              var eles = selector;
              if (isString(selector)) {
                var ctx = context || doc;
                eles = idRe.test(selector) && isDocument(ctx) ? ctx.getElementById(selector.slice(1).replace(/\\/g, "")) : htmlRe.test(selector) ? parseHTML(selector) : isCash(ctx) ? ctx.find(selector) : isString(ctx) ? cash3(ctx).find(selector) : find(selector, ctx);
                if (!eles)
                  return;
              } else if (isFunction(selector)) {
                return this.ready(selector);
              }
              if (eles.nodeType || eles === win)
                eles = [eles];
              this.length = eles.length;
              for (var i = 0, l = this.length; i < l; i++) {
                this[i] = eles[i];
              }
            }
            Cash2.prototype.init = function(selector, context) {
              return new Cash2(selector, context);
            };
            return Cash2;
          }()
        );
        var fn = Cash.prototype;
        var cash3 = fn.init;
        cash3.fn = cash3.prototype = fn;
        fn.length = 0;
        fn.splice = splice;
        if (typeof Symbol === "function") {
          fn[Symbol["iterator"]] = ArrayPrototype[Symbol["iterator"]];
        }
        function isCash(value) {
          return value instanceof Cash;
        }
        function isWindow(value) {
          return !!value && value === value.window;
        }
        function isDocument(value) {
          return !!value && value.nodeType === 9;
        }
        function isDocumentFragment(value) {
          return !!value && value.nodeType === 11;
        }
        function isElement(value) {
          return !!value && value.nodeType === 1;
        }
        function isText(value) {
          return !!value && value.nodeType === 3;
        }
        function isBoolean(value) {
          return typeof value === "boolean";
        }
        function isFunction(value) {
          return typeof value === "function";
        }
        function isString(value) {
          return typeof value === "string";
        }
        function isUndefined(value) {
          return value === void 0;
        }
        function isNull(value) {
          return value === null;
        }
        function isNumeric(value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
        }
        function isPlainObject(value) {
          if (typeof value !== "object" || value === null)
            return false;
          var proto = Object.getPrototypeOf(value);
          return proto === null || proto === Object.prototype;
        }
        cash3.isWindow = isWindow;
        cash3.isFunction = isFunction;
        cash3.isArray = isArray;
        cash3.isNumeric = isNumeric;
        cash3.isPlainObject = isPlainObject;
        function each(arr, callback, _reverse) {
          if (_reverse) {
            var i = arr.length;
            while (i--) {
              if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
            }
          } else if (isPlainObject(arr)) {
            var keys = Object.keys(arr);
            for (var i = 0, l = keys.length; i < l; i++) {
              var key = keys[i];
              if (callback.call(arr[key], key, arr[key]) === false)
                return arr;
            }
          } else {
            for (var i = 0, l = arr.length; i < l; i++) {
              if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
            }
          }
          return arr;
        }
        cash3.each = each;
        fn.each = function(callback) {
          return each(this, callback);
        };
        fn.empty = function() {
          return this.each(function(i, ele) {
            while (ele.firstChild) {
              ele.removeChild(ele.firstChild);
            }
          });
        };
        function extend3() {
          var sources = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            sources[_i] = arguments[_i];
          }
          var deep = isBoolean(sources[0]) ? sources.shift() : false;
          var target = sources.shift();
          var length = sources.length;
          if (!target)
            return {};
          if (!length)
            return extend3(deep, cash3, target);
          for (var i = 0; i < length; i++) {
            var source = sources[i];
            for (var key in source) {
              if (deep && (isArray(source[key]) || isPlainObject(source[key]))) {
                if (!target[key] || target[key].constructor !== source[key].constructor)
                  target[key] = new source[key].constructor();
                extend3(deep, target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            }
          }
          return target;
        }
        cash3.extend = extend3;
        fn.extend = function(plugins) {
          return extend3(fn, plugins);
        };
        var splitValuesRe = /\S+/g;
        function getSplitValues(str) {
          return isString(str) ? str.match(splitValuesRe) || [] : [];
        }
        fn.toggleClass = function(cls, force) {
          var classes = getSplitValues(cls);
          var isForce = !isUndefined(force);
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            each(classes, function(i2, c) {
              if (isForce) {
                force ? ele.classList.add(c) : ele.classList.remove(c);
              } else {
                ele.classList.toggle(c);
              }
            });
          });
        };
        fn.addClass = function(cls) {
          return this.toggleClass(cls, true);
        };
        fn.removeAttr = function(attr2) {
          var attrs = getSplitValues(attr2);
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            each(attrs, function(i2, a) {
              ele.removeAttribute(a);
            });
          });
        };
        function attr(attr2, value) {
          if (!attr2)
            return;
          if (isString(attr2)) {
            if (arguments.length < 2) {
              if (!this[0] || !isElement(this[0]))
                return;
              var value_1 = this[0].getAttribute(attr2);
              return isNull(value_1) ? void 0 : value_1;
            }
            if (isUndefined(value))
              return this;
            if (isNull(value))
              return this.removeAttr(attr2);
            return this.each(function(i, ele) {
              if (!isElement(ele))
                return;
              ele.setAttribute(attr2, value);
            });
          }
          for (var key in attr2) {
            this.attr(key, attr2[key]);
          }
          return this;
        }
        fn.attr = attr;
        fn.removeClass = function(cls) {
          if (arguments.length)
            return this.toggleClass(cls, false);
          return this.attr("class", "");
        };
        fn.hasClass = function(cls) {
          return !!cls && some.call(this, function(ele) {
            return isElement(ele) && ele.classList.contains(cls);
          });
        };
        fn.get = function(index) {
          if (isUndefined(index))
            return slice.call(this);
          index = Number(index);
          return this[index < 0 ? index + this.length : index];
        };
        fn.eq = function(index) {
          return cash3(this.get(index));
        };
        fn.first = function() {
          return this.eq(0);
        };
        fn.last = function() {
          return this.eq(-1);
        };
        function text(text2) {
          if (isUndefined(text2)) {
            return this.get().map(function(ele) {
              return isElement(ele) || isText(ele) ? ele.textContent : "";
            }).join("");
          }
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            ele.textContent = text2;
          });
        }
        fn.text = text;
        function computeStyle(ele, prop, isVariable) {
          if (!isElement(ele))
            return;
          var style2 = win.getComputedStyle(ele, null);
          return isVariable ? style2.getPropertyValue(prop) || void 0 : style2[prop] || ele.style[prop];
        }
        function computeStyleInt(ele, prop) {
          return parseInt(computeStyle(ele, prop), 10) || 0;
        }
        function getExtraSpace(ele, xAxis) {
          return computeStyleInt(ele, "border".concat(xAxis ? "Left" : "Top", "Width")) + computeStyleInt(ele, "padding".concat(xAxis ? "Left" : "Top")) + computeStyleInt(ele, "padding".concat(xAxis ? "Right" : "Bottom")) + computeStyleInt(ele, "border".concat(xAxis ? "Right" : "Bottom", "Width"));
        }
        var defaultDisplay = {};
        function getDefaultDisplay(tagName) {
          if (defaultDisplay[tagName])
            return defaultDisplay[tagName];
          var ele = createElement(tagName);
          doc.body.insertBefore(ele, null);
          var display = computeStyle(ele, "display");
          doc.body.removeChild(ele);
          return defaultDisplay[tagName] = display !== "none" ? display : "block";
        }
        function isHidden(ele) {
          return computeStyle(ele, "display") === "none";
        }
        function matches(ele, selector) {
          var matches2 = ele && (ele["matches"] || ele["webkitMatchesSelector"] || ele["msMatchesSelector"]);
          return !!matches2 && !!selector && matches2.call(ele, selector);
        }
        function getCompareFunction(comparator) {
          return isString(comparator) ? function(i, ele) {
            return matches(ele, comparator);
          } : isFunction(comparator) ? comparator : isCash(comparator) ? function(i, ele) {
            return comparator.is(ele);
          } : !comparator ? function() {
            return false;
          } : function(i, ele) {
            return ele === comparator;
          };
        }
        fn.filter = function(comparator) {
          var compare = getCompareFunction(comparator);
          return cash3(filter.call(this, function(ele, i) {
            return compare.call(ele, i, ele);
          }));
        };
        function filtered(collection, comparator) {
          return !comparator ? collection : collection.filter(comparator);
        }
        fn.detach = function(comparator) {
          filtered(this, comparator).each(function(i, ele) {
            if (ele.parentNode) {
              ele.parentNode.removeChild(ele);
            }
          });
          return this;
        };
        var fragmentRe = /^\s*<(\w+)[^>]*>/;
        var singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
        var containers = {
          "*": div,
          tr: tbody,
          td: tr,
          th: tr,
          thead: table,
          tbody: table,
          tfoot: table
        };
        function parseHTML(html2) {
          if (!isString(html2))
            return [];
          if (singleTagRe.test(html2))
            return [createElement(RegExp.$1)];
          var fragment = fragmentRe.test(html2) && RegExp.$1;
          var container = containers[fragment] || containers["*"];
          container.innerHTML = html2;
          return cash3(container.childNodes).detach().get();
        }
        cash3.parseHTML = parseHTML;
        fn.has = function(selector) {
          var comparator = isString(selector) ? function(i, ele) {
            return find(selector, ele).length;
          } : function(i, ele) {
            return ele.contains(selector);
          };
          return this.filter(comparator);
        };
        fn.not = function(comparator) {
          var compare = getCompareFunction(comparator);
          return this.filter(function(i, ele) {
            return (!isString(comparator) || isElement(ele)) && !compare.call(ele, i, ele);
          });
        };
        function pluck(arr, prop, deep, until) {
          var plucked = [];
          var isCallback = isFunction(prop);
          var compare = until && getCompareFunction(until);
          for (var i = 0, l = arr.length; i < l; i++) {
            if (isCallback) {
              var val_1 = prop(arr[i]);
              if (val_1.length)
                push.apply(plucked, val_1);
            } else {
              var val_2 = arr[i][prop];
              while (val_2 != null) {
                if (until && compare(-1, val_2))
                  break;
                plucked.push(val_2);
                val_2 = deep ? val_2[prop] : null;
              }
            }
          }
          return plucked;
        }
        function getValue(ele) {
          if (ele.multiple && ele.options)
            return pluck(filter.call(ele.options, function(option) {
              return option.selected && !option.disabled && !option.parentNode.disabled;
            }), "value");
          return ele.value || "";
        }
        function val(value) {
          if (!arguments.length)
            return this[0] && getValue(this[0]);
          return this.each(function(i, ele) {
            var isSelect = ele.multiple && ele.options;
            if (isSelect || checkableRe.test(ele.type)) {
              var eleValue_1 = isArray(value) ? map.call(value, String) : isNull(value) ? [] : [String(value)];
              if (isSelect) {
                each(ele.options, function(i2, option) {
                  option.selected = eleValue_1.indexOf(option.value) >= 0;
                }, true);
              } else {
                ele.checked = eleValue_1.indexOf(ele.value) >= 0;
              }
            } else {
              ele.value = isUndefined(value) || isNull(value) ? "" : value;
            }
          });
        }
        fn.val = val;
        fn.is = function(comparator) {
          var compare = getCompareFunction(comparator);
          return some.call(this, function(ele, i) {
            return compare.call(ele, i, ele);
          });
        };
        cash3.guid = 1;
        function unique(arr) {
          return arr.length > 1 ? filter.call(arr, function(item, index, self2) {
            return indexOf2.call(self2, item) === index;
          }) : arr;
        }
        cash3.unique = unique;
        fn.add = function(selector, context) {
          return cash3(unique(this.get().concat(cash3(selector, context).get())));
        };
        fn.children = function(comparator) {
          return filtered(cash3(unique(pluck(this, function(ele) {
            return ele.children;
          }))), comparator);
        };
        fn.parent = function(comparator) {
          return filtered(cash3(unique(pluck(this, "parentNode"))), comparator);
        };
        fn.index = function(selector) {
          var child = selector ? cash3(selector)[0] : this[0];
          var collection = selector ? this : cash3(child).parent().children();
          return indexOf2.call(collection, child);
        };
        fn.closest = function(comparator) {
          var filtered2 = this.filter(comparator);
          if (filtered2.length)
            return filtered2;
          var $parent = this.parent();
          if (!$parent.length)
            return filtered2;
          return $parent.closest(comparator);
        };
        fn.siblings = function(comparator) {
          return filtered(cash3(unique(pluck(this, function(ele) {
            return cash3(ele).parent().children().not(ele);
          }))), comparator);
        };
        fn.find = function(selector) {
          return cash3(unique(pluck(this, function(ele) {
            return find(selector, ele);
          })));
        };
        var HTMLCDATARe = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
        var scriptTypeRe = /^$|^module$|\/(java|ecma)script/i;
        var scriptAttributes = ["type", "src", "nonce", "noModule"];
        function evalScripts(node, doc2) {
          var collection = cash3(node);
          collection.filter("script").add(collection.find("script")).each(function(i, ele) {
            if (scriptTypeRe.test(ele.type) && docEle.contains(ele)) {
              var script_1 = createElement("script");
              script_1.text = ele.textContent.replace(HTMLCDATARe, "");
              each(scriptAttributes, function(i2, attr2) {
                if (ele[attr2])
                  script_1[attr2] = ele[attr2];
              });
              doc2.head.insertBefore(script_1, null);
              doc2.head.removeChild(script_1);
            }
          });
        }
        function insertElement(anchor, target, left, inside, evaluate) {
          if (inside) {
            anchor.insertBefore(target, left ? anchor.firstChild : null);
          } else {
            if (anchor.nodeName === "HTML") {
              anchor.parentNode.replaceChild(target, anchor);
            } else {
              anchor.parentNode.insertBefore(target, left ? anchor : anchor.nextSibling);
            }
          }
          if (evaluate) {
            evalScripts(target, anchor.ownerDocument);
          }
        }
        function insertSelectors(selectors, anchors, inverse, left, inside, reverseLoop1, reverseLoop2, reverseLoop3) {
          each(selectors, function(si, selector) {
            each(cash3(selector), function(ti, target) {
              each(cash3(anchors), function(ai, anchor) {
                var anchorFinal = inverse ? target : anchor;
                var targetFinal = inverse ? anchor : target;
                var indexFinal = inverse ? ti : ai;
                insertElement(anchorFinal, !indexFinal ? targetFinal : targetFinal.cloneNode(true), left, inside, !indexFinal);
              }, reverseLoop3);
            }, reverseLoop2);
          }, reverseLoop1);
          return anchors;
        }
        fn.after = function() {
          return insertSelectors(arguments, this, false, false, false, true, true);
        };
        fn.append = function() {
          return insertSelectors(arguments, this, false, false, true);
        };
        function html(html2) {
          if (!arguments.length)
            return this[0] && this[0].innerHTML;
          if (isUndefined(html2))
            return this;
          var hasScript = /<script[\s>]/.test(html2);
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            if (hasScript) {
              cash3(ele).empty().append(html2);
            } else {
              ele.innerHTML = html2;
            }
          });
        }
        fn.html = html;
        fn.appendTo = function(selector) {
          return insertSelectors(arguments, this, true, false, true);
        };
        fn.wrapInner = function(selector) {
          return this.each(function(i, ele) {
            var $ele = cash3(ele);
            var contents = $ele.contents();
            contents.length ? contents.wrapAll(selector) : $ele.append(selector);
          });
        };
        fn.before = function() {
          return insertSelectors(arguments, this, false, true);
        };
        fn.wrapAll = function(selector) {
          var structure = cash3(selector);
          var wrapper = structure[0];
          while (wrapper.children.length)
            wrapper = wrapper.firstElementChild;
          this.first().before(structure);
          return this.appendTo(wrapper);
        };
        fn.wrap = function(selector) {
          return this.each(function(i, ele) {
            var wrapper = cash3(selector)[0];
            cash3(ele).wrapAll(!i ? wrapper : wrapper.cloneNode(true));
          });
        };
        fn.insertAfter = function(selector) {
          return insertSelectors(arguments, this, true, false, false, false, false, true);
        };
        fn.insertBefore = function(selector) {
          return insertSelectors(arguments, this, true, true);
        };
        fn.prepend = function() {
          return insertSelectors(arguments, this, false, true, true, true, true);
        };
        fn.prependTo = function(selector) {
          return insertSelectors(arguments, this, true, true, true, false, false, true);
        };
        fn.contents = function() {
          return cash3(unique(pluck(this, function(ele) {
            return ele.tagName === "IFRAME" ? [ele.contentDocument] : ele.tagName === "TEMPLATE" ? ele.content.childNodes : ele.childNodes;
          })));
        };
        fn.next = function(comparator, _all, _until) {
          return filtered(cash3(unique(pluck(this, "nextElementSibling", _all, _until))), comparator);
        };
        fn.nextAll = function(comparator) {
          return this.next(comparator, true);
        };
        fn.nextUntil = function(until, comparator) {
          return this.next(comparator, true, until);
        };
        fn.parents = function(comparator, _until) {
          return filtered(cash3(unique(pluck(this, "parentElement", true, _until))), comparator);
        };
        fn.parentsUntil = function(until, comparator) {
          return this.parents(comparator, until);
        };
        fn.prev = function(comparator, _all, _until) {
          return filtered(cash3(unique(pluck(this, "previousElementSibling", _all, _until))), comparator);
        };
        fn.prevAll = function(comparator) {
          return this.prev(comparator, true);
        };
        fn.prevUntil = function(until, comparator) {
          return this.prev(comparator, true, until);
        };
        fn.map = function(callback) {
          return cash3(concat.apply([], map.call(this, function(ele, i) {
            return callback.call(ele, i, ele);
          })));
        };
        fn.clone = function() {
          return this.map(function(i, ele) {
            return ele.cloneNode(true);
          });
        };
        fn.offsetParent = function() {
          return this.map(function(i, ele) {
            var offsetParent = ele.offsetParent;
            while (offsetParent && computeStyle(offsetParent, "position") === "static") {
              offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docEle;
          });
        };
        fn.slice = function(start3, end) {
          return cash3(slice.call(this, start3, end));
        };
        var dashAlphaRe = /-([a-z])/g;
        function camelCase(str) {
          return str.replace(dashAlphaRe, function(match, letter) {
            return letter.toUpperCase();
          });
        }
        fn.ready = function(callback) {
          var cb = function() {
            return setTimeout(callback, 0, cash3);
          };
          if (doc.readyState !== "loading") {
            cb();
          } else {
            doc.addEventListener("DOMContentLoaded", cb);
          }
          return this;
        };
        fn.unwrap = function() {
          this.parent().each(function(i, ele) {
            if (ele.tagName === "BODY")
              return;
            var $ele = cash3(ele);
            $ele.replaceWith($ele.children());
          });
          return this;
        };
        fn.offset = function() {
          var ele = this[0];
          if (!ele)
            return;
          var rect = ele.getBoundingClientRect();
          return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
          };
        };
        fn.position = function() {
          var ele = this[0];
          if (!ele)
            return;
          var isFixed = computeStyle(ele, "position") === "fixed";
          var offset = isFixed ? ele.getBoundingClientRect() : this.offset();
          if (!isFixed) {
            var doc_1 = ele.ownerDocument;
            var offsetParent = ele.offsetParent || doc_1.documentElement;
            while ((offsetParent === doc_1.body || offsetParent === doc_1.documentElement) && computeStyle(offsetParent, "position") === "static") {
              offsetParent = offsetParent.parentNode;
            }
            if (offsetParent !== ele && isElement(offsetParent)) {
              var parentOffset = cash3(offsetParent).offset();
              offset.top -= parentOffset.top + computeStyleInt(offsetParent, "borderTopWidth");
              offset.left -= parentOffset.left + computeStyleInt(offsetParent, "borderLeftWidth");
            }
          }
          return {
            top: offset.top - computeStyleInt(ele, "marginTop"),
            left: offset.left - computeStyleInt(ele, "marginLeft")
          };
        };
        var propMap = {
          /* GENERAL */
          class: "className",
          contenteditable: "contentEditable",
          /* LABEL */
          for: "htmlFor",
          /* INPUT */
          readonly: "readOnly",
          maxlength: "maxLength",
          tabindex: "tabIndex",
          /* TABLE */
          colspan: "colSpan",
          rowspan: "rowSpan",
          /* IMAGE */
          usemap: "useMap"
        };
        fn.prop = function(prop, value) {
          if (!prop)
            return;
          if (isString(prop)) {
            prop = propMap[prop] || prop;
            if (arguments.length < 2)
              return this[0] && this[0][prop];
            return this.each(function(i, ele) {
              ele[prop] = value;
            });
          }
          for (var key in prop) {
            this.prop(key, prop[key]);
          }
          return this;
        };
        fn.removeProp = function(prop) {
          return this.each(function(i, ele) {
            delete ele[propMap[prop] || prop];
          });
        };
        var cssVariableRe = /^--/;
        function isCSSVariable(prop) {
          return cssVariableRe.test(prop);
        }
        var prefixedProps = {};
        var style = div.style;
        var vendorsPrefixes = ["webkit", "moz", "ms"];
        function getPrefixedProp(prop, isVariable) {
          if (isVariable === void 0) {
            isVariable = isCSSVariable(prop);
          }
          if (isVariable)
            return prop;
          if (!prefixedProps[prop]) {
            var propCC = camelCase(prop);
            var propUC = "".concat(propCC[0].toUpperCase()).concat(propCC.slice(1));
            var props = "".concat(propCC, " ").concat(vendorsPrefixes.join("".concat(propUC, " "))).concat(propUC).split(" ");
            each(props, function(i, p) {
              if (p in style) {
                prefixedProps[prop] = p;
                return false;
              }
            });
          }
          return prefixedProps[prop];
        }
        var numericProps = {
          animationIterationCount: true,
          columnCount: true,
          flexGrow: true,
          flexShrink: true,
          fontWeight: true,
          gridArea: true,
          gridColumn: true,
          gridColumnEnd: true,
          gridColumnStart: true,
          gridRow: true,
          gridRowEnd: true,
          gridRowStart: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          widows: true,
          zIndex: true
        };
        function getSuffixedValue(prop, value, isVariable) {
          if (isVariable === void 0) {
            isVariable = isCSSVariable(prop);
          }
          return !isVariable && !numericProps[prop] && isNumeric(value) ? "".concat(value, "px") : value;
        }
        function css(prop, value) {
          if (isString(prop)) {
            var isVariable_1 = isCSSVariable(prop);
            prop = getPrefixedProp(prop, isVariable_1);
            if (arguments.length < 2)
              return this[0] && computeStyle(this[0], prop, isVariable_1);
            if (!prop)
              return this;
            value = getSuffixedValue(prop, value, isVariable_1);
            return this.each(function(i, ele) {
              if (!isElement(ele))
                return;
              if (isVariable_1) {
                ele.style.setProperty(prop, value);
              } else {
                ele.style[prop] = value;
              }
            });
          }
          for (var key in prop) {
            this.css(key, prop[key]);
          }
          return this;
        }
        ;
        fn.css = css;
        function attempt(fn2, arg) {
          try {
            return fn2(arg);
          } catch (_a) {
            return arg;
          }
        }
        var JSONStringRe = /^\s+|\s+$/;
        function getData(ele, key) {
          var value = ele.dataset[key] || ele.dataset[camelCase(key)];
          if (JSONStringRe.test(value))
            return value;
          return attempt(JSON.parse, value);
        }
        function setData(ele, key, value) {
          value = attempt(JSON.stringify, value);
          ele.dataset[camelCase(key)] = value;
        }
        function data(name, value) {
          if (!name) {
            if (!this[0])
              return;
            var datas = {};
            for (var key in this[0].dataset) {
              datas[key] = getData(this[0], key);
            }
            return datas;
          }
          if (isString(name)) {
            if (arguments.length < 2)
              return this[0] && getData(this[0], name);
            if (isUndefined(value))
              return this;
            return this.each(function(i, ele) {
              setData(ele, name, value);
            });
          }
          for (var key in name) {
            this.data(key, name[key]);
          }
          return this;
        }
        fn.data = data;
        function getDocumentDimension(doc2, dimension) {
          var docEle2 = doc2.documentElement;
          return Math.max(doc2.body["scroll".concat(dimension)], docEle2["scroll".concat(dimension)], doc2.body["offset".concat(dimension)], docEle2["offset".concat(dimension)], docEle2["client".concat(dimension)]);
        }
        each([true, false], function(i, outer) {
          each(["Width", "Height"], function(i2, prop) {
            var name = "".concat(outer ? "outer" : "inner").concat(prop);
            fn[name] = function(includeMargins) {
              if (!this[0])
                return;
              if (isWindow(this[0]))
                return outer ? this[0]["inner".concat(prop)] : this[0].document.documentElement["client".concat(prop)];
              if (isDocument(this[0]))
                return getDocumentDimension(this[0], prop);
              return this[0]["".concat(outer ? "offset" : "client").concat(prop)] + (includeMargins && outer ? computeStyleInt(this[0], "margin".concat(i2 ? "Top" : "Left")) + computeStyleInt(this[0], "margin".concat(i2 ? "Bottom" : "Right")) : 0);
            };
          });
        });
        each(["Width", "Height"], function(index, prop) {
          var propLC = prop.toLowerCase();
          fn[propLC] = function(value) {
            if (!this[0])
              return isUndefined(value) ? void 0 : this;
            if (!arguments.length) {
              if (isWindow(this[0]))
                return this[0].document.documentElement["client".concat(prop)];
              if (isDocument(this[0]))
                return getDocumentDimension(this[0], prop);
              return this[0].getBoundingClientRect()[propLC] - getExtraSpace(this[0], !index);
            }
            var valueNumber = parseInt(value, 10);
            return this.each(function(i, ele) {
              if (!isElement(ele))
                return;
              var boxSizing = computeStyle(ele, "boxSizing");
              ele.style[propLC] = getSuffixedValue(propLC, valueNumber + (boxSizing === "border-box" ? getExtraSpace(ele, !index) : 0));
            });
          };
        });
        var displayProperty = "___cd";
        fn.toggle = function(force) {
          return this.each(function(i, ele) {
            if (!isElement(ele))
              return;
            var hidden = isHidden(ele);
            var show = isUndefined(force) ? hidden : force;
            if (show) {
              ele.style.display = ele[displayProperty] || "";
              if (isHidden(ele)) {
                ele.style.display = getDefaultDisplay(ele.tagName);
              }
            } else if (!hidden) {
              ele[displayProperty] = computeStyle(ele, "display");
              ele.style.display = "none";
            }
          });
        };
        fn.hide = function() {
          return this.toggle(false);
        };
        fn.show = function() {
          return this.toggle(true);
        };
        var eventsNamespace = "___ce";
        var eventsNamespacesSeparator = ".";
        var eventsFocus = { focus: "focusin", blur: "focusout" };
        var eventsHover = { mouseenter: "mouseover", mouseleave: "mouseout" };
        var eventsMouseRe = /^(mouse|pointer|contextmenu|drag|drop|click|dblclick)/i;
        function getEventNameBubbling(name) {
          return eventsHover[name] || eventsFocus[name] || name;
        }
        function parseEventName(eventName) {
          var parts = eventName.split(eventsNamespacesSeparator);
          return [parts[0], parts.slice(1).sort()];
        }
        fn.trigger = function(event, data2) {
          if (isString(event)) {
            var _a = parseEventName(event), nameOriginal = _a[0], namespaces = _a[1];
            var name_1 = getEventNameBubbling(nameOriginal);
            if (!name_1)
              return this;
            var type = eventsMouseRe.test(name_1) ? "MouseEvents" : "HTMLEvents";
            event = doc.createEvent(type);
            event.initEvent(name_1, true, true);
            event.namespace = namespaces.join(eventsNamespacesSeparator);
            event.___ot = nameOriginal;
          }
          event.___td = data2;
          var isEventFocus = event.___ot in eventsFocus;
          return this.each(function(i, ele) {
            if (isEventFocus && isFunction(ele[event.___ot])) {
              ele["___i".concat(event.type)] = true;
              ele[event.___ot]();
              ele["___i".concat(event.type)] = false;
            }
            ele.dispatchEvent(event);
          });
        };
        function getEventsCache(ele) {
          return ele[eventsNamespace] = ele[eventsNamespace] || {};
        }
        function addEvent(ele, name, namespaces, selector, callback) {
          var eventCache = getEventsCache(ele);
          eventCache[name] = eventCache[name] || [];
          eventCache[name].push([namespaces, selector, callback]);
          ele.addEventListener(name, callback);
        }
        function hasNamespaces(ns1, ns2) {
          return !ns2 || !some.call(ns2, function(ns) {
            return ns1.indexOf(ns) < 0;
          });
        }
        function removeEvent(ele, name, namespaces, selector, callback) {
          var cache2 = getEventsCache(ele);
          if (!name) {
            for (name in cache2) {
              removeEvent(ele, name, namespaces, selector, callback);
            }
          } else if (cache2[name]) {
            cache2[name] = cache2[name].filter(function(_a) {
              var ns = _a[0], sel = _a[1], cb = _a[2];
              if (callback && cb.guid !== callback.guid || !hasNamespaces(ns, namespaces) || selector && selector !== sel)
                return true;
              ele.removeEventListener(name, cb);
            });
          }
        }
        fn.off = function(eventFullName, selector, callback) {
          var _this = this;
          if (isUndefined(eventFullName)) {
            this.each(function(i, ele) {
              if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                return;
              removeEvent(ele);
            });
          } else if (!isString(eventFullName)) {
            for (var key in eventFullName) {
              this.off(key, eventFullName[key]);
            }
          } else {
            if (isFunction(selector)) {
              callback = selector;
              selector = "";
            }
            each(getSplitValues(eventFullName), function(i, eventFullName2) {
              var _a = parseEventName(eventFullName2), nameOriginal = _a[0], namespaces = _a[1];
              var name = getEventNameBubbling(nameOriginal);
              _this.each(function(i2, ele) {
                if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                  return;
                removeEvent(ele, name, namespaces, selector, callback);
              });
            });
          }
          return this;
        };
        fn.remove = function(comparator) {
          filtered(this, comparator).detach().off();
          return this;
        };
        fn.replaceWith = function(selector) {
          return this.before(selector).remove();
        };
        fn.replaceAll = function(selector) {
          cash3(selector).replaceWith(this);
          return this;
        };
        function on(eventFullName, selector, data2, callback, _one) {
          var _this = this;
          if (!isString(eventFullName)) {
            for (var key in eventFullName) {
              this.on(key, selector, data2, eventFullName[key], _one);
            }
            return this;
          }
          if (!isString(selector)) {
            if (isUndefined(selector) || isNull(selector)) {
              selector = "";
            } else if (isUndefined(data2)) {
              data2 = selector;
              selector = "";
            } else {
              callback = data2;
              data2 = selector;
              selector = "";
            }
          }
          if (!isFunction(callback)) {
            callback = data2;
            data2 = void 0;
          }
          if (!callback)
            return this;
          each(getSplitValues(eventFullName), function(i, eventFullName2) {
            var _a = parseEventName(eventFullName2), nameOriginal = _a[0], namespaces = _a[1];
            var name = getEventNameBubbling(nameOriginal);
            var isEventHover = nameOriginal in eventsHover;
            var isEventFocus = nameOriginal in eventsFocus;
            if (!name)
              return;
            _this.each(function(i2, ele) {
              if (!isElement(ele) && !isDocument(ele) && !isWindow(ele))
                return;
              var finalCallback = function(event) {
                if (event.target["___i".concat(event.type)])
                  return event.stopImmediatePropagation();
                if (event.namespace && !hasNamespaces(namespaces, event.namespace.split(eventsNamespacesSeparator)))
                  return;
                if (!selector && (isEventFocus && (event.target !== ele || event.___ot === name) || isEventHover && event.relatedTarget && ele.contains(event.relatedTarget)))
                  return;
                var thisArg = ele;
                if (selector) {
                  var target = event.target;
                  while (!matches(target, selector)) {
                    if (target === ele)
                      return;
                    target = target.parentNode;
                    if (!target)
                      return;
                  }
                  thisArg = target;
                }
                Object.defineProperty(event, "currentTarget", {
                  configurable: true,
                  get: function() {
                    return thisArg;
                  }
                });
                Object.defineProperty(event, "delegateTarget", {
                  configurable: true,
                  get: function() {
                    return ele;
                  }
                });
                Object.defineProperty(event, "data", {
                  configurable: true,
                  get: function() {
                    return data2;
                  }
                });
                var returnValue = callback.call(thisArg, event, event.___td);
                if (_one) {
                  removeEvent(ele, name, namespaces, selector, finalCallback);
                }
                if (returnValue === false) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              };
              finalCallback.guid = callback.guid = callback.guid || cash3.guid++;
              addEvent(ele, name, namespaces, selector, finalCallback);
            });
          });
          return this;
        }
        fn.on = on;
        function one(eventFullName, selector, data2, callback) {
          return this.on(eventFullName, selector, data2, callback, true);
        }
        ;
        fn.one = one;
        var queryEncodeCRLFRe = /\r?\n/g;
        function queryEncode(prop, value) {
          return "&".concat(encodeURIComponent(prop), "=").concat(encodeURIComponent(value.replace(queryEncodeCRLFRe, "\r\n")));
        }
        var skippableRe = /file|reset|submit|button|image/i;
        var checkableRe = /radio|checkbox/i;
        fn.serialize = function() {
          var query = "";
          this.each(function(i, ele) {
            each(ele.elements || [ele], function(i2, ele2) {
              if (ele2.disabled || !ele2.name || ele2.tagName === "FIELDSET" || skippableRe.test(ele2.type) || checkableRe.test(ele2.type) && !ele2.checked)
                return;
              var value = getValue(ele2);
              if (!isUndefined(value)) {
                var values = isArray(value) ? value : [value];
                each(values, function(i3, value2) {
                  query += queryEncode(ele2.name, value2);
                });
              }
            });
          });
          return query.slice(1);
        };
        if (typeof exports !== "undefined") {
          module.exports = cash3;
        } else {
          win["cash"] = win["$"] = cash3;
        }
      })();
    }
  });

  // ../../node_modules/preline/dist/preline.js
  var require_preline = __commonJS({
    "../../node_modules/preline/dist/preline.js"(exports, module) {
      !function(e, t) {
        if ("object" == typeof exports && "object" == typeof module)
          module.exports = t();
        else if ("function" == typeof define && define.amd)
          define([], t);
        else {
          var o = t();
          for (var n in o)
            ("object" == typeof exports ? exports : e)[n] = o[n];
        }
      }(self, function() {
        return (() => {
          "use strict";
          var e = { 661: (e2, t2, o2) => {
            function n2(e3) {
              return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, n2(e3);
            }
            function r(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function i(e3, t3) {
              return i = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, i(e3, t3);
            }
            function a(e3, t3) {
              if (t3 && ("object" === n2(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function s(e3) {
              return s = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, s(e3);
            }
            var c = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && i(e4, t4);
              }(u, e3);
              var t3, o3, n3, c2, l = (n3 = u, c2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = s(n3);
                if (c2) {
                  var o4 = s(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return a(this, e4);
              });
              function u() {
                return function(e4, t4) {
                  if (!(e4 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, u), l.call(this, ".hs-accordion");
              }
              return t3 = u, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("click", function(t4) {
                  var o4 = t4.target, n4 = o4.closest(e4.selector), r2 = o4.closest(".hs-accordion-toggle"), i2 = o4.closest(".hs-accordion-group");
                  n4 && i2 && r2 && (e4._hideAll(n4), e4.show(n4));
                });
              } }, { key: "show", value: function(e4) {
                var t4 = this;
                if (e4.classList.contains("active"))
                  return this.hide(e4);
                e4.classList.add("active");
                var o4 = e4.querySelector(".hs-accordion-content");
                o4.style.display = "block", o4.style.height = 0, setTimeout(function() {
                  o4.style.height = "".concat(o4.scrollHeight, "px");
                }), this.afterTransition(o4, function() {
                  e4.classList.contains("active") && (o4.style.height = "", t4._fireEvent("open", e4), t4._dispatch("open.hs.accordion", e4, e4));
                });
              } }, { key: "hide", value: function(e4) {
                var t4 = this, o4 = e4.querySelector(".hs-accordion-content");
                o4.style.height = "".concat(o4.scrollHeight, "px"), setTimeout(function() {
                  o4.style.height = 0;
                }), this.afterTransition(o4, function() {
                  e4.classList.contains("active") || (o4.style.display = "", t4._fireEvent("hide", e4), t4._dispatch("hide.hs.accordion", e4, e4));
                }), e4.classList.remove("active");
              } }, { key: "_hideAll", value: function(e4) {
                var t4 = this, o4 = e4.closest(".hs-accordion-group");
                o4.hasAttribute("data-hs-accordion-always-open") || o4.querySelectorAll(this.selector).forEach(function(o5) {
                  e4 !== o5 && t4.hide(o5);
                });
              } }]) && r(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), u;
            }(o2(765).Z);
            window.HSAccordion = new c(), document.addEventListener("load", window.HSAccordion.init());
          }, 795: (e2, t2, o2) => {
            function n2(e3) {
              return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, n2(e3);
            }
            function r(e3, t3) {
              (null == t3 || t3 > e3.length) && (t3 = e3.length);
              for (var o3 = 0, n3 = new Array(t3); o3 < t3; o3++)
                n3[o3] = e3[o3];
              return n3;
            }
            function i(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function a(e3, t3) {
              return a = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, a(e3, t3);
            }
            function s(e3, t3) {
              if (t3 && ("object" === n2(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function c(e3) {
              return c = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, c(e3);
            }
            var l = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && a(e4, t4);
              }(f, e3);
              var t3, o3, n3, l2, u = (n3 = f, l2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = c(n3);
                if (l2) {
                  var o4 = c(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return s(this, e4);
              });
              function f() {
                return function(e4, t4) {
                  if (!(e4 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, f), u.call(this, "[data-hs-collapse]");
              }
              return t3 = f, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("click", function(t4) {
                  var o4 = t4.target.closest(e4.selector);
                  if (o4) {
                    var n4 = document.querySelectorAll(o4.getAttribute("data-hs-collapse"));
                    e4.toggle(n4);
                  }
                });
              } }, { key: "toggle", value: function(e4) {
                var t4, o4 = this;
                e4.length && (t4 = e4, function(e5) {
                  if (Array.isArray(e5))
                    return r(e5);
                }(t4) || function(e5) {
                  if ("undefined" != typeof Symbol && null != e5[Symbol.iterator] || null != e5["@@iterator"])
                    return Array.from(e5);
                }(t4) || function(e5, t5) {
                  if (e5) {
                    if ("string" == typeof e5)
                      return r(e5, t5);
                    var o5 = Object.prototype.toString.call(e5).slice(8, -1);
                    return "Object" === o5 && e5.constructor && (o5 = e5.constructor.name), "Map" === o5 || "Set" === o5 ? Array.from(e5) : "Arguments" === o5 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o5) ? r(e5, t5) : void 0;
                  }
                }(t4) || function() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }()).forEach(function(e5) {
                  e5.classList.contains("hidden") ? o4.show(e5) : o4.hide(e5);
                });
              } }, { key: "show", value: function(e4) {
                var t4 = this;
                e4.classList.add("open"), e4.classList.remove("hidden"), e4.style.height = 0, document.querySelectorAll(this.selector).forEach(function(t5) {
                  e4.closest(t5.getAttribute("data-hs-collapse")) && t5.classList.add("open");
                }), e4.style.height = "".concat(e4.scrollHeight, "px"), this.afterTransition(e4, function() {
                  e4.classList.contains("open") && (e4.style.height = "", t4._fireEvent("open", e4), t4._dispatch("open.hs.collapse", e4, e4));
                });
              } }, { key: "hide", value: function(e4) {
                var t4 = this;
                e4.style.height = "".concat(e4.scrollHeight, "px"), setTimeout(function() {
                  e4.style.height = 0;
                }), e4.classList.remove("open"), this.afterTransition(e4, function() {
                  e4.classList.contains("open") || (e4.classList.add("hidden"), e4.style.height = null, t4._fireEvent("hide", e4), t4._dispatch("hide.hs.collapse", e4, e4), e4.querySelectorAll(".hs-mega-menu-content.block").forEach(function(e5) {
                    e5.classList.remove("block"), e5.classList.add("hidden");
                  }));
                }), document.querySelectorAll(this.selector).forEach(function(t5) {
                  e4.closest(t5.getAttribute("data-hs-collapse")) && t5.classList.remove("open");
                });
              } }]) && i(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), f;
            }(o2(765).Z);
            window.HSCollapse = new l(), document.addEventListener("load", window.HSCollapse.init());
          }, 682: (e2, t2, o2) => {
            var n2 = o2(714), r = o2(765);
            const i = { historyIndex: -1, addHistory: function(e3) {
              this.historyIndex = e3;
            }, existsInHistory: function(e3) {
              return e3 > this.historyIndex;
            }, clearHistory: function() {
              this.historyIndex = -1;
            } };
            function a(e3) {
              return a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, a(e3);
            }
            function s(e3) {
              return function(e4) {
                if (Array.isArray(e4))
                  return c(e4);
              }(e3) || function(e4) {
                if ("undefined" != typeof Symbol && null != e4[Symbol.iterator] || null != e4["@@iterator"])
                  return Array.from(e4);
              }(e3) || function(e4, t3) {
                if (e4) {
                  if ("string" == typeof e4)
                    return c(e4, t3);
                  var o3 = Object.prototype.toString.call(e4).slice(8, -1);
                  return "Object" === o3 && e4.constructor && (o3 = e4.constructor.name), "Map" === o3 || "Set" === o3 ? Array.from(e4) : "Arguments" === o3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o3) ? c(e4, t3) : void 0;
                }
              }(e3) || function() {
                throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
              }();
            }
            function c(e3, t3) {
              (null == t3 || t3 > e3.length) && (t3 = e3.length);
              for (var o3 = 0, n3 = new Array(t3); o3 < t3; o3++)
                n3[o3] = e3[o3];
              return n3;
            }
            function l(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function u(e3, t3) {
              return u = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, u(e3, t3);
            }
            function f(e3, t3) {
              if (t3 && ("object" === a(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function p(e3) {
              return p = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, p(e3);
            }
            var d = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && u(e4, t4);
              }(d2, e3);
              var t3, o3, r2, a2, c2 = (r2 = d2, a2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = p(r2);
                if (a2) {
                  var o4 = p(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return f(this, e4);
              });
              function d2() {
                var e4;
                return function(e5, t4) {
                  if (!(e5 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, d2), (e4 = c2.call(this, ".hs-dropdown")).positions = { top: "top", "top-left": "top-start", "top-right": "top-end", bottom: "bottom", "bottom-left": "bottom-start", "bottom-right": "bottom-end", right: "right", "right-top": "right-start", "right-bottom": "right-end", left: "left", "left-top": "left-start", "left-bottom": "left-end" }, e4.absoluteStrategyModifiers = function(e5) {
                  return [{ name: "applyStyles", fn: function(t4) {
                    var o4 = (window.getComputedStyle(e5).getPropertyValue("--strategy") || "absolute").replace(" ", ""), n3 = (window.getComputedStyle(e5).getPropertyValue("--adaptive") || "adaptive").replace(" ", "");
                    t4.state.elements.popper.style.position = o4, t4.state.elements.popper.style.transform = "adaptive" === n3 ? t4.state.styles.popper.transform : null, t4.state.elements.popper.style.top = null, t4.state.elements.popper.style.bottom = null, t4.state.elements.popper.style.left = null, t4.state.elements.popper.style.right = null, t4.state.elements.popper.style.margin = 0;
                  } }, { name: "computeStyles", options: { adaptive: false } }];
                }, e4._history = i, e4;
              }
              return t3 = d2, o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("click", function(t4) {
                  var o4 = t4.target, n3 = o4.closest(e4.selector), r3 = o4.closest(".hs-dropdown-menu");
                  if (n3 && n3.classList.contains("open") || e4._closeOthers(n3), r3) {
                    var i2 = (window.getComputedStyle(n3).getPropertyValue("--auto-close") || "").replace(" ", "");
                    if (("false" == i2 || "inside" == i2) && !n3.parentElement.closest(e4.selector))
                      return;
                  }
                  n3 && (n3.classList.contains("open") ? e4.close(n3) : e4.open(n3));
                }), document.addEventListener("mousemove", function(t4) {
                  var o4 = t4.target, n3 = o4.closest(e4.selector);
                  if (o4.closest(".hs-dropdown-menu"), n3) {
                    var r3 = (window.getComputedStyle(n3).getPropertyValue("--trigger") || "click").replace(" ", "");
                    if ("hover" !== r3)
                      return;
                    n3 && n3.classList.contains("open") || e4._closeOthers(n3), "hover" !== r3 || n3.classList.contains("open") || /iPad|iPhone|iPod/.test(navigator.platform) || navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform) || navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform) || e4._hover(o4);
                  }
                }), document.addEventListener("keydown", this._keyboardSupport.bind(this)), window.addEventListener("resize", function() {
                  document.querySelectorAll(".hs-dropdown.open").forEach(function(t4) {
                    e4.close(t4, true);
                  });
                });
              } }, { key: "_closeOthers", value: function() {
                var e4 = this, t4 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, o4 = document.querySelectorAll("".concat(this.selector, ".open"));
                o4.forEach(function(o5) {
                  if (!t4 || t4.closest(".hs-dropdown.open") !== o5) {
                    var n3 = (window.getComputedStyle(o5).getPropertyValue("--auto-close") || "").replace(" ", "");
                    "false" != n3 && "outside" != n3 && e4.close(o5);
                  }
                });
              } }, { key: "_hover", value: function(e4) {
                var t4 = this, o4 = e4.closest(this.selector);
                this.open(o4), document.addEventListener("mousemove", function e5(n3) {
                  n3.target.closest(t4.selector) && n3.target.closest(t4.selector) !== o4.parentElement.closest(t4.selector) || (t4.close(o4), document.removeEventListener("mousemove", e5, true));
                }, true);
              } }, { key: "close", value: function(e4) {
                var t4 = this, o4 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], n3 = e4.querySelector(".hs-dropdown-menu"), r3 = function() {
                  e4.classList.contains("open") || (n3.classList.remove("block"), n3.classList.add("hidden"), n3.style.inset = null, n3.style.position = null, e4._popper && e4._popper.destroy());
                };
                o4 || this.afterTransition(e4.querySelector("[data-hs-dropdown-transition]") || n3, function() {
                  r3();
                }), n3.style.margin = null, e4.classList.remove("open"), o4 && r3(), this._fireEvent("close", e4), this._dispatch("close.hs.dropdown", e4, e4);
                var i2 = n3.querySelectorAll(".hs-dropdown.open");
                i2.forEach(function(e5) {
                  t4.close(e5, true);
                });
              } }, { key: "open", value: function(e4) {
                var t4 = e4.querySelector(".hs-dropdown-menu"), o4 = (window.getComputedStyle(e4).getPropertyValue("--placement") || "").replace(" ", ""), r3 = (window.getComputedStyle(e4).getPropertyValue("--strategy") || "fixed").replace(" ", ""), i2 = ((window.getComputedStyle(e4).getPropertyValue("--adaptive") || "adaptive").replace(" ", ""), parseInt((window.getComputedStyle(e4).getPropertyValue("--offset") || "10").replace(" ", "")));
                if ("static" !== r3) {
                  e4._popper && e4._popper.destroy();
                  var a3 = (0, n2.fi)(e4, t4, { placement: this.positions[o4] || "bottom-start", strategy: r3, modifiers: [].concat(s("fixed" !== r3 ? this.absoluteStrategyModifiers(e4) : []), [{ name: "offset", options: { offset: [0, i2] } }]) });
                  e4._popper = a3;
                }
                t4.style.margin = null, t4.classList.add("block"), t4.classList.remove("hidden"), setTimeout(function() {
                  e4.classList.add("open");
                }), this._fireEvent("open", e4), this._dispatch("open.hs.dropdown", e4, e4);
              } }, { key: "_keyboardSupport", value: function(e4) {
                var t4 = document.querySelector(".hs-dropdown.open");
                if (t4)
                  return 27 === e4.keyCode ? (e4.preventDefault(), this._esc(t4)) : 40 === e4.keyCode ? (e4.preventDefault(), this._down(t4)) : 38 === e4.keyCode ? (e4.preventDefault(), this._up(t4)) : 36 === e4.keyCode ? (e4.preventDefault(), this._start(t4)) : 35 === e4.keyCode ? (e4.preventDefault(), this._end(t4)) : void this._byChar(t4, e4.key);
              } }, { key: "_esc", value: function(e4) {
                this.close(e4);
              } }, { key: "_up", value: function(e4) {
                var t4 = e4.querySelector(".hs-dropdown-menu"), o4 = s(t4.querySelectorAll("a")).reverse().filter(function(e5) {
                  return !e5.disabled;
                }), n3 = t4.querySelector("a:focus"), r3 = o4.findIndex(function(e5) {
                  return e5 === n3;
                });
                r3 + 1 < o4.length && r3++, o4[r3].focus();
              } }, { key: "_down", value: function(e4) {
                var t4 = e4.querySelector(".hs-dropdown-menu"), o4 = s(t4.querySelectorAll("a")).filter(function(e5) {
                  return !e5.disabled;
                }), n3 = t4.querySelector("a:focus"), r3 = o4.findIndex(function(e5) {
                  return e5 === n3;
                });
                r3 + 1 < o4.length && r3++, o4[r3].focus();
              } }, { key: "_start", value: function(e4) {
                var t4 = s(e4.querySelector(".hs-dropdown-menu").querySelectorAll("a")).filter(function(e5) {
                  return !e5.disabled;
                });
                t4.length && t4[0].focus();
              } }, { key: "_end", value: function(e4) {
                var t4 = s(e4.querySelector(".hs-dropdown-menu").querySelectorAll("a")).reverse().filter(function(e5) {
                  return !e5.disabled;
                });
                t4.length && t4[0].focus();
              } }, { key: "_byChar", value: function(e4, t4) {
                var o4 = this, n3 = s(e4.querySelector(".hs-dropdown-menu").querySelectorAll("a")), r3 = function() {
                  return n3.findIndex(function(e5, n4) {
                    return e5.innerText.toLowerCase().charAt(0) === t4.toLowerCase() && o4._history.existsInHistory(n4);
                  });
                }, i2 = r3();
                -1 === i2 && (this._history.clearHistory(), i2 = r3()), -1 !== i2 && (n3[i2].focus(), this._history.addHistory(i2));
              } }, { key: "toggle", value: function(e4) {
                e4.classList.contains("open") ? this.close(e4) : this.open(e4);
              } }], o3 && l(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), d2;
            }(r.Z);
            window.HSDropdown = new d(), document.addEventListener("load", window.HSDropdown.init());
          }, 284: (e2, t2, o2) => {
            function n2(e3) {
              return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, n2(e3);
            }
            function r(e3, t3) {
              (null == t3 || t3 > e3.length) && (t3 = e3.length);
              for (var o3 = 0, n3 = new Array(t3); o3 < t3; o3++)
                n3[o3] = e3[o3];
              return n3;
            }
            function i(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function a(e3, t3) {
              return a = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, a(e3, t3);
            }
            function s(e3, t3) {
              if (t3 && ("object" === n2(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function c(e3) {
              return c = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, c(e3);
            }
            var l = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && a(e4, t4);
              }(f, e3);
              var t3, o3, n3, l2, u = (n3 = f, l2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = c(n3);
                if (l2) {
                  var o4 = c(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return s(this, e4);
              });
              function f() {
                var e4;
                return function(e5, t4) {
                  if (!(e5 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, f), (e4 = u.call(this, "[data-hs-overlay]")).openNextOverlay = false, e4;
              }
              return t3 = f, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("click", function(t4) {
                  var o4 = t4.target.closest(e4.selector), n4 = t4.target.closest("[data-hs-overlay-close]"), r2 = "true" === t4.target.getAttribute("aria-overlay");
                  return n4 ? e4.close(n4.closest(".hs-overlay.open")) : o4 ? e4.toggle(document.querySelector(o4.getAttribute("data-hs-overlay"))) : void (r2 && e4._onBackdropClick(t4.target));
                }), document.addEventListener("keydown", function(t4) {
                  if (27 === t4.keyCode) {
                    var o4 = document.querySelector(".hs-overlay.open");
                    if (!o4)
                      return;
                    setTimeout(function() {
                      "false" !== o4.getAttribute("data-hs-overlay-keyboard") && e4.close(o4);
                    });
                  }
                });
              } }, { key: "toggle", value: function(e4) {
                e4 && (e4.classList.contains("hidden") ? this.open(e4) : this.close(e4));
              } }, { key: "open", value: function(e4) {
                var t4 = this;
                if (e4) {
                  var o4 = document.querySelector(".hs-overlay.open"), n4 = "true" !== this.getClassProperty(e4, "--body-scroll", "false");
                  if (o4)
                    return this.openNextOverlay = true, this.close(o4).then(function() {
                      t4.open(e4), t4.openNextOverlay = false;
                    });
                  n4 && (document.body.style.overflow = "hidden"), this._buildBackdrop(e4), this._checkTimer(e4), this._autoHide(e4), e4.classList.remove("hidden"), e4.setAttribute("aria-overlay", "true"), e4.setAttribute("tabindex", "-1"), setTimeout(function() {
                    e4.classList.contains("hidden") || (e4.classList.add("open"), t4._fireEvent("open", e4), t4._dispatch("open.hs.overlay", e4, e4), t4._focusInput(e4));
                  }, 50);
                }
              } }, { key: "close", value: function(e4) {
                var t4 = this;
                return new Promise(function(o4) {
                  e4 && (e4.classList.remove("open"), e4.removeAttribute("aria-overlay"), e4.removeAttribute("tabindex", "-1"), t4.afterTransition(e4, function() {
                    e4.classList.contains("open") || (e4.classList.add("hidden"), t4._destroyBackdrop(), t4._fireEvent("close", e4), t4._dispatch("close.hs.overlay", e4, e4), document.body.style.overflow = "", o4(e4));
                  }));
                });
              } }, { key: "_autoHide", value: function(e4) {
                var t4 = this, o4 = parseInt(this.getClassProperty(e4, "--auto-hide", "0"));
                o4 && (e4.autoHide = setTimeout(function() {
                  t4.close(e4);
                }, o4));
              } }, { key: "_checkTimer", value: function(e4) {
                e4.autoHide && (clearTimeout(e4.autoHide), delete e4.autoHide);
              } }, { key: "_onBackdropClick", value: function(e4) {
                "static" !== this.getClassProperty(e4, "--overlay-backdrop", "true") && this.close(e4);
              } }, { key: "_buildBackdrop", value: function(e4) {
                var t4, o4 = this, n4 = e4.getAttribute("data-hs-overlay-backdrop-container") || false, i2 = document.createElement("div"), a2 = "transition duration fixed inset-0 z-50 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 hs-overlay-backdrop", s2 = function(e5, t5) {
                  var o5 = "undefined" != typeof Symbol && e5[Symbol.iterator] || e5["@@iterator"];
                  if (!o5) {
                    if (Array.isArray(e5) || (o5 = function(e6, t6) {
                      if (e6) {
                        if ("string" == typeof e6)
                          return r(e6, t6);
                        var o6 = Object.prototype.toString.call(e6).slice(8, -1);
                        return "Object" === o6 && e6.constructor && (o6 = e6.constructor.name), "Map" === o6 || "Set" === o6 ? Array.from(e6) : "Arguments" === o6 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o6) ? r(e6, t6) : void 0;
                      }
                    }(e5)) || t5 && e5 && "number" == typeof e5.length) {
                      o5 && (e5 = o5);
                      var n5 = 0, i3 = function() {
                      };
                      return { s: i3, n: function() {
                        return n5 >= e5.length ? { done: true } : { done: false, value: e5[n5++] };
                      }, e: function(e6) {
                        throw e6;
                      }, f: i3 };
                    }
                    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                  }
                  var a3, s3 = true, c3 = false;
                  return { s: function() {
                    o5 = o5.call(e5);
                  }, n: function() {
                    var e6 = o5.next();
                    return s3 = e6.done, e6;
                  }, e: function(e6) {
                    c3 = true, a3 = e6;
                  }, f: function() {
                    try {
                      s3 || null == o5.return || o5.return();
                    } finally {
                      if (c3)
                        throw a3;
                    }
                  } };
                }(e4.classList.values());
                try {
                  for (s2.s(); !(t4 = s2.n()).done; ) {
                    var c2 = t4.value;
                    c2.startsWith("hs-overlay-backdrop-open:") && (a2 += " ".concat(c2));
                  }
                } catch (e5) {
                  s2.e(e5);
                } finally {
                  s2.f();
                }
                var l3 = "static" !== this.getClassProperty(e4, "--overlay-backdrop", "true");
                "false" === this.getClassProperty(e4, "--overlay-backdrop", "true") || (n4 && ((i2 = document.querySelector(n4).cloneNode(true)).classList.remove("hidden"), a2 = i2.classList, i2.classList = ""), l3 && i2.addEventListener("click", function() {
                  return o4.close(e4);
                }, true), i2.setAttribute("data-hs-overlay-backdrop-template", ""), document.body.appendChild(i2), setTimeout(function() {
                  i2.classList = a2;
                }));
              } }, { key: "_destroyBackdrop", value: function() {
                var e4 = document.querySelector("[data-hs-overlay-backdrop-template]");
                e4 && (this.openNextOverlay && (e4.style.transitionDuration = "".concat(1.8 * parseFloat(window.getComputedStyle(e4).transitionDuration.replace(/[^\d.-]/g, "")), "s")), e4.classList.add("opacity-0"), this.afterTransition(e4, function() {
                  e4.remove();
                }));
              } }, { key: "_focusInput", value: function(e4) {
                var t4 = e4.querySelector("[autofocus]");
                t4 && t4.focus();
              } }]) && i(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), f;
            }(o2(765).Z);
            window.HSOverlay = new l(), document.addEventListener("load", window.HSOverlay.init());
          }, 181: (e2, t2, o2) => {
            function n2(e3) {
              return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, n2(e3);
            }
            function r(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function i(e3, t3) {
              return i = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, i(e3, t3);
            }
            function a(e3, t3) {
              if (t3 && ("object" === n2(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function s(e3) {
              return s = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, s(e3);
            }
            var c = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && i(e4, t4);
              }(u, e3);
              var t3, o3, n3, c2, l = (n3 = u, c2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = s(n3);
                if (c2) {
                  var o4 = s(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return a(this, e4);
              });
              function u() {
                return function(e4, t4) {
                  if (!(e4 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, u), l.call(this, "[data-hs-remove-element]");
              }
              return t3 = u, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("click", function(t4) {
                  var o4 = t4.target.closest(e4.selector);
                  if (o4) {
                    var n4 = document.querySelector(o4.getAttribute("data-hs-remove-element"));
                    n4 && (n4.classList.add("hs-removing"), e4.afterTransition(n4, function() {
                      n4.remove();
                    }));
                  }
                });
              } }]) && r(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), u;
            }(o2(765).Z);
            window.HSRemoveElement = new c(), document.addEventListener("load", window.HSRemoveElement.init());
          }, 778: (e2, t2, o2) => {
            function n2(e3) {
              return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, n2(e3);
            }
            function r(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function i(e3, t3) {
              return i = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, i(e3, t3);
            }
            function a(e3, t3) {
              if (t3 && ("object" === n2(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function s(e3) {
              return s = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, s(e3);
            }
            var c = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && i(e4, t4);
              }(u, e3);
              var t3, o3, n3, c2, l = (n3 = u, c2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = s(n3);
                if (c2) {
                  var o4 = s(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return a(this, e4);
              });
              function u() {
                var e4;
                return function(e5, t4) {
                  if (!(e5 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, u), (e4 = l.call(this, "[data-hs-scrollspy] ")).activeSection = null, e4;
              }
              return t3 = u, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.querySelectorAll(this.selector).forEach(function(t4) {
                  var o4 = document.querySelector(t4.getAttribute("data-hs-scrollspy")), n4 = t4.querySelectorAll("[href]"), r2 = o4.children, i2 = t4.getAttribute("data-hs-scrollspy-scrollable-parent") ? document.querySelector(t4.getAttribute("data-hs-scrollspy-scrollable-parent")) : document;
                  Array.from(r2).forEach(function(a2) {
                    a2.getAttribute("id") && i2.addEventListener("scroll", function(i3) {
                      return e4._update({ $scrollspyEl: t4, $scrollspyContentEl: o4, links: n4, $sectionEl: a2, sections: r2, ev: i3 });
                    });
                  }), n4.forEach(function(o5) {
                    o5.addEventListener("click", function(n5) {
                      n5.preventDefault(), "javascript:;" !== o5.getAttribute("href") && e4._scrollTo({ $scrollspyEl: t4, $scrollableEl: i2, $link: o5 });
                    });
                  });
                });
              } }, { key: "_update", value: function(e4) {
                var t4 = e4.ev, o4 = e4.$scrollspyEl, n4 = (e4.sections, e4.links), r2 = e4.$sectionEl, i2 = parseInt(this.getClassProperty(o4, "--scrollspy-offset", "0")), a2 = this.getClassProperty(r2, "--scrollspy-offset") || i2, s2 = t4.target === document ? 0 : parseInt(t4.target.getBoundingClientRect().top), c3 = parseInt(r2.getBoundingClientRect().top) - a2 - s2, l2 = r2.offsetHeight;
                if (c3 <= 0 && c3 + l2 > 0) {
                  if (this.activeSection === r2)
                    return;
                  n4.forEach(function(e5) {
                    e5.classList.remove("active");
                  });
                  var u2 = o4.querySelector('[href="#'.concat(r2.getAttribute("id"), '"]'));
                  if (u2) {
                    u2.classList.add("active");
                    var f = u2.closest("[data-hs-scrollspy-group]");
                    if (f) {
                      var p = f.querySelector("[href]");
                      p && p.classList.add("active");
                    }
                  }
                  this.activeSection = r2;
                }
              } }, { key: "_scrollTo", value: function(e4) {
                var t4 = e4.$scrollspyEl, o4 = e4.$scrollableEl, n4 = e4.$link, r2 = document.querySelector(n4.getAttribute("href")), i2 = parseInt(this.getClassProperty(t4, "--scrollspy-offset", "0")), a2 = this.getClassProperty(r2, "--scrollspy-offset") || i2, s2 = o4 === document ? 0 : o4.offsetTop, c3 = r2.offsetTop - a2 - s2, l2 = o4 === document ? window : o4;
                this._fireEvent("scroll", t4), this._dispatch("scroll.hs.scrollspy", t4, t4), window.history.replaceState(null, null, n4.getAttribute("href")), l2.scrollTo({ top: c3, left: 0, behavior: "smooth" });
              } }]) && r(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), u;
            }(o2(765).Z);
            window.HSScrollspy = new c(), document.addEventListener("load", window.HSScrollspy.init());
          }, 51: (e2, t2, o2) => {
            function n2(e3) {
              return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, n2(e3);
            }
            function r(e3) {
              return function(e4) {
                if (Array.isArray(e4))
                  return i(e4);
              }(e3) || function(e4) {
                if ("undefined" != typeof Symbol && null != e4[Symbol.iterator] || null != e4["@@iterator"])
                  return Array.from(e4);
              }(e3) || function(e4, t3) {
                if (e4) {
                  if ("string" == typeof e4)
                    return i(e4, t3);
                  var o3 = Object.prototype.toString.call(e4).slice(8, -1);
                  return "Object" === o3 && e4.constructor && (o3 = e4.constructor.name), "Map" === o3 || "Set" === o3 ? Array.from(e4) : "Arguments" === o3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o3) ? i(e4, t3) : void 0;
                }
              }(e3) || function() {
                throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
              }();
            }
            function i(e3, t3) {
              (null == t3 || t3 > e3.length) && (t3 = e3.length);
              for (var o3 = 0, n3 = new Array(t3); o3 < t3; o3++)
                n3[o3] = e3[o3];
              return n3;
            }
            function a(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function s(e3, t3) {
              return s = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, s(e3, t3);
            }
            function c(e3, t3) {
              if (t3 && ("object" === n2(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function l(e3) {
              return l = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, l(e3);
            }
            var u = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && s(e4, t4);
              }(f, e3);
              var t3, o3, n3, i2, u2 = (n3 = f, i2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = l(n3);
                if (i2) {
                  var o4 = l(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return c(this, e4);
              });
              function f() {
                return function(e4, t4) {
                  if (!(e4 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, f), u2.call(this, "[data-hs-tab]");
              }
              return t3 = f, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("keydown", this._keyboardSupport.bind(this)), document.addEventListener("click", function(t4) {
                  var o4 = t4.target.closest(e4.selector);
                  o4 && e4.open(o4);
                }), document.querySelectorAll("[hs-data-tab-select]").forEach(function(t4) {
                  var o4 = document.querySelector(t4.getAttribute("hs-data-tab-select"));
                  o4 && o4.addEventListener("change", function(t5) {
                    var o5 = document.querySelector('[data-hs-tab="'.concat(t5.target.value, '"]'));
                    o5 && e4.open(o5);
                  });
                });
              } }, { key: "open", value: function(e4) {
                var t4 = document.querySelector(e4.getAttribute("data-hs-tab")), o4 = r(e4.parentElement.children), n4 = r(t4.parentElement.children), i3 = e4.closest("[hs-data-tab-select]"), a2 = i3 ? document.querySelector(i3.getAttribute("data-hs-tab")) : null;
                o4.forEach(function(e5) {
                  return e5.classList.remove("active");
                }), n4.forEach(function(e5) {
                  return e5.classList.add("hidden");
                }), e4.classList.add("active"), t4.classList.remove("hidden"), this._fireEvent("change", e4), this._dispatch("change.hs.tab", e4, e4), a2 && (a2.value = e4.getAttribute("data-hs-tab"));
              } }, { key: "_keyboardSupport", value: function(e4) {
                var t4 = e4.target.closest(this.selector);
                if (t4) {
                  var o4 = "true" === t4.closest('[role="tablist"]').getAttribute("data-hs-tabs-vertical");
                  return (o4 ? 38 === e4.keyCode : 37 === e4.keyCode) ? (e4.preventDefault(), this._left(t4)) : (o4 ? 40 === e4.keyCode : 39 === e4.keyCode) ? (e4.preventDefault(), this._right(t4)) : 36 === e4.keyCode ? (e4.preventDefault(), this._start(t4)) : 35 === e4.keyCode ? (e4.preventDefault(), this._end(t4)) : void 0;
                }
              } }, { key: "_right", value: function(e4) {
                var t4 = e4.closest('[role="tablist"]');
                if (t4) {
                  var o4 = r(t4.querySelectorAll(this.selector)).filter(function(e5) {
                    return !e5.disabled;
                  }), n4 = t4.querySelector("button:focus"), i3 = o4.findIndex(function(e5) {
                    return e5 === n4;
                  });
                  i3 + 1 < o4.length ? i3++ : i3 = 0, o4[i3].focus(), this.open(o4[i3]);
                }
              } }, { key: "_left", value: function(e4) {
                var t4 = e4.closest('[role="tablist"]');
                if (t4) {
                  var o4 = r(t4.querySelectorAll(this.selector)).filter(function(e5) {
                    return !e5.disabled;
                  }).reverse(), n4 = t4.querySelector("button:focus"), i3 = o4.findIndex(function(e5) {
                    return e5 === n4;
                  });
                  i3 + 1 < o4.length ? i3++ : i3 = 0, o4[i3].focus(), this.open(o4[i3]);
                }
              } }, { key: "_start", value: function(e4) {
                var t4 = e4.closest('[role="tablist"]');
                if (t4) {
                  var o4 = r(t4.querySelectorAll(this.selector)).filter(function(e5) {
                    return !e5.disabled;
                  });
                  o4.length && (o4[0].focus(), this.open(o4[0]));
                }
              } }, { key: "_end", value: function(e4) {
                var t4 = e4.closest('[role="tablist"]');
                if (t4) {
                  var o4 = r(t4.querySelectorAll(this.selector)).reverse().filter(function(e5) {
                    return !e5.disabled;
                  });
                  o4.length && (o4[0].focus(), this.open(o4[0]));
                }
              } }]) && a(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), f;
            }(o2(765).Z);
            window.HSTabs = new u(), document.addEventListener("load", window.HSTabs.init());
          }, 185: (e2, t2, o2) => {
            var n2 = o2(765), r = o2(714);
            function i(e3) {
              return i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
                return typeof e4;
              } : function(e4) {
                return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
              }, i(e3);
            }
            function a(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            function s(e3, t3) {
              return s = Object.setPrototypeOf || function(e4, t4) {
                return e4.__proto__ = t4, e4;
              }, s(e3, t3);
            }
            function c(e3, t3) {
              if (t3 && ("object" === i(t3) || "function" == typeof t3))
                return t3;
              if (void 0 !== t3)
                throw new TypeError("Derived constructors may only return object or undefined");
              return function(e4) {
                if (void 0 === e4)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e4;
              }(e3);
            }
            function l(e3) {
              return l = Object.setPrototypeOf ? Object.getPrototypeOf : function(e4) {
                return e4.__proto__ || Object.getPrototypeOf(e4);
              }, l(e3);
            }
            var u = function(e3) {
              !function(e4, t4) {
                if ("function" != typeof t4 && null !== t4)
                  throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && s(e4, t4);
              }(f, e3);
              var t3, o3, n3, i2, u2 = (n3 = f, i2 = function() {
                if ("undefined" == typeof Reflect || !Reflect.construct)
                  return false;
                if (Reflect.construct.sham)
                  return false;
                if ("function" == typeof Proxy)
                  return true;
                try {
                  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                  })), true;
                } catch (e4) {
                  return false;
                }
              }(), function() {
                var e4, t4 = l(n3);
                if (i2) {
                  var o4 = l(this).constructor;
                  e4 = Reflect.construct(t4, arguments, o4);
                } else
                  e4 = t4.apply(this, arguments);
                return c(this, e4);
              });
              function f() {
                return function(e4, t4) {
                  if (!(e4 instanceof t4))
                    throw new TypeError("Cannot call a class as a function");
                }(this, f), u2.call(this, ".hs-tooltip");
              }
              return t3 = f, (o3 = [{ key: "init", value: function() {
                var e4 = this;
                document.addEventListener("click", function(t4) {
                  var o4 = t4.target.closest(e4.selector);
                  o4 && "focus" === e4.getClassProperty(o4, "--trigger") && e4._focus(o4), o4 && "click" === e4.getClassProperty(o4, "--trigger") && e4._click(o4);
                }), document.addEventListener("mousemove", function(t4) {
                  var o4 = t4.target.closest(e4.selector);
                  o4 && "focus" !== e4.getClassProperty(o4, "--trigger") && "click" !== e4.getClassProperty(o4, "--trigger") && e4._hover(o4);
                });
              } }, { key: "_hover", value: function(e4) {
                var t4 = this;
                if (!e4.classList.contains("show")) {
                  var o4 = e4.querySelector(".hs-tooltip-toggle"), n4 = e4.querySelector(".hs-tooltip-content"), i3 = this.getClassProperty(e4, "--placement");
                  (0, r.fi)(o4, n4, { placement: i3 || "top", strategy: "fixed", modifiers: [{ name: "offset", options: { offset: [0, 5] } }] }), this.show(e4), e4.addEventListener("mouseleave", function o5(n5) {
                    n5.relatedTarget.closest(t4.selector) && n5.relatedTarget.closest(t4.selector) == e4 || (t4.hide(e4), e4.removeEventListener("mouseleave", o5, true));
                  }, true);
                }
              } }, { key: "_focus", value: function(e4) {
                var t4 = this, o4 = e4.querySelector(".hs-tooltip-toggle"), n4 = e4.querySelector(".hs-tooltip-content"), i3 = this.getClassProperty(e4, "--placement"), a2 = this.getClassProperty(e4, "--strategy");
                (0, r.fi)(o4, n4, { placement: i3 || "top", strategy: a2 || "fixed", modifiers: [{ name: "offset", options: { offset: [0, 5] } }] }), this.show(e4), e4.addEventListener("blur", function o5() {
                  t4.hide(e4), e4.removeEventListener("blur", o5, true);
                }, true);
              } }, { key: "_click", value: function(e4) {
                var t4 = this;
                if (!e4.classList.contains("show")) {
                  var o4 = e4.querySelector(".hs-tooltip-toggle"), n4 = e4.querySelector(".hs-tooltip-content"), i3 = this.getClassProperty(e4, "--placement"), a2 = this.getClassProperty(e4, "--strategy");
                  (0, r.fi)(o4, n4, { placement: i3 || "top", strategy: a2 || "fixed", modifiers: [{ name: "offset", options: { offset: [0, 5] } }] }), this.show(e4);
                  var s2 = function o5(n5) {
                    setTimeout(function() {
                      t4.hide(e4), e4.removeEventListener("click", o5, true), e4.removeEventListener("blur", o5, true);
                    });
                  };
                  e4.addEventListener("blur", s2, true), e4.addEventListener("click", s2, true);
                }
              } }, { key: "show", value: function(e4) {
                var t4 = this;
                e4.querySelector(".hs-tooltip-content").classList.remove("hidden"), setTimeout(function() {
                  e4.classList.add("show"), t4._fireEvent("show", e4), t4._dispatch("show.hs.tooltip", e4, e4);
                });
              } }, { key: "hide", value: function(e4) {
                var t4 = e4.querySelector(".hs-tooltip-content");
                e4.classList.remove("show"), this._fireEvent("hide", e4), this._dispatch("hide.hs.tooltip", e4, e4), this.afterTransition(t4, function() {
                  e4.classList.contains("show") || t4.classList.add("hidden");
                });
              } }]) && a(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), f;
            }(n2.Z);
            window.HSTooltip = new u(), document.addEventListener("load", window.HSTooltip.init());
          }, 765: (e2, t2, o2) => {
            function n2(e3, t3) {
              for (var o3 = 0; o3 < t3.length; o3++) {
                var n3 = t3[o3];
                n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
              }
            }
            o2.d(t2, { Z: () => r });
            var r = function() {
              function e3(t4, o4) {
                !function(e4, t5) {
                  if (!(e4 instanceof t5))
                    throw new TypeError("Cannot call a class as a function");
                }(this, e3), this.$collection = [], this.selector = t4, this.config = o4, this.events = {};
              }
              var t3, o3;
              return t3 = e3, o3 = [{ key: "_fireEvent", value: function(e4) {
                var t4 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                this.events.hasOwnProperty(e4) && this.events[e4](t4);
              } }, { key: "_dispatch", value: function(e4, t4) {
                var o4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, n3 = new CustomEvent(e4, { detail: { payload: o4 }, bubbles: true, cancelable: true, composed: false });
                t4.dispatchEvent(n3);
              } }, { key: "on", value: function(e4, t4) {
                this.events[e4] = t4;
              } }, { key: "afterTransition", value: function(e4, t4) {
                "all 0s ease 0s" !== window.getComputedStyle(e4, null).getPropertyValue("transition") ? e4.addEventListener("transitionend", function o4() {
                  t4(), e4.removeEventListener("transitionend", o4, true);
                }, true) : t4();
              } }, { key: "getClassProperty", value: function(e4, t4) {
                var o4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "", n3 = (window.getComputedStyle(e4).getPropertyValue(t4) || o4).replace(" ", "");
                return n3;
              } }], o3 && n2(t3.prototype, o3), Object.defineProperty(t3, "prototype", { writable: false }), e3;
            }();
          }, 714: (e2, t2, o2) => {
            function n2(e3) {
              if (null == e3)
                return window;
              if ("[object Window]" !== e3.toString()) {
                var t3 = e3.ownerDocument;
                return t3 && t3.defaultView || window;
              }
              return e3;
            }
            function r(e3) {
              return e3 instanceof n2(e3).Element || e3 instanceof Element;
            }
            function i(e3) {
              return e3 instanceof n2(e3).HTMLElement || e3 instanceof HTMLElement;
            }
            function a(e3) {
              return "undefined" != typeof ShadowRoot && (e3 instanceof n2(e3).ShadowRoot || e3 instanceof ShadowRoot);
            }
            o2.d(t2, { fi: () => ce });
            var s = Math.max, c = Math.min, l = Math.round;
            function u(e3, t3) {
              void 0 === t3 && (t3 = false);
              var o3 = e3.getBoundingClientRect(), n3 = 1, r2 = 1;
              if (i(e3) && t3) {
                var a2 = e3.offsetHeight, s2 = e3.offsetWidth;
                s2 > 0 && (n3 = l(o3.width) / s2 || 1), a2 > 0 && (r2 = l(o3.height) / a2 || 1);
              }
              return { width: o3.width / n3, height: o3.height / r2, top: o3.top / r2, right: o3.right / n3, bottom: o3.bottom / r2, left: o3.left / n3, x: o3.left / n3, y: o3.top / r2 };
            }
            function f(e3) {
              var t3 = n2(e3);
              return { scrollLeft: t3.pageXOffset, scrollTop: t3.pageYOffset };
            }
            function p(e3) {
              return e3 ? (e3.nodeName || "").toLowerCase() : null;
            }
            function d(e3) {
              return ((r(e3) ? e3.ownerDocument : e3.document) || window.document).documentElement;
            }
            function y(e3) {
              return u(d(e3)).left + f(e3).scrollLeft;
            }
            function h(e3) {
              return n2(e3).getComputedStyle(e3);
            }
            function v(e3) {
              var t3 = h(e3), o3 = t3.overflow, n3 = t3.overflowX, r2 = t3.overflowY;
              return /auto|scroll|overlay|hidden/.test(o3 + r2 + n3);
            }
            function m(e3, t3, o3) {
              void 0 === o3 && (o3 = false);
              var r2, a2, s2 = i(t3), c2 = i(t3) && function(e4) {
                var t4 = e4.getBoundingClientRect(), o4 = l(t4.width) / e4.offsetWidth || 1, n3 = l(t4.height) / e4.offsetHeight || 1;
                return 1 !== o4 || 1 !== n3;
              }(t3), h2 = d(t3), m2 = u(e3, c2), b2 = { scrollLeft: 0, scrollTop: 0 }, g2 = { x: 0, y: 0 };
              return (s2 || !s2 && !o3) && (("body" !== p(t3) || v(h2)) && (b2 = (r2 = t3) !== n2(r2) && i(r2) ? { scrollLeft: (a2 = r2).scrollLeft, scrollTop: a2.scrollTop } : f(r2)), i(t3) ? ((g2 = u(t3, true)).x += t3.clientLeft, g2.y += t3.clientTop) : h2 && (g2.x = y(h2))), { x: m2.left + b2.scrollLeft - g2.x, y: m2.top + b2.scrollTop - g2.y, width: m2.width, height: m2.height };
            }
            function b(e3) {
              var t3 = u(e3), o3 = e3.offsetWidth, n3 = e3.offsetHeight;
              return Math.abs(t3.width - o3) <= 1 && (o3 = t3.width), Math.abs(t3.height - n3) <= 1 && (n3 = t3.height), { x: e3.offsetLeft, y: e3.offsetTop, width: o3, height: n3 };
            }
            function g(e3) {
              return "html" === p(e3) ? e3 : e3.assignedSlot || e3.parentNode || (a(e3) ? e3.host : null) || d(e3);
            }
            function w(e3) {
              return ["html", "body", "#document"].indexOf(p(e3)) >= 0 ? e3.ownerDocument.body : i(e3) && v(e3) ? e3 : w(g(e3));
            }
            function O(e3, t3) {
              var o3;
              void 0 === t3 && (t3 = []);
              var r2 = w(e3), i2 = r2 === (null == (o3 = e3.ownerDocument) ? void 0 : o3.body), a2 = n2(r2), s2 = i2 ? [a2].concat(a2.visualViewport || [], v(r2) ? r2 : []) : r2, c2 = t3.concat(s2);
              return i2 ? c2 : c2.concat(O(g(s2)));
            }
            function S(e3) {
              return ["table", "td", "th"].indexOf(p(e3)) >= 0;
            }
            function x(e3) {
              return i(e3) && "fixed" !== h(e3).position ? e3.offsetParent : null;
            }
            function _(e3) {
              for (var t3 = n2(e3), o3 = x(e3); o3 && S(o3) && "static" === h(o3).position; )
                o3 = x(o3);
              return o3 && ("html" === p(o3) || "body" === p(o3) && "static" === h(o3).position) ? t3 : o3 || function(e4) {
                var t4 = -1 !== navigator.userAgent.toLowerCase().indexOf("firefox");
                if (-1 !== navigator.userAgent.indexOf("Trident") && i(e4) && "fixed" === h(e4).position)
                  return null;
                for (var o4 = g(e4); i(o4) && ["html", "body"].indexOf(p(o4)) < 0; ) {
                  var n3 = h(o4);
                  if ("none" !== n3.transform || "none" !== n3.perspective || "paint" === n3.contain || -1 !== ["transform", "perspective"].indexOf(n3.willChange) || t4 && "filter" === n3.willChange || t4 && n3.filter && "none" !== n3.filter)
                    return o4;
                  o4 = o4.parentNode;
                }
                return null;
              }(e3) || t3;
            }
            var E = "top", k = "bottom", j = "right", P = "left", L = "auto", A = [E, k, j, P], T = "start", C = "end", q = "viewport", R = "popper", D = A.reduce(function(e3, t3) {
              return e3.concat([t3 + "-" + T, t3 + "-" + C]);
            }, []), H = [].concat(A, [L]).reduce(function(e3, t3) {
              return e3.concat([t3, t3 + "-" + T, t3 + "-" + C]);
            }, []), B = ["beforeRead", "read", "afterRead", "beforeMain", "main", "afterMain", "beforeWrite", "write", "afterWrite"];
            function I(e3) {
              var t3 = /* @__PURE__ */ new Map(), o3 = /* @__PURE__ */ new Set(), n3 = [];
              function r2(e4) {
                o3.add(e4.name), [].concat(e4.requires || [], e4.requiresIfExists || []).forEach(function(e5) {
                  if (!o3.has(e5)) {
                    var n4 = t3.get(e5);
                    n4 && r2(n4);
                  }
                }), n3.push(e4);
              }
              return e3.forEach(function(e4) {
                t3.set(e4.name, e4);
              }), e3.forEach(function(e4) {
                o3.has(e4.name) || r2(e4);
              }), n3;
            }
            var M = { placement: "bottom", modifiers: [], strategy: "absolute" };
            function V() {
              for (var e3 = arguments.length, t3 = new Array(e3), o3 = 0; o3 < e3; o3++)
                t3[o3] = arguments[o3];
              return !t3.some(function(e4) {
                return !(e4 && "function" == typeof e4.getBoundingClientRect);
              });
            }
            function W(e3) {
              void 0 === e3 && (e3 = {});
              var t3 = e3, o3 = t3.defaultModifiers, n3 = void 0 === o3 ? [] : o3, i2 = t3.defaultOptions, a2 = void 0 === i2 ? M : i2;
              return function(e4, t4, o4) {
                void 0 === o4 && (o4 = a2);
                var i3, s2, c2 = { placement: "bottom", orderedModifiers: [], options: Object.assign({}, M, a2), modifiersData: {}, elements: { reference: e4, popper: t4 }, attributes: {}, styles: {} }, l2 = [], u2 = false, f2 = { state: c2, setOptions: function(o5) {
                  var i4 = "function" == typeof o5 ? o5(c2.options) : o5;
                  p2(), c2.options = Object.assign({}, a2, c2.options, i4), c2.scrollParents = { reference: r(e4) ? O(e4) : e4.contextElement ? O(e4.contextElement) : [], popper: O(t4) };
                  var s3, u3, d2 = function(e5) {
                    var t5 = I(e5);
                    return B.reduce(function(e6, o6) {
                      return e6.concat(t5.filter(function(e7) {
                        return e7.phase === o6;
                      }));
                    }, []);
                  }((s3 = [].concat(n3, c2.options.modifiers), u3 = s3.reduce(function(e5, t5) {
                    var o6 = e5[t5.name];
                    return e5[t5.name] = o6 ? Object.assign({}, o6, t5, { options: Object.assign({}, o6.options, t5.options), data: Object.assign({}, o6.data, t5.data) }) : t5, e5;
                  }, {}), Object.keys(u3).map(function(e5) {
                    return u3[e5];
                  })));
                  return c2.orderedModifiers = d2.filter(function(e5) {
                    return e5.enabled;
                  }), c2.orderedModifiers.forEach(function(e5) {
                    var t5 = e5.name, o6 = e5.options, n4 = void 0 === o6 ? {} : o6, r2 = e5.effect;
                    if ("function" == typeof r2) {
                      var i5 = r2({ state: c2, name: t5, instance: f2, options: n4 });
                      l2.push(i5 || function() {
                      });
                    }
                  }), f2.update();
                }, forceUpdate: function() {
                  if (!u2) {
                    var e5 = c2.elements, t5 = e5.reference, o5 = e5.popper;
                    if (V(t5, o5)) {
                      c2.rects = { reference: m(t5, _(o5), "fixed" === c2.options.strategy), popper: b(o5) }, c2.reset = false, c2.placement = c2.options.placement, c2.orderedModifiers.forEach(function(e6) {
                        return c2.modifiersData[e6.name] = Object.assign({}, e6.data);
                      });
                      for (var n4 = 0; n4 < c2.orderedModifiers.length; n4++)
                        if (true !== c2.reset) {
                          var r2 = c2.orderedModifiers[n4], i4 = r2.fn, a3 = r2.options, s3 = void 0 === a3 ? {} : a3, l3 = r2.name;
                          "function" == typeof i4 && (c2 = i4({ state: c2, options: s3, name: l3, instance: f2 }) || c2);
                        } else
                          c2.reset = false, n4 = -1;
                    }
                  }
                }, update: (i3 = function() {
                  return new Promise(function(e5) {
                    f2.forceUpdate(), e5(c2);
                  });
                }, function() {
                  return s2 || (s2 = new Promise(function(e5) {
                    Promise.resolve().then(function() {
                      s2 = void 0, e5(i3());
                    });
                  })), s2;
                }), destroy: function() {
                  p2(), u2 = true;
                } };
                if (!V(e4, t4))
                  return f2;
                function p2() {
                  l2.forEach(function(e5) {
                    return e5();
                  }), l2 = [];
                }
                return f2.setOptions(o4).then(function(e5) {
                  !u2 && o4.onFirstUpdate && o4.onFirstUpdate(e5);
                }), f2;
              };
            }
            var $ = { passive: true };
            function N(e3) {
              return e3.split("-")[0];
            }
            function Z(e3) {
              return e3.split("-")[1];
            }
            function U(e3) {
              return ["top", "bottom"].indexOf(e3) >= 0 ? "x" : "y";
            }
            function z(e3) {
              var t3, o3 = e3.reference, n3 = e3.element, r2 = e3.placement, i2 = r2 ? N(r2) : null, a2 = r2 ? Z(r2) : null, s2 = o3.x + o3.width / 2 - n3.width / 2, c2 = o3.y + o3.height / 2 - n3.height / 2;
              switch (i2) {
                case E:
                  t3 = { x: s2, y: o3.y - n3.height };
                  break;
                case k:
                  t3 = { x: s2, y: o3.y + o3.height };
                  break;
                case j:
                  t3 = { x: o3.x + o3.width, y: c2 };
                  break;
                case P:
                  t3 = { x: o3.x - n3.width, y: c2 };
                  break;
                default:
                  t3 = { x: o3.x, y: o3.y };
              }
              var l2 = i2 ? U(i2) : null;
              if (null != l2) {
                var u2 = "y" === l2 ? "height" : "width";
                switch (a2) {
                  case T:
                    t3[l2] = t3[l2] - (o3[u2] / 2 - n3[u2] / 2);
                    break;
                  case C:
                    t3[l2] = t3[l2] + (o3[u2] / 2 - n3[u2] / 2);
                }
              }
              return t3;
            }
            var F = { top: "auto", right: "auto", bottom: "auto", left: "auto" };
            function X(e3) {
              var t3, o3 = e3.popper, r2 = e3.popperRect, i2 = e3.placement, a2 = e3.variation, s2 = e3.offsets, c2 = e3.position, u2 = e3.gpuAcceleration, f2 = e3.adaptive, p2 = e3.roundOffsets, y2 = e3.isFixed, v2 = s2.x, m2 = void 0 === v2 ? 0 : v2, b2 = s2.y, g2 = void 0 === b2 ? 0 : b2, w2 = "function" == typeof p2 ? p2({ x: m2, y: g2 }) : { x: m2, y: g2 };
              m2 = w2.x, g2 = w2.y;
              var O2 = s2.hasOwnProperty("x"), S2 = s2.hasOwnProperty("y"), x2 = P, L2 = E, A2 = window;
              if (f2) {
                var T2 = _(o3), q2 = "clientHeight", R2 = "clientWidth";
                T2 === n2(o3) && "static" !== h(T2 = d(o3)).position && "absolute" === c2 && (q2 = "scrollHeight", R2 = "scrollWidth"), T2 = T2, (i2 === E || (i2 === P || i2 === j) && a2 === C) && (L2 = k, g2 -= (y2 && A2.visualViewport ? A2.visualViewport.height : T2[q2]) - r2.height, g2 *= u2 ? 1 : -1), i2 !== P && (i2 !== E && i2 !== k || a2 !== C) || (x2 = j, m2 -= (y2 && A2.visualViewport ? A2.visualViewport.width : T2[R2]) - r2.width, m2 *= u2 ? 1 : -1);
              }
              var D2, H2 = Object.assign({ position: c2 }, f2 && F), B2 = true === p2 ? function(e4) {
                var t4 = e4.x, o4 = e4.y, n3 = window.devicePixelRatio || 1;
                return { x: l(t4 * n3) / n3 || 0, y: l(o4 * n3) / n3 || 0 };
              }({ x: m2, y: g2 }) : { x: m2, y: g2 };
              return m2 = B2.x, g2 = B2.y, u2 ? Object.assign({}, H2, ((D2 = {})[L2] = S2 ? "0" : "", D2[x2] = O2 ? "0" : "", D2.transform = (A2.devicePixelRatio || 1) <= 1 ? "translate(" + m2 + "px, " + g2 + "px)" : "translate3d(" + m2 + "px, " + g2 + "px, 0)", D2)) : Object.assign({}, H2, ((t3 = {})[L2] = S2 ? g2 + "px" : "", t3[x2] = O2 ? m2 + "px" : "", t3.transform = "", t3));
            }
            var Y = { left: "right", right: "left", bottom: "top", top: "bottom" };
            function G(e3) {
              return e3.replace(/left|right|bottom|top/g, function(e4) {
                return Y[e4];
              });
            }
            var J = { start: "end", end: "start" };
            function K(e3) {
              return e3.replace(/start|end/g, function(e4) {
                return J[e4];
              });
            }
            function Q(e3, t3) {
              var o3 = t3.getRootNode && t3.getRootNode();
              if (e3.contains(t3))
                return true;
              if (o3 && a(o3)) {
                var n3 = t3;
                do {
                  if (n3 && e3.isSameNode(n3))
                    return true;
                  n3 = n3.parentNode || n3.host;
                } while (n3);
              }
              return false;
            }
            function ee(e3) {
              return Object.assign({}, e3, { left: e3.x, top: e3.y, right: e3.x + e3.width, bottom: e3.y + e3.height });
            }
            function te(e3, t3) {
              return t3 === q ? ee(function(e4) {
                var t4 = n2(e4), o3 = d(e4), r2 = t4.visualViewport, i2 = o3.clientWidth, a2 = o3.clientHeight, s2 = 0, c2 = 0;
                return r2 && (i2 = r2.width, a2 = r2.height, /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (s2 = r2.offsetLeft, c2 = r2.offsetTop)), { width: i2, height: a2, x: s2 + y(e4), y: c2 };
              }(e3)) : r(t3) ? function(e4) {
                var t4 = u(e4);
                return t4.top = t4.top + e4.clientTop, t4.left = t4.left + e4.clientLeft, t4.bottom = t4.top + e4.clientHeight, t4.right = t4.left + e4.clientWidth, t4.width = e4.clientWidth, t4.height = e4.clientHeight, t4.x = t4.left, t4.y = t4.top, t4;
              }(t3) : ee(function(e4) {
                var t4, o3 = d(e4), n3 = f(e4), r2 = null == (t4 = e4.ownerDocument) ? void 0 : t4.body, i2 = s(o3.scrollWidth, o3.clientWidth, r2 ? r2.scrollWidth : 0, r2 ? r2.clientWidth : 0), a2 = s(o3.scrollHeight, o3.clientHeight, r2 ? r2.scrollHeight : 0, r2 ? r2.clientHeight : 0), c2 = -n3.scrollLeft + y(e4), l2 = -n3.scrollTop;
                return "rtl" === h(r2 || o3).direction && (c2 += s(o3.clientWidth, r2 ? r2.clientWidth : 0) - i2), { width: i2, height: a2, x: c2, y: l2 };
              }(d(e3)));
            }
            function oe(e3) {
              return Object.assign({}, { top: 0, right: 0, bottom: 0, left: 0 }, e3);
            }
            function ne(e3, t3) {
              return t3.reduce(function(t4, o3) {
                return t4[o3] = e3, t4;
              }, {});
            }
            function re(e3, t3) {
              void 0 === t3 && (t3 = {});
              var o3 = t3, n3 = o3.placement, a2 = void 0 === n3 ? e3.placement : n3, l2 = o3.boundary, f2 = void 0 === l2 ? "clippingParents" : l2, y2 = o3.rootBoundary, v2 = void 0 === y2 ? q : y2, m2 = o3.elementContext, b2 = void 0 === m2 ? R : m2, w2 = o3.altBoundary, S2 = void 0 !== w2 && w2, x2 = o3.padding, P2 = void 0 === x2 ? 0 : x2, L2 = oe("number" != typeof P2 ? P2 : ne(P2, A)), T2 = b2 === R ? "reference" : R, C2 = e3.rects.popper, D2 = e3.elements[S2 ? T2 : b2], H2 = function(e4, t4, o4) {
                var n4 = "clippingParents" === t4 ? function(e5) {
                  var t5 = O(g(e5)), o5 = ["absolute", "fixed"].indexOf(h(e5).position) >= 0 && i(e5) ? _(e5) : e5;
                  return r(o5) ? t5.filter(function(e6) {
                    return r(e6) && Q(e6, o5) && "body" !== p(e6);
                  }) : [];
                }(e4) : [].concat(t4), a3 = [].concat(n4, [o4]), l3 = a3[0], u2 = a3.reduce(function(t5, o5) {
                  var n5 = te(e4, o5);
                  return t5.top = s(n5.top, t5.top), t5.right = c(n5.right, t5.right), t5.bottom = c(n5.bottom, t5.bottom), t5.left = s(n5.left, t5.left), t5;
                }, te(e4, l3));
                return u2.width = u2.right - u2.left, u2.height = u2.bottom - u2.top, u2.x = u2.left, u2.y = u2.top, u2;
              }(r(D2) ? D2 : D2.contextElement || d(e3.elements.popper), f2, v2), B2 = u(e3.elements.reference), I2 = z({ reference: B2, element: C2, strategy: "absolute", placement: a2 }), M2 = ee(Object.assign({}, C2, I2)), V2 = b2 === R ? M2 : B2, W2 = { top: H2.top - V2.top + L2.top, bottom: V2.bottom - H2.bottom + L2.bottom, left: H2.left - V2.left + L2.left, right: V2.right - H2.right + L2.right }, $2 = e3.modifiersData.offset;
              if (b2 === R && $2) {
                var N2 = $2[a2];
                Object.keys(W2).forEach(function(e4) {
                  var t4 = [j, k].indexOf(e4) >= 0 ? 1 : -1, o4 = [E, k].indexOf(e4) >= 0 ? "y" : "x";
                  W2[e4] += N2[o4] * t4;
                });
              }
              return W2;
            }
            function ie(e3, t3, o3) {
              return s(e3, c(t3, o3));
            }
            function ae(e3, t3, o3) {
              return void 0 === o3 && (o3 = { x: 0, y: 0 }), { top: e3.top - t3.height - o3.y, right: e3.right - t3.width + o3.x, bottom: e3.bottom - t3.height + o3.y, left: e3.left - t3.width - o3.x };
            }
            function se(e3) {
              return [E, j, k, P].some(function(t3) {
                return e3[t3] >= 0;
              });
            }
            var ce = W({ defaultModifiers: [{ name: "eventListeners", enabled: true, phase: "write", fn: function() {
            }, effect: function(e3) {
              var t3 = e3.state, o3 = e3.instance, r2 = e3.options, i2 = r2.scroll, a2 = void 0 === i2 || i2, s2 = r2.resize, c2 = void 0 === s2 || s2, l2 = n2(t3.elements.popper), u2 = [].concat(t3.scrollParents.reference, t3.scrollParents.popper);
              return a2 && u2.forEach(function(e4) {
                e4.addEventListener("scroll", o3.update, $);
              }), c2 && l2.addEventListener("resize", o3.update, $), function() {
                a2 && u2.forEach(function(e4) {
                  e4.removeEventListener("scroll", o3.update, $);
                }), c2 && l2.removeEventListener("resize", o3.update, $);
              };
            }, data: {} }, { name: "popperOffsets", enabled: true, phase: "read", fn: function(e3) {
              var t3 = e3.state, o3 = e3.name;
              t3.modifiersData[o3] = z({ reference: t3.rects.reference, element: t3.rects.popper, strategy: "absolute", placement: t3.placement });
            }, data: {} }, { name: "computeStyles", enabled: true, phase: "beforeWrite", fn: function(e3) {
              var t3 = e3.state, o3 = e3.options, n3 = o3.gpuAcceleration, r2 = void 0 === n3 || n3, i2 = o3.adaptive, a2 = void 0 === i2 || i2, s2 = o3.roundOffsets, c2 = void 0 === s2 || s2, l2 = { placement: N(t3.placement), variation: Z(t3.placement), popper: t3.elements.popper, popperRect: t3.rects.popper, gpuAcceleration: r2, isFixed: "fixed" === t3.options.strategy };
              null != t3.modifiersData.popperOffsets && (t3.styles.popper = Object.assign({}, t3.styles.popper, X(Object.assign({}, l2, { offsets: t3.modifiersData.popperOffsets, position: t3.options.strategy, adaptive: a2, roundOffsets: c2 })))), null != t3.modifiersData.arrow && (t3.styles.arrow = Object.assign({}, t3.styles.arrow, X(Object.assign({}, l2, { offsets: t3.modifiersData.arrow, position: "absolute", adaptive: false, roundOffsets: c2 })))), t3.attributes.popper = Object.assign({}, t3.attributes.popper, { "data-popper-placement": t3.placement });
            }, data: {} }, { name: "applyStyles", enabled: true, phase: "write", fn: function(e3) {
              var t3 = e3.state;
              Object.keys(t3.elements).forEach(function(e4) {
                var o3 = t3.styles[e4] || {}, n3 = t3.attributes[e4] || {}, r2 = t3.elements[e4];
                i(r2) && p(r2) && (Object.assign(r2.style, o3), Object.keys(n3).forEach(function(e5) {
                  var t4 = n3[e5];
                  false === t4 ? r2.removeAttribute(e5) : r2.setAttribute(e5, true === t4 ? "" : t4);
                }));
              });
            }, effect: function(e3) {
              var t3 = e3.state, o3 = { popper: { position: t3.options.strategy, left: "0", top: "0", margin: "0" }, arrow: { position: "absolute" }, reference: {} };
              return Object.assign(t3.elements.popper.style, o3.popper), t3.styles = o3, t3.elements.arrow && Object.assign(t3.elements.arrow.style, o3.arrow), function() {
                Object.keys(t3.elements).forEach(function(e4) {
                  var n3 = t3.elements[e4], r2 = t3.attributes[e4] || {}, a2 = Object.keys(t3.styles.hasOwnProperty(e4) ? t3.styles[e4] : o3[e4]).reduce(function(e5, t4) {
                    return e5[t4] = "", e5;
                  }, {});
                  i(n3) && p(n3) && (Object.assign(n3.style, a2), Object.keys(r2).forEach(function(e5) {
                    n3.removeAttribute(e5);
                  }));
                });
              };
            }, requires: ["computeStyles"] }, { name: "offset", enabled: true, phase: "main", requires: ["popperOffsets"], fn: function(e3) {
              var t3 = e3.state, o3 = e3.options, n3 = e3.name, r2 = o3.offset, i2 = void 0 === r2 ? [0, 0] : r2, a2 = H.reduce(function(e4, o4) {
                return e4[o4] = function(e5, t4, o5) {
                  var n4 = N(e5), r3 = [P, E].indexOf(n4) >= 0 ? -1 : 1, i3 = "function" == typeof o5 ? o5(Object.assign({}, t4, { placement: e5 })) : o5, a3 = i3[0], s3 = i3[1];
                  return a3 = a3 || 0, s3 = (s3 || 0) * r3, [P, j].indexOf(n4) >= 0 ? { x: s3, y: a3 } : { x: a3, y: s3 };
                }(o4, t3.rects, i2), e4;
              }, {}), s2 = a2[t3.placement], c2 = s2.x, l2 = s2.y;
              null != t3.modifiersData.popperOffsets && (t3.modifiersData.popperOffsets.x += c2, t3.modifiersData.popperOffsets.y += l2), t3.modifiersData[n3] = a2;
            } }, { name: "flip", enabled: true, phase: "main", fn: function(e3) {
              var t3 = e3.state, o3 = e3.options, n3 = e3.name;
              if (!t3.modifiersData[n3]._skip) {
                for (var r2 = o3.mainAxis, i2 = void 0 === r2 || r2, a2 = o3.altAxis, s2 = void 0 === a2 || a2, c2 = o3.fallbackPlacements, l2 = o3.padding, u2 = o3.boundary, f2 = o3.rootBoundary, p2 = o3.altBoundary, d2 = o3.flipVariations, y2 = void 0 === d2 || d2, h2 = o3.allowedAutoPlacements, v2 = t3.options.placement, m2 = N(v2), b2 = c2 || (m2 !== v2 && y2 ? function(e4) {
                  if (N(e4) === L)
                    return [];
                  var t4 = G(e4);
                  return [K(e4), t4, K(t4)];
                }(v2) : [G(v2)]), g2 = [v2].concat(b2).reduce(function(e4, o4) {
                  return e4.concat(N(o4) === L ? function(e5, t4) {
                    void 0 === t4 && (t4 = {});
                    var o5 = t4, n4 = o5.placement, r3 = o5.boundary, i3 = o5.rootBoundary, a3 = o5.padding, s3 = o5.flipVariations, c3 = o5.allowedAutoPlacements, l3 = void 0 === c3 ? H : c3, u3 = Z(n4), f3 = u3 ? s3 ? D : D.filter(function(e6) {
                      return Z(e6) === u3;
                    }) : A, p3 = f3.filter(function(e6) {
                      return l3.indexOf(e6) >= 0;
                    });
                    0 === p3.length && (p3 = f3);
                    var d3 = p3.reduce(function(t5, o6) {
                      return t5[o6] = re(e5, { placement: o6, boundary: r3, rootBoundary: i3, padding: a3 })[N(o6)], t5;
                    }, {});
                    return Object.keys(d3).sort(function(e6, t5) {
                      return d3[e6] - d3[t5];
                    });
                  }(t3, { placement: o4, boundary: u2, rootBoundary: f2, padding: l2, flipVariations: y2, allowedAutoPlacements: h2 }) : o4);
                }, []), w2 = t3.rects.reference, O2 = t3.rects.popper, S2 = /* @__PURE__ */ new Map(), x2 = true, _2 = g2[0], C2 = 0; C2 < g2.length; C2++) {
                  var q2 = g2[C2], R2 = N(q2), B2 = Z(q2) === T, I2 = [E, k].indexOf(R2) >= 0, M2 = I2 ? "width" : "height", V2 = re(t3, { placement: q2, boundary: u2, rootBoundary: f2, altBoundary: p2, padding: l2 }), W2 = I2 ? B2 ? j : P : B2 ? k : E;
                  w2[M2] > O2[M2] && (W2 = G(W2));
                  var $2 = G(W2), U2 = [];
                  if (i2 && U2.push(V2[R2] <= 0), s2 && U2.push(V2[W2] <= 0, V2[$2] <= 0), U2.every(function(e4) {
                    return e4;
                  })) {
                    _2 = q2, x2 = false;
                    break;
                  }
                  S2.set(q2, U2);
                }
                if (x2)
                  for (var z2 = function(e4) {
                    var t4 = g2.find(function(t5) {
                      var o4 = S2.get(t5);
                      if (o4)
                        return o4.slice(0, e4).every(function(e5) {
                          return e5;
                        });
                    });
                    if (t4)
                      return _2 = t4, "break";
                  }, F2 = y2 ? 3 : 1; F2 > 0 && "break" !== z2(F2); F2--)
                    ;
                t3.placement !== _2 && (t3.modifiersData[n3]._skip = true, t3.placement = _2, t3.reset = true);
              }
            }, requiresIfExists: ["offset"], data: { _skip: false } }, { name: "preventOverflow", enabled: true, phase: "main", fn: function(e3) {
              var t3 = e3.state, o3 = e3.options, n3 = e3.name, r2 = o3.mainAxis, i2 = void 0 === r2 || r2, a2 = o3.altAxis, l2 = void 0 !== a2 && a2, u2 = o3.boundary, f2 = o3.rootBoundary, p2 = o3.altBoundary, d2 = o3.padding, y2 = o3.tether, h2 = void 0 === y2 || y2, v2 = o3.tetherOffset, m2 = void 0 === v2 ? 0 : v2, g2 = re(t3, { boundary: u2, rootBoundary: f2, padding: d2, altBoundary: p2 }), w2 = N(t3.placement), O2 = Z(t3.placement), S2 = !O2, x2 = U(w2), L2 = "x" === x2 ? "y" : "x", A2 = t3.modifiersData.popperOffsets, C2 = t3.rects.reference, q2 = t3.rects.popper, R2 = "function" == typeof m2 ? m2(Object.assign({}, t3.rects, { placement: t3.placement })) : m2, D2 = "number" == typeof R2 ? { mainAxis: R2, altAxis: R2 } : Object.assign({ mainAxis: 0, altAxis: 0 }, R2), H2 = t3.modifiersData.offset ? t3.modifiersData.offset[t3.placement] : null, B2 = { x: 0, y: 0 };
              if (A2) {
                if (i2) {
                  var I2, M2 = "y" === x2 ? E : P, V2 = "y" === x2 ? k : j, W2 = "y" === x2 ? "height" : "width", $2 = A2[x2], z2 = $2 + g2[M2], F2 = $2 - g2[V2], X2 = h2 ? -q2[W2] / 2 : 0, Y2 = O2 === T ? C2[W2] : q2[W2], G2 = O2 === T ? -q2[W2] : -C2[W2], J2 = t3.elements.arrow, K2 = h2 && J2 ? b(J2) : { width: 0, height: 0 }, Q2 = t3.modifiersData["arrow#persistent"] ? t3.modifiersData["arrow#persistent"].padding : { top: 0, right: 0, bottom: 0, left: 0 }, ee2 = Q2[M2], te2 = Q2[V2], oe2 = ie(0, C2[W2], K2[W2]), ne2 = S2 ? C2[W2] / 2 - X2 - oe2 - ee2 - D2.mainAxis : Y2 - oe2 - ee2 - D2.mainAxis, ae2 = S2 ? -C2[W2] / 2 + X2 + oe2 + te2 + D2.mainAxis : G2 + oe2 + te2 + D2.mainAxis, se2 = t3.elements.arrow && _(t3.elements.arrow), ce2 = se2 ? "y" === x2 ? se2.clientTop || 0 : se2.clientLeft || 0 : 0, le = null != (I2 = null == H2 ? void 0 : H2[x2]) ? I2 : 0, ue = $2 + ae2 - le, fe = ie(h2 ? c(z2, $2 + ne2 - le - ce2) : z2, $2, h2 ? s(F2, ue) : F2);
                  A2[x2] = fe, B2[x2] = fe - $2;
                }
                if (l2) {
                  var pe, de = "x" === x2 ? E : P, ye = "x" === x2 ? k : j, he = A2[L2], ve = "y" === L2 ? "height" : "width", me = he + g2[de], be = he - g2[ye], ge = -1 !== [E, P].indexOf(w2), we = null != (pe = null == H2 ? void 0 : H2[L2]) ? pe : 0, Oe = ge ? me : he - C2[ve] - q2[ve] - we + D2.altAxis, Se = ge ? he + C2[ve] + q2[ve] - we - D2.altAxis : be, xe = h2 && ge ? function(e4, t4, o4) {
                    var n4 = ie(e4, t4, o4);
                    return n4 > o4 ? o4 : n4;
                  }(Oe, he, Se) : ie(h2 ? Oe : me, he, h2 ? Se : be);
                  A2[L2] = xe, B2[L2] = xe - he;
                }
                t3.modifiersData[n3] = B2;
              }
            }, requiresIfExists: ["offset"] }, { name: "arrow", enabled: true, phase: "main", fn: function(e3) {
              var t3, o3 = e3.state, n3 = e3.name, r2 = e3.options, i2 = o3.elements.arrow, a2 = o3.modifiersData.popperOffsets, s2 = N(o3.placement), c2 = U(s2), l2 = [P, j].indexOf(s2) >= 0 ? "height" : "width";
              if (i2 && a2) {
                var u2 = function(e4, t4) {
                  return oe("number" != typeof (e4 = "function" == typeof e4 ? e4(Object.assign({}, t4.rects, { placement: t4.placement })) : e4) ? e4 : ne(e4, A));
                }(r2.padding, o3), f2 = b(i2), p2 = "y" === c2 ? E : P, d2 = "y" === c2 ? k : j, y2 = o3.rects.reference[l2] + o3.rects.reference[c2] - a2[c2] - o3.rects.popper[l2], h2 = a2[c2] - o3.rects.reference[c2], v2 = _(i2), m2 = v2 ? "y" === c2 ? v2.clientHeight || 0 : v2.clientWidth || 0 : 0, g2 = y2 / 2 - h2 / 2, w2 = u2[p2], O2 = m2 - f2[l2] - u2[d2], S2 = m2 / 2 - f2[l2] / 2 + g2, x2 = ie(w2, S2, O2), L2 = c2;
                o3.modifiersData[n3] = ((t3 = {})[L2] = x2, t3.centerOffset = x2 - S2, t3);
              }
            }, effect: function(e3) {
              var t3 = e3.state, o3 = e3.options.element, n3 = void 0 === o3 ? "[data-popper-arrow]" : o3;
              null != n3 && ("string" != typeof n3 || (n3 = t3.elements.popper.querySelector(n3))) && Q(t3.elements.popper, n3) && (t3.elements.arrow = n3);
            }, requires: ["popperOffsets"], requiresIfExists: ["preventOverflow"] }, { name: "hide", enabled: true, phase: "main", requiresIfExists: ["preventOverflow"], fn: function(e3) {
              var t3 = e3.state, o3 = e3.name, n3 = t3.rects.reference, r2 = t3.rects.popper, i2 = t3.modifiersData.preventOverflow, a2 = re(t3, { elementContext: "reference" }), s2 = re(t3, { altBoundary: true }), c2 = ae(a2, n3), l2 = ae(s2, r2, i2), u2 = se(c2), f2 = se(l2);
              t3.modifiersData[o3] = { referenceClippingOffsets: c2, popperEscapeOffsets: l2, isReferenceHidden: u2, hasPopperEscaped: f2 }, t3.attributes.popper = Object.assign({}, t3.attributes.popper, { "data-popper-reference-hidden": u2, "data-popper-escaped": f2 });
            } }] });
          } }, t = {};
          function o(n2) {
            var r = t[n2];
            if (void 0 !== r)
              return r.exports;
            var i = t[n2] = { exports: {} };
            return e[n2](i, i.exports, o), i.exports;
          }
          o.d = (e2, t2) => {
            for (var n2 in t2)
              o.o(t2, n2) && !o.o(e2, n2) && Object.defineProperty(e2, n2, { enumerable: true, get: t2[n2] });
          }, o.o = (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2), o.r = (e2) => {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
          };
          var n = {};
          return o.r(n), o(661), o(795), o(682), o(284), o(181), o(778), o(51), o(185), n;
        })();
      });
    }
  });

  // ../../node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      HTMLElement: function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype = window.Event.prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class extends HTMLElement {
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new FrameElement.delegateConstructor(this);
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "complete") {
        this.delegate.completeChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name, value);
    }
  }
  function createDocumentFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name) {
    return document.querySelector(`meta[name="${name}"]`);
  }
  function getMetaContent(name) {
    const element = getMetaElement(name);
    return element && element.content;
  }
  function setMetaContent(name, content) {
    let element = getMetaElement(name);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    var _a;
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (_value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response = await fetch(this.url.href, fetchOptions);
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          if (this.willDelegateErrorHandling(error2)) {
            this.delegate.requestErrored(this, error2);
          }
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isSafe ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isSafe() {
      return this.method === FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
    willDelegateErrorHandling(error2) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error2 }
      });
      return !event.defaultPrevented;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class {
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
        return this.submitter.getAttribute("formaction") || "";
      } else {
        return this.formElement.getAttribute("action") || formElementAction || "";
      }
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isSafe() {
      return this.fetchRequest.isSafe;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name, value]) => {
        return entries.concat(typeof value == "string" ? [[name, value]] : []);
      }, []);
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareRequest(request) {
      if (!request.isSafe) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request)) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      this.setSubmitsWith();
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
      } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(_request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      this.resetSubmitterText();
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: Object.assign({ formSubmission: this }, this.result)
      });
      this.delegate.formSubmissionFinished(this);
    }
    setSubmitsWith() {
      if (!this.submitter || !this.submitsWith)
        return;
      if (this.submitter.matches("button")) {
        this.originalSubmitText = this.submitter.innerHTML;
        this.submitter.innerHTML = this.submitsWith;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        this.originalSubmitText = input.value;
        input.value = this.submitsWith;
      }
    }
    resetSubmitterText() {
      if (!this.submitter || !this.originalSubmitText)
        return;
      if (this.submitter.matches("button")) {
        this.submitter.innerHTML = this.originalSubmitText;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        input.value = this.originalSubmitText;
      }
    }
    requestMustRedirect(request) {
      return !request.isSafe && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request) {
      return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
    get submitsWith() {
      var _a;
      return (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("data-turbo-submits-with");
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name) {
      formData.append(name, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
      for (const element of this.element.querySelectorAll("[autofocus]")) {
        if (element.closest(inertDisabledOrHidden) == null)
          return element;
        else
          continue;
      }
      return null;
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id2) {
      return getPermanentElementById(this.element, id2);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id: id2 } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id2);
        if (newPermanentElement) {
          permanentElementMap[id2] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id2) {
    return node.querySelector(`#${id2}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.submitCaptured = () => {
        this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
        this.eventTarget.addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
      const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (_value) => {
      };
      this.resolveInterceptionPromise = (_value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    missing() {
      this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = (_event) => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.clickCaptured = () => {
        this.eventTarget.removeEventListener("click", this.clickBubbled, false);
        this.eventTarget.addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link && doesNotTargetIFrame(link)) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    enter() {
      for (const id2 in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id2];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id2 in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id2];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id2) {
      return this.placeholders.find((element) => element.content == id2);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.activeElement = null;
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    enteringBardo(currentPermanentElement) {
      if (this.activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
        this.activeElement.focus();
        this.activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
  };
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class {
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class extends Snapshot {
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions)
          option.selected = false;
        for (const option of source.selectedOptions)
          clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new PageSnapshot(clonedElement, this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.shouldCacheSnapshot = true;
      this.acceptsStreamResponse = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshot, snapshotHTML, response, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    prepareRequest(request) {
      if (this.acceptsStreamResponse) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = new Date().getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(_visit) {
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
    }
    visitRendered(_visit) {
    }
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload(reason) {
      var _a;
      dispatch("turbo:reload", { detail: reason });
      window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.selector = "[data-turbo-temporary]";
      this.deprecatedSelector = "[data-turbo-cache=false]";
      this.started = false;
      this.removeTemporaryElements = (_event) => {
        for (const element of this.temporaryElements) {
          element.remove();
        }
      };
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    get temporaryElements() {
      return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
    }
    get temporaryElementsWithDeprecation() {
      const elements = document.querySelectorAll(this.deprecatedSelector);
      if (elements.length) {
        console.warn(`The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`);
      }
      return [...elements];
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    findFrameElement(element, submitter) {
      const id2 = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id2 && id2 != "_top") {
        const frame = this.element.querySelector(`#${id2}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (_event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.isSafe;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission({ submitter, formElement }) {
      return getVisitAction(submitter, formElement) || "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
    }
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id: id2 } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id2);
        if (elementInStream) {
          permanentElementMap[id2] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response = fetchResponseFromEvent(event);
        if (response && fetchResponseIsStream(response)) {
          event.preventDefault();
          this.receiveMessageResponse(response);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    var _a;
    const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
      this.forceReloaded = false;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    constructor(delegate) {
      this.selector = "a[data-turbo-preload]";
      this.delegate = delegate;
    }
    get snapshotCache() {
      return this.delegate.navigator.view.snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        return document.addEventListener("DOMContentLoaded", () => {
          this.preloadOnLoadLinksForView(document.body);
        });
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        this.preloadURL(link);
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      try {
        const response = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
        const responseText = await response.text();
        const snapshot = PageSnapshot.fromHTMLString(responseText);
        this.snapshotCache.put(location2, snapshot);
      } catch (_) {
      }
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.preloader = new Preloader(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this, window);
      this.formSubmitObserver = new FormSubmitObserver(this, document);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
      this.frameRedirector = new FrameRedirector(this, document.documentElement);
      this.streamMessageRenderer = new StreamMessageRenderer();
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
      this.formMode = "on";
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        frameElement.src = location2.toString();
        frameElement.loaded;
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: Object.assign({ newBody }, options),
        cancelable: true
      });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.setCacheControl("");
    }
    exemptPageFromCache() {
      this.setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.setCacheControl("no-preview");
    }
    setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    }
  };
  var session = new Session();
  var cache = new Cache(session);
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode,
    StreamActions
  });
  var TurboFrameMissingError = class extends Error {
  };
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (_fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.ignoredAttributes = /* @__PURE__ */ new Set();
      this.action = null;
      this.visitCachedSnapshot = ({ element: element2 }) => {
        const frame = element2.querySelector("#" + this.element.id);
        if (frame && this.previousFrameElement) {
          frame.replaceChildren(...this.previousFrameElement.children);
        }
        delete this.previousFrameElement;
      };
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.isIgnoringChangesTo("complete"))
        return;
      this.loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const document2 = parseHTMLDocument(html);
          const pageSnapshot = PageSnapshot.fromDocument(document2);
          if (pageSnapshot.isVisitable) {
            await this.loadFrameResponse(fetchResponse, document2);
          } else {
            await this.handleUnvisitableFrameResponse(fetchResponse);
          }
        }
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, element);
      this.loadSourceURL();
    }
    willSubmitFormLinkToLocation(link) {
      return this.shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.navigateFrame(element, location2);
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    prepareRequest(request) {
      var _a;
      request.headers["Turbo-Frame"] = this.id;
      if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    async requestFailedWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response);
      if (!formSubmission.isSafe) {
        session.clearCache();
      }
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
      session.clearCache();
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: Object.assign({ newFrame }, options),
        cancelable: true
      });
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    async loadFrameResponse(fetchResponse, document2) {
      const newFrameElement = await this.extractForeignFrameElement(document2.body);
      if (newFrameElement) {
        const snapshot = new Snapshot(newFrameElement);
        const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
        if (this.view.renderPromise)
          await this.view.renderPromise;
        this.changeHistory();
        await this.view.render(renderer);
        this.complete = true;
        session.frameRendered(fetchResponse, this.element);
        session.frameLoaded(this.element);
        this.fetchResponseLoaded(fetchResponse);
      } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
        this.handleFrameMissingFromResponse(fetchResponse);
      }
    }
    async visit(url) {
      var _a;
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      this.withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      this.action = getVisitAction(submitter, element, frame);
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response = { statusCode, redirected, responseHTML };
            const options = {
              response,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    async handleUnvisitableFrameResponse(fetchResponse) {
      console.warn(`The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`);
      await this.visitResponse(fetchResponse.response);
    }
    willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response = fetchResponse.response;
      const visit2 = async (url, options = {}) => {
        if (url instanceof Response) {
          this.visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    handleFrameMissingFromResponse(fetchResponse) {
      this.view.missing();
      this.throwFrameMissingError(fetchResponse);
    }
    throwFrameMissingError(fetchResponse) {
      const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
      throw new TurboFrameMissingError(message);
    }
    async visitResponse(response) {
      const wrapped = new FetchResponse(response);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    findFrameElement(element, submitter) {
      var _a;
      const id2 = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id2)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id2 = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id2}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id2}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error2) {
        console.error(error2);
        return new FrameElement();
      }
      return null;
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id2 = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id2 == "_top") {
        return false;
      }
      if (id2) {
        const frameElement = getFrameElementById(id2);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    isIgnoringChangesTo(attributeName) {
      return this.ignoredAttributes.has(attributeName);
    }
    ignoringChangesToAttribute(attributeName, callback) {
      this.ignoredAttributes.add(attributeName);
      callback();
      this.ignoredAttributes.delete(attributeName);
    }
    withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id2) {
    if (id2 != null) {
      const element = document.getElementById(id2);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamElement = class extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextAnimationFrame();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
      const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c) => !!c.id).map((c) => c.id);
      return existingChildren.filter((c) => newChildrenIds.includes(c.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild === null) {
        const template = this.ownerDocument.createElement("template");
        this.appendChild(template);
        return template;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.streamSource = null;
    }
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = Turbo;
  start();

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object")
      return obj;
    if (obj instanceof Date || obj instanceof RegExp)
      return obj;
    if (Array.isArray(obj))
      return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
        return "_" + x.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, {
        received: this.dispatchMessageEvent.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    subscriptionConnected() {
      this.setAttribute("connected", "");
    }
    subscriptionDisconnected() {
      this.removeAttribute("connected");
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // ../../node_modules/@rails/activestorage/app/assets/javascripts/activestorage.esm.js
  var sparkMd5 = {
    exports: {}
  };
  (function(module, exports) {
    (function(factory) {
      {
        module.exports = factory();
      }
    })(function(undefined$1) {
      var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
      function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[10] - 42063 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b ^ c ^ d) + k[5] - 378558 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        x[0] = a + x[0] | 0;
        x[1] = b + x[1] | 0;
        x[2] = c + x[2] | 0;
        x[3] = d + x[3] | 0;
      }
      function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
      }
      function md5blk_array(a) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
      }
      function md51(s) {
        var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
        for (i = 64; i <= n; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
        }
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(state, tail);
        return state;
      }
      function md51_array(a) {
        var n = a.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
        for (i = 64; i <= n; i += 64) {
          md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }
        a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);
        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= a[i] << (i % 4 << 3);
        }
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(state, tail);
        return state;
      }
      function rhex(n) {
        var s = "", j;
        for (j = 0; j < 4; j += 1) {
          s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
        }
        return s;
      }
      function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
          x[i] = rhex(x[i]);
        }
        return x.join("");
      }
      if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592")
        ;
      if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
        (function() {
          function clamp(val, length) {
            val = val | 0 || 0;
            if (val < 0) {
              return Math.max(val + length, 0);
            }
            return Math.min(val, length);
          }
          ArrayBuffer.prototype.slice = function(from, to) {
            var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
            if (to !== undefined$1) {
              end = clamp(to, length);
            }
            if (begin > end) {
              return new ArrayBuffer(0);
            }
            num = end - begin;
            target = new ArrayBuffer(num);
            targetArray = new Uint8Array(target);
            sourceArray = new Uint8Array(this, begin, num);
            targetArray.set(sourceArray);
            return target;
          };
        })();
      }
      function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
          str = unescape(encodeURIComponent(str));
        }
        return str;
      }
      function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i;
        for (i = 0; i < length; i += 1) {
          arr[i] = str.charCodeAt(i);
        }
        return returnUInt8Array ? arr : buff;
      }
      function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
      }
      function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);
        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);
        return returnUInt8Array ? result : result.buffer;
      }
      function hexToBinaryString(hex2) {
        var bytes = [], length = hex2.length, x;
        for (x = 0; x < length - 1; x += 2) {
          bytes.push(parseInt(hex2.substr(x, 2), 16));
        }
        return String.fromCharCode.apply(String, bytes);
      }
      function SparkMD52() {
        this.reset();
      }
      SparkMD52.prototype.append = function(str) {
        this.appendBinary(toUtf8(str));
        return this;
      };
      SparkMD52.prototype.appendBinary = function(contents) {
        this._buff += contents;
        this._length += contents.length;
        var length = this._buff.length, i;
        for (i = 64; i <= length; i += 64) {
          md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }
        this._buff = this._buff.substring(i - 64);
        return this;
      };
      SparkMD52.prototype.end = function(raw) {
        var buff = this._buff, length = buff.length, i, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
        }
        this._finish(tail, length);
        ret = hex(this._hash);
        if (raw) {
          ret = hexToBinaryString(ret);
        }
        this.reset();
        return ret;
      };
      SparkMD52.prototype.reset = function() {
        this._buff = "";
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];
        return this;
      };
      SparkMD52.prototype.getState = function() {
        return {
          buff: this._buff,
          length: this._length,
          hash: this._hash.slice()
        };
      };
      SparkMD52.prototype.setState = function(state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;
        return this;
      };
      SparkMD52.prototype.destroy = function() {
        delete this._hash;
        delete this._buff;
        delete this._length;
      };
      SparkMD52.prototype._finish = function(tail, length) {
        var i = length, tmp, lo, hi;
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(this._hash, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
      };
      SparkMD52.hash = function(str, raw) {
        return SparkMD52.hashBinary(toUtf8(str), raw);
      };
      SparkMD52.hashBinary = function(content, raw) {
        var hash = md51(content), ret = hex(hash);
        return raw ? hexToBinaryString(ret) : ret;
      };
      SparkMD52.ArrayBuffer = function() {
        this.reset();
      };
      SparkMD52.ArrayBuffer.prototype.append = function(arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i;
        this._length += arr.byteLength;
        for (i = 64; i <= length; i += 64) {
          md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }
        this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
        return this;
      };
      SparkMD52.ArrayBuffer.prototype.end = function(raw) {
        var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i, ret;
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= buff[i] << (i % 4 << 3);
        }
        this._finish(tail, length);
        ret = hex(this._hash);
        if (raw) {
          ret = hexToBinaryString(ret);
        }
        this.reset();
        return ret;
      };
      SparkMD52.ArrayBuffer.prototype.reset = function() {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];
        return this;
      };
      SparkMD52.ArrayBuffer.prototype.getState = function() {
        var state = SparkMD52.prototype.getState.call(this);
        state.buff = arrayBuffer2Utf8Str(state.buff);
        return state;
      };
      SparkMD52.ArrayBuffer.prototype.setState = function(state) {
        state.buff = utf8Str2ArrayBuffer(state.buff, true);
        return SparkMD52.prototype.setState.call(this, state);
      };
      SparkMD52.ArrayBuffer.prototype.destroy = SparkMD52.prototype.destroy;
      SparkMD52.ArrayBuffer.prototype._finish = SparkMD52.prototype._finish;
      SparkMD52.ArrayBuffer.hash = function(arr, raw) {
        var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
        return raw ? hexToBinaryString(ret) : ret;
      };
      return SparkMD52;
    });
  })(sparkMd5);
  var SparkMD5 = sparkMd5.exports;
  var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
  var FileChecksum = class {
    static create(file, callback) {
      const instance = new FileChecksum(file);
      instance.create(callback);
    }
    constructor(file) {
      this.file = file;
      this.chunkSize = 2097152;
      this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
      this.chunkIndex = 0;
    }
    create(callback) {
      this.callback = callback;
      this.md5Buffer = new SparkMD5.ArrayBuffer();
      this.fileReader = new FileReader();
      this.fileReader.addEventListener("load", (event) => this.fileReaderDidLoad(event));
      this.fileReader.addEventListener("error", (event) => this.fileReaderDidError(event));
      this.readNextChunk();
    }
    fileReaderDidLoad(event) {
      this.md5Buffer.append(event.target.result);
      if (!this.readNextChunk()) {
        const binaryDigest = this.md5Buffer.end(true);
        const base64digest = btoa(binaryDigest);
        this.callback(null, base64digest);
      }
    }
    fileReaderDidError(event) {
      this.callback(`Error reading ${this.file.name}`);
    }
    readNextChunk() {
      if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
        const start3 = this.chunkIndex * this.chunkSize;
        const end = Math.min(start3 + this.chunkSize, this.file.size);
        const bytes = fileSlice.call(this.file, start3, end);
        this.fileReader.readAsArrayBuffer(bytes);
        this.chunkIndex++;
        return true;
      } else {
        return false;
      }
    }
  };
  function getMetaValue(name) {
    const element = findElement(document.head, `meta[name="${name}"]`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  function findElements(root, selector) {
    if (typeof root == "string") {
      selector = root;
      root = document;
    }
    const elements = root.querySelectorAll(selector);
    return toArray(elements);
  }
  function findElement(root, selector) {
    if (typeof root == "string") {
      selector = root;
      root = document;
    }
    return root.querySelector(selector);
  }
  function dispatchEvent2(element, type, eventInit = {}) {
    const { disabled } = element;
    const { bubbles, cancelable, detail } = eventInit;
    const event = document.createEvent("Event");
    event.initEvent(type, bubbles || true, cancelable || true);
    event.detail = detail || {};
    try {
      element.disabled = false;
      element.dispatchEvent(event);
    } finally {
      element.disabled = disabled;
    }
    return event;
  }
  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    } else if (Array.from) {
      return Array.from(value);
    } else {
      return [].slice.call(value);
    }
  }
  var BlobRecord = class {
    constructor(file, checksum, url) {
      this.file = file;
      this.attributes = {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        byte_size: file.size,
        checksum
      };
      this.xhr = new XMLHttpRequest();
      this.xhr.open("POST", url, true);
      this.xhr.responseType = "json";
      this.xhr.setRequestHeader("Content-Type", "application/json");
      this.xhr.setRequestHeader("Accept", "application/json");
      this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      const csrfToken = getMetaValue("csrf-token");
      if (csrfToken != void 0) {
        this.xhr.setRequestHeader("X-CSRF-Token", csrfToken);
      }
      this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
      this.xhr.addEventListener("error", (event) => this.requestDidError(event));
    }
    get status() {
      return this.xhr.status;
    }
    get response() {
      const { responseType, response } = this.xhr;
      if (responseType == "json") {
        return response;
      } else {
        return JSON.parse(response);
      }
    }
    create(callback) {
      this.callback = callback;
      this.xhr.send(JSON.stringify({
        blob: this.attributes
      }));
    }
    requestDidLoad(event) {
      if (this.status >= 200 && this.status < 300) {
        const { response } = this;
        const { direct_upload } = response;
        delete response.direct_upload;
        this.attributes = response;
        this.directUploadData = direct_upload;
        this.callback(null, this.toJSON());
      } else {
        this.requestDidError(event);
      }
    }
    requestDidError(event) {
      this.callback(`Error creating Blob for "${this.file.name}". Status: ${this.status}`);
    }
    toJSON() {
      const result = {};
      for (const key in this.attributes) {
        result[key] = this.attributes[key];
      }
      return result;
    }
  };
  var BlobUpload = class {
    constructor(blob) {
      this.blob = blob;
      this.file = blob.file;
      const { url, headers } = blob.directUploadData;
      this.xhr = new XMLHttpRequest();
      this.xhr.open("PUT", url, true);
      this.xhr.responseType = "text";
      for (const key in headers) {
        this.xhr.setRequestHeader(key, headers[key]);
      }
      this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
      this.xhr.addEventListener("error", (event) => this.requestDidError(event));
    }
    create(callback) {
      this.callback = callback;
      this.xhr.send(this.file.slice());
    }
    requestDidLoad(event) {
      const { status, response } = this.xhr;
      if (status >= 200 && status < 300) {
        this.callback(null, response);
      } else {
        this.requestDidError(event);
      }
    }
    requestDidError(event) {
      this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`);
    }
  };
  var id = 0;
  var DirectUpload = class {
    constructor(file, url, delegate) {
      this.id = ++id;
      this.file = file;
      this.url = url;
      this.delegate = delegate;
    }
    create(callback) {
      FileChecksum.create(this.file, (error2, checksum) => {
        if (error2) {
          callback(error2);
          return;
        }
        const blob = new BlobRecord(this.file, checksum, this.url);
        notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
        blob.create((error3) => {
          if (error3) {
            callback(error3);
          } else {
            const upload = new BlobUpload(blob);
            notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
            upload.create((error4) => {
              if (error4) {
                callback(error4);
              } else {
                callback(null, blob.toJSON());
              }
            });
          }
        });
      });
    }
  };
  function notify(object, methodName, ...messages) {
    if (object && typeof object[methodName] == "function") {
      return object[methodName](...messages);
    }
  }
  var DirectUploadController = class {
    constructor(input, file) {
      this.input = input;
      this.file = file;
      this.directUpload = new DirectUpload(this.file, this.url, this);
      this.dispatch("initialize");
    }
    start(callback) {
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = this.input.name;
      this.input.insertAdjacentElement("beforebegin", hiddenInput);
      this.dispatch("start");
      this.directUpload.create((error2, attributes) => {
        if (error2) {
          hiddenInput.parentNode.removeChild(hiddenInput);
          this.dispatchError(error2);
        } else {
          hiddenInput.value = attributes.signed_id;
        }
        this.dispatch("end");
        callback(error2);
      });
    }
    uploadRequestDidProgress(event) {
      const progress = event.loaded / event.total * 100;
      if (progress) {
        this.dispatch("progress", {
          progress
        });
      }
    }
    get url() {
      return this.input.getAttribute("data-direct-upload-url");
    }
    dispatch(name, detail = {}) {
      detail.file = this.file;
      detail.id = this.directUpload.id;
      return dispatchEvent2(this.input, `direct-upload:${name}`, {
        detail
      });
    }
    dispatchError(error2) {
      const event = this.dispatch("error", {
        error: error2
      });
      if (!event.defaultPrevented) {
        alert(error2);
      }
    }
    directUploadWillCreateBlobWithXHR(xhr) {
      this.dispatch("before-blob-request", {
        xhr
      });
    }
    directUploadWillStoreFileWithXHR(xhr) {
      this.dispatch("before-storage-request", {
        xhr
      });
      xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
    }
  };
  var inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";
  var DirectUploadsController = class {
    constructor(form) {
      this.form = form;
      this.inputs = findElements(form, inputSelector).filter((input) => input.files.length);
    }
    start(callback) {
      const controllers = this.createDirectUploadControllers();
      const startNextController = () => {
        const controller = controllers.shift();
        if (controller) {
          controller.start((error2) => {
            if (error2) {
              callback(error2);
              this.dispatch("end");
            } else {
              startNextController();
            }
          });
        } else {
          callback();
          this.dispatch("end");
        }
      };
      this.dispatch("start");
      startNextController();
    }
    createDirectUploadControllers() {
      const controllers = [];
      this.inputs.forEach((input) => {
        toArray(input.files).forEach((file) => {
          const controller = new DirectUploadController(input, file);
          controllers.push(controller);
        });
      });
      return controllers;
    }
    dispatch(name, detail = {}) {
      return dispatchEvent2(this.form, `direct-uploads:${name}`, {
        detail
      });
    }
  };
  var processingAttribute = "data-direct-uploads-processing";
  var submitButtonsByForm = /* @__PURE__ */ new WeakMap();
  var started = false;
  function start2() {
    if (!started) {
      started = true;
      document.addEventListener("click", didClick, true);
      document.addEventListener("submit", didSubmitForm, true);
      document.addEventListener("ajax:before", didSubmitRemoteElement);
    }
  }
  function didClick(event) {
    const { target } = event;
    if ((target.tagName == "INPUT" || target.tagName == "BUTTON") && target.type == "submit" && target.form) {
      submitButtonsByForm.set(target.form, target);
    }
  }
  function didSubmitForm(event) {
    handleFormSubmissionEvent(event);
  }
  function didSubmitRemoteElement(event) {
    if (event.target.tagName == "FORM") {
      handleFormSubmissionEvent(event);
    }
  }
  function handleFormSubmissionEvent(event) {
    const form = event.target;
    if (form.hasAttribute(processingAttribute)) {
      event.preventDefault();
      return;
    }
    const controller = new DirectUploadsController(form);
    const { inputs } = controller;
    if (inputs.length) {
      event.preventDefault();
      form.setAttribute(processingAttribute, "");
      inputs.forEach(disable);
      controller.start((error2) => {
        form.removeAttribute(processingAttribute);
        if (error2) {
          inputs.forEach(enable);
        } else {
          submitForm(form);
        }
      });
    }
  }
  function submitForm(form) {
    let button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
    if (button) {
      const { disabled } = button;
      button.disabled = false;
      button.focus();
      button.click();
      button.disabled = disabled;
    } else {
      button = document.createElement("input");
      button.type = "submit";
      button.style.display = "none";
      form.appendChild(button);
      button.click();
      form.removeChild(button);
    }
    submitButtonsByForm.delete(form);
  }
  function disable(input) {
    input.disabled = true;
  }
  function enable(input) {
    input.disabled = false;
  }
  function autostart() {
    if (window.ActiveStorage) {
      start2();
    }
  }
  setTimeout(autostart, 1);

  // ../../node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[1];
    let keyFilter = matches[2];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[3]),
      eventName,
      eventOptions: matches[6] ? parseEventOptions(matches[6]) : {},
      identifier: matches[4],
      methodName: matches[5],
      keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  var Action = class {
    constructor(element, index, descriptor, schema) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    isFilterTarget(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filteres = this.keyFilter.split("+");
      const modifiers = ["meta", "ctrl", "alt", "shift"];
      const [meta, ctrl, alt, shift] = modifiers.map((modifier) => filteres.includes(modifier));
      if (event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift) {
        return true;
      }
      const standardFilter = filteres.filter((key) => !modifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          params[camelize(key)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(event)) {
        this.invokeWithEvent(event);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter = actionDescriptorFilters[name];
          passes = passes && filter({ name, value, event, element });
        } else {
          continue;
        }
      }
      return passes;
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        const { params } = this.action;
        const actionEvent = Object.assign(event, { params });
        this.method.call(this.controller, actionEvent);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.isFilterTarget(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(node, attributeName) {
      const element = node;
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details = {}) {
      this.selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const matches = element.matches(this.selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    }
    elementMatched(element) {
      this.selectorMatched(element);
    }
    elementUnmatched(element) {
      this.selectorUnmatched(element);
    }
    elementAttributeChanged(element, _attributeName) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(this.selector, element);
      if (!matches && matchedBefore) {
        this.selectorUnmatched(element);
      }
    }
    selectorMatched(element) {
      if (this.delegate.selectorMatched) {
        this.delegate.selectorMatched(element, this.selector, this.details);
        this.matchesByElement.add(this.selector, element);
      }
    }
    selectorUnmatched(element) {
      this.delegate.selectorUnmatched(element, this.selector, this.details);
      this.matchesByElement.delete(this.selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (this.selectorObserverMap.size === 0) {
        this.outletDefinitions.forEach((outletName) => {
          const selector = this.selector(outletName);
          const details = { outletName };
          if (selector) {
            this.selectorObserverMap.set(outletName, new SelectorObserver(document.body, selector, this, details));
          }
        });
        this.selectorObserverMap.forEach((observer) => observer.start());
      }
      this.dependentContexts.forEach((context) => context.refresh());
    }
    stop() {
      if (this.selectorObserverMap.size > 0) {
        this.disconnectAllOutlets();
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      return this.hasOutlet(element, outletName) && element.matches(`[${this.context.application.schema.controllerAttribute}~=${outletName}]`);
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module) => {
        const constructor = module.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad(definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application2 = new this(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter) {
      this.actionDescriptorFilters[name] = filter;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            const outletController = this.application.getControllerForElementAndIdentifier(outlet, name);
            if (outletController) {
              return outletController;
            } else {
              throw new Error(`Missing "data-controller=${name}" attribute on outlet element for "${this.identifier}" controller`);
            }
          }
          throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outlet) => {
              const controller = this.application.getControllerForElementAndIdentifier(outlet, name);
              if (controller) {
                return controller;
              } else {
                console.warn(`The provided outlet element is missing the outlet controller "${name}" for "${this.identifier}"`, outlet);
              }
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outlet = this.outlets.find(name);
          if (outlet) {
            return outlet;
          } else {
            throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
    if (!typeFromObject)
      return;
    const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
    if (typeFromObject !== defaultValueType) {
      const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
    }
    return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const typeFromObject = parseValueTypeObject({
      controller: payload.controller,
      token: payload.token,
      typeObject: payload.typeDefinition
    });
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
    const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
    throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const key = `${dasherize(payload.token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(payload.typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(payload.typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value);
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // controllers/application.js
  var application = Application.start();
  application.debug = false;
  window.Stimulus = application;

  // controllers/hello_controller.js
  var hello_controller_default = class extends Controller {
    connect() {
      console.log("Hello World!");
    }
  };

  // controllers/modal_controller.js
  var import_cash_dom = __toESM(require_cash());
  var modal_controller_default = class extends Controller {
    connect() {
      console.log("Modal Connected");
    }
    open(event) {
      console.log(event);
      const modal = (0, import_cash_dom.default)(`#modal`);
      modal.show();
      console.log("Modal Opened");
    }
    close(event) {
      console.log(event);
      const modal = (0, import_cash_dom.default)(`#modal`);
      if (event.detail.success) {
        modal.hide();
      }
    }
  };
  __publicField(modal_controller_default, "targets", ["modal"]);

  // ../../node_modules/@rails/request.js/src/fetch_response.js
  var FetchResponse2 = class {
    constructor(response) {
      this.response = response;
    }
    get statusCode() {
      return this.response.status;
    }
    get redirected() {
      return this.response.redirected;
    }
    get ok() {
      return this.response.ok;
    }
    get unauthenticated() {
      return this.statusCode === 401;
    }
    get unprocessableEntity() {
      return this.statusCode === 422;
    }
    get authenticationURL() {
      return this.response.headers.get("WWW-Authenticate");
    }
    get contentType() {
      const contentType = this.response.headers.get("Content-Type") || "";
      return contentType.replace(/;.*$/, "");
    }
    get headers() {
      return this.response.headers;
    }
    get html() {
      if (this.contentType.match(/^(application|text)\/(html|xhtml\+xml)$/)) {
        return this.text;
      }
      return Promise.reject(new Error(`Expected an HTML response but got "${this.contentType}" instead`));
    }
    get json() {
      if (this.contentType.match(/^application\/.*json$/)) {
        return this.responseJson || (this.responseJson = this.response.json());
      }
      return Promise.reject(new Error(`Expected a JSON response but got "${this.contentType}" instead`));
    }
    get text() {
      return this.responseText || (this.responseText = this.response.text());
    }
    get isTurboStream() {
      return this.contentType.match(/^text\/vnd\.turbo-stream\.html/);
    }
    async renderTurboStream() {
      if (this.isTurboStream) {
        if (window.Turbo) {
          await window.Turbo.renderStreamMessage(await this.text);
        } else {
          console.warn("You must set `window.Turbo = Turbo` to automatically process Turbo Stream events with request.js");
        }
      } else {
        return Promise.reject(new Error(`Expected a Turbo Stream response but got "${this.contentType}" instead`));
      }
    }
  };

  // ../../node_modules/@rails/request.js/src/request_interceptor.js
  var RequestInterceptor = class {
    static register(interceptor) {
      this.interceptor = interceptor;
    }
    static get() {
      return this.interceptor;
    }
    static reset() {
      this.interceptor = void 0;
    }
  };

  // ../../node_modules/@rails/request.js/src/lib/utils.js
  function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = cookies.find((cookie2) => cookie2.startsWith(prefix));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      if (value) {
        return decodeURIComponent(value);
      }
    }
  }
  function compact(object) {
    const result = {};
    for (const key in object) {
      const value = object[key];
      if (value !== void 0) {
        result[key] = value;
      }
    }
    return result;
  }
  function metaContent(name) {
    const element = document.head.querySelector(`meta[name="${name}"]`);
    return element && element.content;
  }
  function stringEntriesFromFormData(formData) {
    return [...formData].reduce((entries, [name, value]) => {
      return entries.concat(typeof value === "string" ? [[name, value]] : []);
    }, []);
  }
  function mergeEntries(searchParams, entries) {
    for (const [name, value] of entries) {
      if (value instanceof window.File)
        continue;
      if (searchParams.has(name)) {
        searchParams.delete(name);
        searchParams.set(name, value);
      } else {
        searchParams.append(name, value);
      }
    }
  }

  // ../../node_modules/@rails/request.js/src/fetch_request.js
  var FetchRequest2 = class {
    constructor(method, url, options = {}) {
      this.method = method;
      this.options = options;
      this.originalUrl = url.toString();
    }
    async perform() {
      try {
        const requestInterceptor = RequestInterceptor.get();
        if (requestInterceptor) {
          await requestInterceptor(this);
        }
      } catch (error2) {
        console.error(error2);
      }
      const response = new FetchResponse2(await window.fetch(this.url, this.fetchOptions));
      if (response.unauthenticated && response.authenticationURL) {
        return Promise.reject(window.location.href = response.authenticationURL);
      }
      if (response.ok && response.isTurboStream) {
        await response.renderTurboStream();
      }
      return response;
    }
    addHeader(key, value) {
      const headers = this.additionalHeaders;
      headers[key] = value;
      this.options.headers = headers;
    }
    get fetchOptions() {
      return {
        method: this.method.toUpperCase(),
        headers: this.headers,
        body: this.formattedBody,
        signal: this.signal,
        credentials: "same-origin",
        redirect: this.redirect
      };
    }
    get headers() {
      return compact(
        Object.assign(
          {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-Token": this.csrfToken,
            "Content-Type": this.contentType,
            Accept: this.accept
          },
          this.additionalHeaders
        )
      );
    }
    get csrfToken() {
      return getCookie(metaContent("csrf-param")) || metaContent("csrf-token");
    }
    get contentType() {
      if (this.options.contentType) {
        return this.options.contentType;
      } else if (this.body == null || this.body instanceof window.FormData) {
        return void 0;
      } else if (this.body instanceof window.File) {
        return this.body.type;
      }
      return "application/json";
    }
    get accept() {
      switch (this.responseKind) {
        case "html":
          return "text/html, application/xhtml+xml";
        case "turbo-stream":
          return "text/vnd.turbo-stream.html, text/html, application/xhtml+xml";
        case "json":
          return "application/json, application/vnd.api+json";
        default:
          return "*/*";
      }
    }
    get body() {
      return this.options.body;
    }
    get query() {
      const originalQuery = (this.originalUrl.split("?")[1] || "").split("#")[0];
      const params = new URLSearchParams(originalQuery);
      let requestQuery = this.options.query;
      if (requestQuery instanceof window.FormData) {
        requestQuery = stringEntriesFromFormData(requestQuery);
      } else if (requestQuery instanceof window.URLSearchParams) {
        requestQuery = requestQuery.entries();
      } else {
        requestQuery = Object.entries(requestQuery || {});
      }
      mergeEntries(params, requestQuery);
      const query = params.toString();
      return query.length > 0 ? `?${query}` : "";
    }
    get url() {
      return this.originalUrl.split("?")[0].split("#")[0] + this.query;
    }
    get responseKind() {
      return this.options.responseKind || "html";
    }
    get signal() {
      return this.options.signal;
    }
    get redirect() {
      return this.options.redirect || "follow";
    }
    get additionalHeaders() {
      return this.options.headers || {};
    }
    get formattedBody() {
      const bodyIsAString = Object.prototype.toString.call(this.body) === "[object String]";
      const contentTypeIsJson = this.headers["Content-Type"] === "application/json";
      if (contentTypeIsJson && !bodyIsAString) {
        return JSON.stringify(this.body);
      }
      return this.body;
    }
  };

  // ../../node_modules/@rails/request.js/src/verbs.js
  async function post(url, options) {
    const request = new FetchRequest2("post", url, options);
    return request.perform();
  }
  async function patch(url, options) {
    const request = new FetchRequest2("patch", url, options);
    return request.perform();
  }
  async function destroy(url, options) {
    const request = new FetchRequest2("delete", url, options);
    return request.perform();
  }

  // controllers/recipe_controller.js
  var import_cash_dom2 = __toESM(require_cash());
  var recipe_controller_default = class extends Controller {
    connect() {
      console.log("recipe controller");
    }
    async createTitle(event) {
      let body = {};
      body["title"] = this.titleTarget.value;
      let response = await post(`/recipes/title`, {
        body,
        responseKind: "json"
      });
      if (response.ok) {
        response.text.then((result) => {
          const { edit_url } = JSON.parse(result);
          window.location = edit_url;
        });
      } else {
      }
    }
    async editTitle(event) {
      let body = {};
      body["title"] = this.titleTarget.value;
      body["id"] = this.idValue;
      body["edit"] = "edit";
      console.log("Iam editing the title");
      console.log(this.idValue);
      let response = await post(`/recipes/title`, {
        body,
        responseKind: "json"
      });
      if (response.ok) {
        response.text.then((result) => {
          const { edit_url } = JSON.parse(result);
          window.location = edit_url;
        });
      } else {
      }
    }
    async create_ingredient(event) {
      event.preventDefault();
      const modal = (0, import_cash_dom2.default)("#recipeModal");
      const form = (0, import_cash_dom2.default)("#_recipe_ingredient_form")[0];
      const formData = new FormData(form);
      formData.append("id", this.idValue);
      if (form.checkValidity()) {
        const response = await patch("/recipes/create_ingredient", {
          body: formData,
          responseKind: "json"
        });
        if (response.ok) {
          modal.hide();
        } else {
          response.json.then(function(errors) {
          });
        }
      }
    }
    async update_ingredient(event) {
      const form = (0, import_cash_dom2.default)("#ingredient")[0];
      const formData = new FormData(form);
      if (form.checkVisibility()) {
        const response = await patch(`/ingredients/${this.ingredientIdValue}`, {
          body: formData,
          responseKind: "turbo-stream"
        });
        if (response.ok) {
        } else {
          console.log("server response", response);
        }
      }
    }
    async delete() {
      const response = await destroy(`/ingredients/${this.ingredientIdValue}`, {
        responseKind: "turbo-stream"
      });
      if (response.ok) {
        console.log(response);
      } else {
        console.log("server response", response);
      }
    }
    add_direction_fields() {
      const form = (0, import_cash_dom2.default)("#recipe-direction")[0];
      const submitDirectionButton = (0, import_cash_dom2.default)("#submit-direction-button")[0];
      const cloneElement = this.originalTarget.cloneNode(true);
      const formInputElementSize = form.getElementsByTagName("input").length - 1;
      cloneElement.getElementsByTagName("input")[0].name = `direction[${formInputElementSize + 1}]`;
      if (formInputElementSize > 0) {
        submitDirectionButton.removeAttribute("hidden");
      }
      cloneElement.removeAttribute("hidden");
      this.addDirectionTarget.removeAttribute("hidden");
      this.dynamicTarget.append(cloneElement);
    }
    async submitDirection() {
      const form = (0, import_cash_dom2.default)("#recipe-direction")[0];
      const formData = new FormData(form);
      for (const result of formData.entries()) {
        console.log(result);
      }
      if (form.checkVisibility()) {
        const response = await patch(`/recipes/create_directions`, {
          body: formData,
          responseKind: "turbo-stream"
        });
        if (response.ok) {
          console.log(response);
        } else {
          console.log("server response", response);
        }
      }
    }
    edit_direction(event) {
      const form = (0, import_cash_dom2.default)("#recipe-direction")[0];
    }
    async update_direction(event) {
      const form = (0, import_cash_dom2.default)("#recipe-direction-edit")[0];
      const formData = new FormData(form);
      if (form.checkVisibility()) {
        const response = await patch(`/recipes/update_direction`, {
          body: formData,
          responseKind: "turbo-stream"
        });
        if (response.ok) {
          console.log(response);
        } else {
          console.log("server response", response);
        }
      }
    }
    async delete_direction(event) {
      console.log(this.idValue);
      console.log(this.ingredientIdValue);
      const recipe_id = "";
      const ingredient_id = "";
      const response = await patch(`/recipes/delete_direction`, {
        body: { id: this.ingredientIdValue, recipe_id: this.idValue },
        responseKind: "turbo-stream"
      });
      if (response.ok) {
        console.log(response);
      } else {
        console.log("server response", response);
      }
    }
  };
  __publicField(recipe_controller_default, "targets", ["title", "dynamic", "original", "addDirection"]);
  __publicField(recipe_controller_default, "values", {
    title: String,
    ingredients: Array,
    directions: Array,
    description: String,
    id: Number,
    ingredientId: Number
  });

  // controllers/meal_plan_controller.js
  var meal_plan_controller_default = class extends Controller {
    connect() {
      console.log("hello connected");
    }
    update(event) {
      const planValue = this.planValue;
      const mealValue = this.mealValue;
      const mealtypeValue = this.mealtypeValue;
      const dayValue = this.dayValue;
      let body = {};
      body["plan_id"] = planValue;
      body["id"] = planValue;
      body["recipe_id"] = mealValue;
      body["meal_type"] = mealtypeValue;
      body["day"] = dayValue;
      patch(`/plans/meal_update/`, { body, responseKind: "turbo-stream" });
    }
  };
  // static targets = ['plan'];
  __publicField(meal_plan_controller_default, "values", {
    plan: Number,
    mealtype: String,
    meal: Number,
    day: String
  });

  // controllers/turbo_modal_controller.js
  var turbo_modal_controller_default = class extends Controller {
    // hide modal
    // action: "turbo-modal#hideModal"
    hideModal() {
      this.element.parentElement.removeAttribute("src");
      this.modalTarget.remove();
    }
    // hide modal on successful form submission
    // action: "turbo:submit-end->turbo-modal#submitEnd"
    submitEnd(e) {
      e.preventDefault();
    }
    // hide modal when clicking ESC
    // action: "keyup@window->turbo-modal#closeWithKeyboard"
    closeWithKeyboard(e) {
      if (e.code == "Escape") {
        this.hideModal();
      }
    }
    // hide modal when clicking outside of modal
    // action: "click@window->turbo-modal#closeBackground"
    closeBackground(e) {
      if (e && this.modalTarget.contains(e.target)) {
        return;
      }
      this.hideModal();
    }
  };
  __publicField(turbo_modal_controller_default, "targets", ["modal"]);

  // controllers/index.js
  application.register("hello", hello_controller_default);
  application.register("modal", modal_controller_default);
  application.register("recipe", recipe_controller_default);
  application.register("mealplan", meal_plan_controller_default);
  application.register("turbo-modal", turbo_modal_controller_default);

  // application.js
  var import_preline = __toESM(require_preline());
  start2();
})();
/*! Bundled license information:

preline/dist/preline.js:
  (*! For license information please see preline.js.LICENSE.txt *)
*/
//# sourceMappingURL=application.js.map
