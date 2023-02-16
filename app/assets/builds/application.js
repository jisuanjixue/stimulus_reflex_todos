 (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

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
      const extendedEvent2 = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent2.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent2);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left2, right2) => {
        const leftIndex = left2.index, rightIndex = right2.index;
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
    return value.replace(/(?:[_-])([a-z0-9])/g, (_3, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_3, char) => `-${char.toLowerCase()}`);
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
      const method2 = this.controller[this.methodName];
      if (typeof method2 == "function") {
        return method2;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter2 = actionDescriptorFilters[name];
          passes = passes && filter2({ name, value, event, element });
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
    constructor(element, selector3, delegate, details = {}) {
      this.selector = selector3;
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
  function zip(left2, right2) {
    const length = Math.max(left2.length, right2.length);
    return Array.from({ length }, (_3, index) => [left2[index], right2[index]]);
  }
  function tokensAreEqual(left2, right2) {
    return left2 && right2 && left2.index == right2.index && left2.content == right2.content;
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
          const selector3 = this.selector(outletName);
          const details = { outletName };
          if (selector3) {
            this.selectorObserverMap.set(outletName, new SelectorObserver(document.body, selector3, this, details));
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
    const shadowConstructor = extend(constructor);
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
  var extend = (() => {
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
      const a3 = function() {
        this.a.call(this);
      };
      const b3 = extendWithReflect(a3);
      b3.prototype.a = function() {
      };
      return new b3();
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
    constructor(logger2) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger2;
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
      const selector3 = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector3);
    }
    findAllTargets(targetName) {
      const selector3 = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector3);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector3 = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector3), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector3 = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector3).map((element) => this.deprecate(element, targetName));
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
      const selector3 = this.getSelectorForOutletName(outletName);
      if (selector3)
        return this.findElement(selector3, outletName);
    }
    findAllOutlets(outletName) {
      const selector3 = this.getSelectorForOutletName(outletName);
      return selector3 ? this.findAllElements(selector3, outletName) : [];
    }
    findElement(selector3, outletName) {
      const elements = this.scope.queryElements(selector3);
      return elements.filter((element) => this.matchesElement(element, selector3, outletName))[0];
    }
    findAllElements(selector3, outletName) {
      const elements = this.scope.queryElements(selector3);
      return elements.filter((element) => this.matchesElement(element, selector3, outletName));
    }
    matchesElement(element, selector3, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector3) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger2) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger2);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector3) {
      return this.element.matches(selector3) ? this.element : this.queryElements(selector3).find(this.containsElement);
    }
    findAllElements(selector3) {
      return [
        ...this.element.matches(selector3) ? [this.element] : [],
        ...this.queryElements(selector3).filter(this.containsElement)
      ];
    }
    queryElements(selector3) {
      return Array.from(this.element.querySelectorAll(selector3));
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
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c3) => [c3, c3]))), objectFromEntries("0123456789".split("").map((n3) => [n3, n3])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k3, v3]) => Object.assign(Object.assign({}, memo), { [k3]: v3 }), {});
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
    registerActionOption(name, filter2) {
      this.actionDescriptorFilters[name] = filter2;
    }
    load(head, ...rest) {
      const definitions2 = Array.isArray(head) ? head : [head, ...rest];
      definitions2.forEach((definition) => {
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
    const { key, name, reader: read2, writer: write2 } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read2(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write2(value));
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

  // ../../node_modules/hotkeys-js/dist/hotkeys.esm.js
  var isff = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase().indexOf("firefox") > 0 : false;
  function addEvent(object, event, method2, useCapture) {
    if (object.addEventListener) {
      object.addEventListener(event, method2, useCapture);
    } else if (object.attachEvent) {
      object.attachEvent("on".concat(event), function() {
        method2(window.event);
      });
    }
  }
  function getMods(modifier, key) {
    var mods = key.slice(0, key.length - 1);
    for (var i3 = 0; i3 < mods.length; i3++) {
      mods[i3] = modifier[mods[i3].toLowerCase()];
    }
    return mods;
  }
  function getKeys(key) {
    if (typeof key !== "string")
      key = "";
    key = key.replace(/\s/g, "");
    var keys = key.split(",");
    var index = keys.lastIndexOf("");
    for (; index >= 0; ) {
      keys[index - 1] += ",";
      keys.splice(index, 1);
      index = keys.lastIndexOf("");
    }
    return keys;
  }
  function compareArray(a1, a22) {
    var arr1 = a1.length >= a22.length ? a1 : a22;
    var arr2 = a1.length >= a22.length ? a22 : a1;
    var isIndex = true;
    for (var i3 = 0; i3 < arr1.length; i3++) {
      if (arr2.indexOf(arr1[i3]) === -1)
        isIndex = false;
    }
    return isIndex;
  }
  var _keyMap = {
    backspace: 8,
    "\u232B": 8,
    tab: 9,
    clear: 12,
    enter: 13,
    "\u21A9": 13,
    return: 13,
    esc: 27,
    escape: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    del: 46,
    delete: 46,
    ins: 45,
    insert: 45,
    home: 36,
    end: 35,
    pageup: 33,
    pagedown: 34,
    capslock: 20,
    num_0: 96,
    num_1: 97,
    num_2: 98,
    num_3: 99,
    num_4: 100,
    num_5: 101,
    num_6: 102,
    num_7: 103,
    num_8: 104,
    num_9: 105,
    num_multiply: 106,
    num_add: 107,
    num_enter: 108,
    num_subtract: 109,
    num_decimal: 110,
    num_divide: 111,
    "\u21EA": 20,
    ",": 188,
    ".": 190,
    "/": 191,
    "`": 192,
    "-": isff ? 173 : 189,
    "=": isff ? 61 : 187,
    ";": isff ? 59 : 186,
    "'": 222,
    "[": 219,
    "]": 221,
    "\\": 220
  };
  var _modifier = {
    // shiftKey
    "\u21E7": 16,
    shift: 16,
    // altKey
    "\u2325": 18,
    alt: 18,
    option: 18,
    // ctrlKey
    "\u2303": 17,
    ctrl: 17,
    control: 17,
    // metaKey
    "\u2318": 91,
    cmd: 91,
    command: 91
  };
  var modifierMap = {
    16: "shiftKey",
    18: "altKey",
    17: "ctrlKey",
    91: "metaKey",
    shiftKey: 16,
    ctrlKey: 17,
    altKey: 18,
    metaKey: 91
  };
  var _mods = {
    16: false,
    18: false,
    17: false,
    91: false
  };
  var _handlers = {};
  for (k3 = 1; k3 < 20; k3++) {
    _keyMap["f".concat(k3)] = 111 + k3;
  }
  var k3;
  var _downKeys = [];
  var winListendFocus = false;
  var _scope = "all";
  var elementHasBindEvent = [];
  var code = function code2(x3) {
    return _keyMap[x3.toLowerCase()] || _modifier[x3.toLowerCase()] || x3.toUpperCase().charCodeAt(0);
  };
  var getKey = function getKey2(x3) {
    return Object.keys(_keyMap).find(function(k3) {
      return _keyMap[k3] === x3;
    });
  };
  var getModifier = function getModifier2(x3) {
    return Object.keys(_modifier).find(function(k3) {
      return _modifier[k3] === x3;
    });
  };
  function setScope(scope) {
    _scope = scope || "all";
  }
  function getScope() {
    return _scope || "all";
  }
  function getPressedKeyCodes() {
    return _downKeys.slice(0);
  }
  function getPressedKeyString() {
    return _downKeys.map(function(c3) {
      return getKey(c3) || getModifier(c3) || String.fromCharCode(c3);
    });
  }
  function filter(event) {
    var target = event.target || event.srcElement;
    var tagName = target.tagName;
    var flag = true;
    if (target.isContentEditable || (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") && !target.readOnly) {
      flag = false;
    }
    return flag;
  }
  function isPressed(keyCode) {
    if (typeof keyCode === "string") {
      keyCode = code(keyCode);
    }
    return _downKeys.indexOf(keyCode) !== -1;
  }
  function deleteScope(scope, newScope) {
    var handlers;
    var i3;
    if (!scope)
      scope = getScope();
    for (var key in _handlers) {
      if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
        handlers = _handlers[key];
        for (i3 = 0; i3 < handlers.length; ) {
          if (handlers[i3].scope === scope)
            handlers.splice(i3, 1);
          else
            i3++;
        }
      }
    }
    if (getScope() === scope)
      setScope(newScope || "all");
  }
  function clearModifier(event) {
    var key = event.keyCode || event.which || event.charCode;
    var i3 = _downKeys.indexOf(key);
    if (i3 >= 0) {
      _downKeys.splice(i3, 1);
    }
    if (event.key && event.key.toLowerCase() === "meta") {
      _downKeys.splice(0, _downKeys.length);
    }
    if (key === 93 || key === 224)
      key = 91;
    if (key in _mods) {
      _mods[key] = false;
      for (var k3 in _modifier) {
        if (_modifier[k3] === key)
          hotkeys[k3] = false;
      }
    }
  }
  function unbind(keysInfo) {
    if (typeof keysInfo === "undefined") {
      Object.keys(_handlers).forEach(function(key) {
        return delete _handlers[key];
      });
    } else if (Array.isArray(keysInfo)) {
      keysInfo.forEach(function(info) {
        if (info.key)
          eachUnbind(info);
      });
    } else if (typeof keysInfo === "object") {
      if (keysInfo.key)
        eachUnbind(keysInfo);
    } else if (typeof keysInfo === "string") {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      var scope = args[0], method2 = args[1];
      if (typeof scope === "function") {
        method2 = scope;
        scope = "";
      }
      eachUnbind({
        key: keysInfo,
        scope,
        method: method2,
        splitKey: "+"
      });
    }
  }
  var eachUnbind = function eachUnbind2(_ref) {
    var key = _ref.key, scope = _ref.scope, method2 = _ref.method, _ref$splitKey = _ref.splitKey, splitKey = _ref$splitKey === void 0 ? "+" : _ref$splitKey;
    var multipleKeys = getKeys(key);
    multipleKeys.forEach(function(originKey) {
      var unbindKeys = originKey.split(splitKey);
      var len = unbindKeys.length;
      var lastKey = unbindKeys[len - 1];
      var keyCode = lastKey === "*" ? "*" : code(lastKey);
      if (!_handlers[keyCode])
        return;
      if (!scope)
        scope = getScope();
      var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
      _handlers[keyCode] = _handlers[keyCode].filter(function(record) {
        var isMatchingMethod = method2 ? record.method === method2 : true;
        return !(isMatchingMethod && record.scope === scope && compareArray(record.mods, mods));
      });
    });
  };
  function eventHandler(event, handler, scope, element) {
    if (handler.element !== element) {
      return;
    }
    var modifiersMatch;
    if (handler.scope === scope || handler.scope === "all") {
      modifiersMatch = handler.mods.length > 0;
      for (var y3 in _mods) {
        if (Object.prototype.hasOwnProperty.call(_mods, y3)) {
          if (!_mods[y3] && handler.mods.indexOf(+y3) > -1 || _mods[y3] && handler.mods.indexOf(+y3) === -1) {
            modifiersMatch = false;
          }
        }
      }
      if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === "*") {
        if (handler.method(event, handler) === false) {
          if (event.preventDefault)
            event.preventDefault();
          else
            event.returnValue = false;
          if (event.stopPropagation)
            event.stopPropagation();
          if (event.cancelBubble)
            event.cancelBubble = true;
        }
      }
    }
  }
  function dispatch(event, element) {
    var asterisk = _handlers["*"];
    var key = event.keyCode || event.which || event.charCode;
    if (!hotkeys.filter.call(this, event))
      return;
    if (key === 93 || key === 224)
      key = 91;
    if (_downKeys.indexOf(key) === -1 && key !== 229)
      _downKeys.push(key);
    ["ctrlKey", "altKey", "shiftKey", "metaKey"].forEach(function(keyName) {
      var keyNum = modifierMap[keyName];
      if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
        _downKeys.push(keyNum);
      } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
        _downKeys.splice(_downKeys.indexOf(keyNum), 1);
      } else if (keyName === "metaKey" && event[keyName] && _downKeys.length === 3) {
        if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
          _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
        }
      }
    });
    if (key in _mods) {
      _mods[key] = true;
      for (var k3 in _modifier) {
        if (_modifier[k3] === key)
          hotkeys[k3] = true;
      }
      if (!asterisk)
        return;
    }
    for (var e in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, e)) {
        _mods[e] = event[modifierMap[e]];
      }
    }
    if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState("AltGraph")) {
      if (_downKeys.indexOf(17) === -1) {
        _downKeys.push(17);
      }
      if (_downKeys.indexOf(18) === -1) {
        _downKeys.push(18);
      }
      _mods[17] = true;
      _mods[18] = true;
    }
    var scope = getScope();
    if (asterisk) {
      for (var i3 = 0; i3 < asterisk.length; i3++) {
        if (asterisk[i3].scope === scope && (event.type === "keydown" && asterisk[i3].keydown || event.type === "keyup" && asterisk[i3].keyup)) {
          eventHandler(event, asterisk[i3], scope, element);
        }
      }
    }
    if (!(key in _handlers))
      return;
    for (var _i = 0; _i < _handlers[key].length; _i++) {
      if (event.type === "keydown" && _handlers[key][_i].keydown || event.type === "keyup" && _handlers[key][_i].keyup) {
        if (_handlers[key][_i].key) {
          var record = _handlers[key][_i];
          var splitKey = record.splitKey;
          var keyShortcut = record.key.split(splitKey);
          var _downKeysCurrent = [];
          for (var a3 = 0; a3 < keyShortcut.length; a3++) {
            _downKeysCurrent.push(code(keyShortcut[a3]));
          }
          if (_downKeysCurrent.sort().join("") === _downKeys.sort().join("")) {
            eventHandler(event, record, scope, element);
          }
        }
      }
    }
  }
  function isElementBind(element) {
    return elementHasBindEvent.indexOf(element) > -1;
  }
  function hotkeys(key, option, method2) {
    _downKeys = [];
    var keys = getKeys(key);
    var mods = [];
    var scope = "all";
    var element = document;
    var i3 = 0;
    var keyup = false;
    var keydown = true;
    var splitKey = "+";
    var capture = false;
    if (method2 === void 0 && typeof option === "function") {
      method2 = option;
    }
    if (Object.prototype.toString.call(option) === "[object Object]") {
      if (option.scope)
        scope = option.scope;
      if (option.element)
        element = option.element;
      if (option.keyup)
        keyup = option.keyup;
      if (option.keydown !== void 0)
        keydown = option.keydown;
      if (option.capture !== void 0)
        capture = option.capture;
      if (typeof option.splitKey === "string")
        splitKey = option.splitKey;
    }
    if (typeof option === "string")
      scope = option;
    for (; i3 < keys.length; i3++) {
      key = keys[i3].split(splitKey);
      mods = [];
      if (key.length > 1)
        mods = getMods(_modifier, key);
      key = key[key.length - 1];
      key = key === "*" ? "*" : code(key);
      if (!(key in _handlers))
        _handlers[key] = [];
      _handlers[key].push({
        keyup,
        keydown,
        scope,
        mods,
        shortcut: keys[i3],
        method: method2,
        key: keys[i3],
        splitKey,
        element
      });
    }
    if (typeof element !== "undefined" && !isElementBind(element) && window) {
      elementHasBindEvent.push(element);
      addEvent(element, "keydown", function(e) {
        dispatch(e, element);
      }, capture);
      if (!winListendFocus) {
        winListendFocus = true;
        addEvent(window, "focus", function() {
          _downKeys = [];
        }, capture);
      }
      addEvent(element, "keyup", function(e) {
        dispatch(e, element);
        clearModifier(e);
      }, capture);
    }
  }
  function trigger(shortcut) {
    var scope = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "all";
    Object.keys(_handlers).forEach(function(key) {
      var dataList = _handlers[key].filter(function(item) {
        return item.scope === scope && item.shortcut === shortcut;
      });
      dataList.forEach(function(data) {
        if (data && data.method) {
          data.method();
        }
      });
    });
  }
  var _api = {
    getPressedKeyString,
    setScope,
    getScope,
    deleteScope,
    getPressedKeyCodes,
    isPressed,
    filter,
    trigger,
    unbind,
    keyMap: _keyMap,
    modifier: _modifier,
    modifierMap
  };
  for (a3 in _api) {
    if (Object.prototype.hasOwnProperty.call(_api, a3)) {
      hotkeys[a3] = _api[a3];
    }
  }
  var a3;
  if (typeof window !== "undefined") {
    _hotkeys = window.hotkeys;
    hotkeys.noConflict = function(deep) {
      if (deep && window.hotkeys === hotkeys) {
        window.hotkeys = _hotkeys;
      }
      return hotkeys;
    };
    window.hotkeys = hotkeys;
  }
  var _hotkeys;

  // ../../node_modules/stimulus-use/dist/index.js
  var method = (controller, methodName) => {
    const method2 = controller[methodName];
    if (typeof method2 == "function") {
      return method2;
    } else {
      return (...args) => {
      };
    }
  };
  var composeEventName = (name, controller, eventPrefix) => {
    let composedName = name;
    if (eventPrefix === true) {
      composedName = `${controller.identifier}:${name}`;
    } else if (typeof eventPrefix === "string") {
      composedName = `${eventPrefix}:${name}`;
    }
    return composedName;
  };
  var extendedEvent = (type, event, detail) => {
    const { bubbles, cancelable, composed } = event || { bubbles: true, cancelable: true, composed: true };
    if (event) {
      Object.assign(detail, { originalEvent: event });
    }
    const customEvent = new CustomEvent(type, {
      bubbles,
      cancelable,
      composed,
      detail
    });
    return customEvent;
  };
  var defaultOptions$8 = {
    dispatchEvent: true,
    eventPrefix: true,
    visibleAttribute: "isVisible"
  };
  var useIntersection = (composableController, options = {}) => {
    const controller = composableController;
    const { dispatchEvent, eventPrefix, visibleAttribute } = Object.assign({}, defaultOptions$8, options);
    const targetElement = (options === null || options === void 0 ? void 0 : options.element) || controller.element;
    if (!controller.intersectionElements)
      controller.intersectionElements = [];
    controller.intersectionElements.push(targetElement);
    const callback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        dispatchAppear(entry);
      } else if (targetElement.hasAttribute(visibleAttribute)) {
        dispatchDisappear(entry);
      }
    };
    const dispatchAppear = (entry) => {
      targetElement.setAttribute(visibleAttribute, "true");
      method(controller, "appear").call(controller, entry);
      if (dispatchEvent) {
        const eventName = composeEventName("appear", controller, eventPrefix);
        const appearEvent = extendedEvent(eventName, null, { controller, entry });
        targetElement.dispatchEvent(appearEvent);
      }
    };
    const dispatchDisappear = (entry) => {
      targetElement.removeAttribute(visibleAttribute);
      method(controller, "disappear").call(controller, entry);
      if (dispatchEvent) {
        const eventName = composeEventName("disappear", controller, eventPrefix);
        const disappearEvent = extendedEvent(eventName, null, { controller, entry });
        targetElement.dispatchEvent(disappearEvent);
      }
    };
    const controllerDisconnect = controller.disconnect.bind(controller);
    const observer = new IntersectionObserver(callback, options);
    const observe = () => {
      observer.observe(targetElement);
    };
    const unobserve = () => {
      observer.unobserve(targetElement);
    };
    const noneVisible = () => {
      return controller.intersectionElements.filter((element) => element.hasAttribute(visibleAttribute)).length === 0;
    };
    const oneVisible = () => {
      return controller.intersectionElements.filter((element) => element.hasAttribute(visibleAttribute)).length === 1;
    };
    const atLeastOneVisible = () => {
      return controller.intersectionElements.some((element) => element.hasAttribute(visibleAttribute));
    };
    const allVisible = () => {
      return controller.intersectionElements.every((element) => element.hasAttribute(visibleAttribute));
    };
    const isVisible = allVisible;
    Object.assign(controller, {
      isVisible,
      noneVisible,
      oneVisible,
      atLeastOneVisible,
      allVisible,
      disconnect() {
        unobserve();
        controllerDisconnect();
      }
    });
    observe();
    return [observe, unobserve];
  };
  var IntersectionComposableController = class extends Controller {
  };
  var IntersectionController = class extends IntersectionComposableController {
    constructor(context) {
      super(context);
      requestAnimationFrame(() => {
        const [observe, unobserve] = useIntersection(this, this.options);
        Object.assign(this, { observe, unobserve });
      });
    }
  };
  var useWindowResize = (composableController) => {
    const controller = composableController;
    const callback = (event) => {
      const { innerWidth, innerHeight } = window;
      const payload = {
        height: innerHeight || Infinity,
        width: innerWidth || Infinity,
        event
      };
      method(controller, "windowResize").call(controller, payload);
    };
    const controllerDisconnect = controller.disconnect.bind(controller);
    const observe = () => {
      window.addEventListener("resize", callback);
      callback();
    };
    const unobserve = () => {
      window.removeEventListener("resize", callback);
    };
    Object.assign(controller, {
      disconnect() {
        unobserve();
        controllerDisconnect();
      }
    });
    observe();
    return [observe, unobserve];
  };
  var DebounceController = class extends Controller {
  };
  DebounceController.debounces = [];
  var defaultWait$1 = 200;
  var debounce = (fn2, wait = defaultWait$1) => {
    let timeoutId = null;
    return function() {
      const args = Array.from(arguments);
      const context = this;
      const params = args.map((arg) => arg.params);
      const callback = () => {
        args.forEach((arg, index) => arg.params = params[index]);
        return fn2.apply(context, args);
      };
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(callback, wait);
    };
  };
  var useDebounce = (composableController, options) => {
    const controller = composableController;
    const constructor = controller.constructor;
    constructor.debounces.forEach((func) => {
      if (typeof func === "string") {
        controller[func] = debounce(controller[func], options === null || options === void 0 ? void 0 : options.wait);
      }
      if (typeof func === "object") {
        const { name, wait } = func;
        if (!name)
          return;
        controller[name] = debounce(controller[name], wait || (options === null || options === void 0 ? void 0 : options.wait));
      }
    });
  };
  var ThrottleController = class extends Controller {
  };
  ThrottleController.throttles = [];
  console.log(`Local Stimulus Use`);

  // stimulus_ns:/Users/xiaobo/Desktop/未命名文件夹 3/stimulus_reflex_todos/app/javascript/controllers/controllers
  var definitions = [];

  // controllers/application.js
  var application = Application.start();
  application.warnings = true;
  application.debug = false;
  window.Stimulus = application;
  application.load(definitions);
  document.documentElement.setAttribute(
    "data-theme",
    window.localStorage.getItem("theme")
  );

  // controllers/application_controller.js
  var application_controller_exports = {};
  __export(application_controller_exports, {
    default: () => application_controller_default
  });

  // ../../node_modules/morphdom/dist/morphdom-esm.js
  var DOCUMENT_FRAGMENT_NODE = 11;
  function morphAttrs(fromNode, toNode) {
    var toNodeAttrs = toNode.attributes;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    for (var i3 = toNodeAttrs.length - 1; i3 >= 0; i3--) {
      attr = toNodeAttrs[i3];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      attrValue = attr.value;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        if (fromValue !== attrValue) {
          if (attr.prefix === "xmlns") {
            attrName = attr.name;
          }
          fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
        }
      } else {
        fromValue = fromNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          fromNode.setAttribute(attrName, attrValue);
        }
      }
    }
    var fromNodeAttrs = fromNode.attributes;
    for (var d3 = fromNodeAttrs.length - 1; d3 >= 0; d3--) {
      attr = fromNodeAttrs[d3];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          fromNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!toNode.hasAttribute(attrName)) {
          fromNode.removeAttribute(attrName);
        }
      }
    }
  }
  var range;
  var NS_XHTML = "http://www.w3.org/1999/xhtml";
  var doc = typeof document === "undefined" ? void 0 : document;
  var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
  var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
  function createFragmentFromTemplate(str) {
    var template = doc.createElement("template");
    template.innerHTML = str;
    return template.content.childNodes[0];
  }
  function createFragmentFromRange(str) {
    if (!range) {
      range = doc.createRange();
      range.selectNode(doc.body);
    }
    var fragment = range.createContextualFragment(str);
    return fragment.childNodes[0];
  }
  function createFragmentFromWrap(str) {
    var fragment = doc.createElement("body");
    fragment.innerHTML = str;
    return fragment.childNodes[0];
  }
  function toElement(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT) {
      return createFragmentFromTemplate(str);
    } else if (HAS_RANGE_SUPPORT) {
      return createFragmentFromRange(str);
    }
    return createFragmentFromWrap(str);
  }
  function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;
    if (fromNodeName === toNodeName) {
      return true;
    }
    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
      return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
      return toNodeName === fromNodeName.toUpperCase();
    } else {
      return false;
    }
  }
  function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name) : doc.createElementNS(namespaceURI, name);
  }
  function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
      var nextChild = curChild.nextSibling;
      toEl.appendChild(curChild);
      curChild = nextChild;
    }
    return toEl;
  }
  function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
      fromEl[name] = toEl[name];
      if (fromEl[name]) {
        fromEl.setAttribute(name, "");
      } else {
        fromEl.removeAttribute(name);
      }
    }
  }
  var specialElHandlers = {
    OPTION: function(fromEl, toEl) {
      var parentNode = fromEl.parentNode;
      if (parentNode) {
        var parentName = parentNode.nodeName.toUpperCase();
        if (parentName === "OPTGROUP") {
          parentNode = parentNode.parentNode;
          parentName = parentNode && parentNode.nodeName.toUpperCase();
        }
        if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
          if (fromEl.hasAttribute("selected") && !toEl.selected) {
            fromEl.setAttribute("selected", "selected");
            fromEl.removeAttribute("selected");
          }
          parentNode.selectedIndex = -1;
        }
      }
      syncBooleanAttrProp(fromEl, toEl, "selected");
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
      syncBooleanAttrProp(fromEl, toEl, "checked");
      syncBooleanAttrProp(fromEl, toEl, "disabled");
      if (fromEl.value !== toEl.value) {
        fromEl.value = toEl.value;
      }
      if (!toEl.hasAttribute("value")) {
        fromEl.removeAttribute("value");
      }
    },
    TEXTAREA: function(fromEl, toEl) {
      var newValue = toEl.value;
      if (fromEl.value !== newValue) {
        fromEl.value = newValue;
      }
      var firstChild = fromEl.firstChild;
      if (firstChild) {
        var oldValue = firstChild.nodeValue;
        if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
          return;
        }
        firstChild.nodeValue = newValue;
      }
    },
    SELECT: function(fromEl, toEl) {
      if (!toEl.hasAttribute("multiple")) {
        var selectedIndex = -1;
        var i3 = 0;
        var curChild = fromEl.firstChild;
        var optgroup;
        var nodeName;
        while (curChild) {
          nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
          if (nodeName === "OPTGROUP") {
            optgroup = curChild;
            curChild = optgroup.firstChild;
          } else {
            if (nodeName === "OPTION") {
              if (curChild.hasAttribute("selected")) {
                selectedIndex = i3;
                break;
              }
              i3++;
            }
            curChild = curChild.nextSibling;
            if (!curChild && optgroup) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          }
        }
        fromEl.selectedIndex = selectedIndex;
      }
    }
  };
  var ELEMENT_NODE = 1;
  var DOCUMENT_FRAGMENT_NODE$1 = 11;
  var TEXT_NODE = 3;
  var COMMENT_NODE = 8;
  function noop() {
  }
  function defaultGetNodeKey(node) {
    if (node) {
      return node.getAttribute && node.getAttribute("id") || node.id;
    }
  }
  function morphdomFactory(morphAttrs3) {
    return function morphdom3(fromNode, toNode, options) {
      if (!options) {
        options = {};
      }
      if (typeof toNode === "string") {
        if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
          var toNodeHtml = toNode;
          toNode = doc.createElement("html");
          toNode.innerHTML = toNodeHtml;
        } else {
          toNode = toElement(toNode);
        }
      }
      var getNodeKey = options.getNodeKey || defaultGetNodeKey;
      var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
      var onNodeAdded = options.onNodeAdded || noop;
      var onBeforeElUpdated = options.onBeforeElUpdated || noop;
      var onElUpdated = options.onElUpdated || noop;
      var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
      var onNodeDiscarded = options.onNodeDiscarded || noop;
      var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
      var childrenOnly = options.childrenOnly === true;
      var fromNodesLookup = /* @__PURE__ */ Object.create(null);
      var keyedRemovalList = [];
      function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
      }
      function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (node.nodeType === ELEMENT_NODE) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = void 0;
            if (skipKeyedNodes && (key = getNodeKey(curChild))) {
              addKeyedRemoval(key);
            } else {
              onNodeDiscarded(curChild);
              if (curChild.firstChild) {
                walkDiscardedChildNodes(curChild, skipKeyedNodes);
              }
            }
            curChild = curChild.nextSibling;
          }
        }
      }
      function removeNode(node, parentNode, skipKeyedNodes) {
        if (onBeforeNodeDiscarded(node) === false) {
          return;
        }
        if (parentNode) {
          parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
      }
      function indexTree(node) {
        if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = getNodeKey(curChild);
            if (key) {
              fromNodesLookup[key] = curChild;
            }
            indexTree(curChild);
            curChild = curChild.nextSibling;
          }
        }
      }
      indexTree(fromNode);
      function handleNodeAdded(el) {
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
          var nextSibling = curChild.nextSibling;
          var key = getNodeKey(curChild);
          if (key) {
            var unmatchedFromEl = fromNodesLookup[key];
            if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
              curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
              morphEl(unmatchedFromEl, curChild);
            } else {
              handleNodeAdded(curChild);
            }
          } else {
            handleNodeAdded(curChild);
          }
          curChild = nextSibling;
        }
      }
      function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        while (curFromNodeChild) {
          var fromNextSibling = curFromNodeChild.nextSibling;
          if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
      }
      function morphEl(fromEl, toEl, childrenOnly2) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
          delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly2) {
          if (onBeforeElUpdated(fromEl, toEl) === false) {
            return;
          }
          morphAttrs3(fromEl, toEl);
          onElUpdated(fromEl);
          if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
            return;
          }
        }
        if (fromEl.nodeName !== "TEXTAREA") {
          morphChildren(fromEl, toEl);
        } else {
          specialElHandlers.TEXTAREA(fromEl, toEl);
        }
      }
      function morphChildren(fromEl, toEl) {
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling;
        var toNextSibling;
        var matchingFromEl;
        outer:
          while (curToNodeChild) {
            toNextSibling = curToNodeChild.nextSibling;
            curToNodeKey = getNodeKey(curToNodeChild);
            while (curFromNodeChild) {
              fromNextSibling = curFromNodeChild.nextSibling;
              if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
                continue outer;
              }
              curFromNodeKey = getNodeKey(curFromNodeChild);
              var curFromNodeType = curFromNodeChild.nodeType;
              var isCompatible = void 0;
              if (curFromNodeType === curToNodeChild.nodeType) {
                if (curFromNodeType === ELEMENT_NODE) {
                  if (curToNodeKey) {
                    if (curToNodeKey !== curFromNodeKey) {
                      if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                        if (fromNextSibling === matchingFromEl) {
                          isCompatible = false;
                        } else {
                          fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                          if (curFromNodeKey) {
                            addKeyedRemoval(curFromNodeKey);
                          } else {
                            removeNode(
                              curFromNodeChild,
                              fromEl,
                              true
                              /* skip keyed nodes */
                            );
                          }
                          curFromNodeChild = matchingFromEl;
                        }
                      } else {
                        isCompatible = false;
                      }
                    }
                  } else if (curFromNodeKey) {
                    isCompatible = false;
                  }
                  isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                  if (isCompatible) {
                    morphEl(curFromNodeChild, curToNodeChild);
                  }
                } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                  isCompatible = true;
                  if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                    curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                  }
                }
              }
              if (isCompatible) {
                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
                continue outer;
              }
              if (curFromNodeKey) {
                addKeyedRemoval(curFromNodeKey);
              } else {
                removeNode(
                  curFromNodeChild,
                  fromEl,
                  true
                  /* skip keyed nodes */
                );
              }
              curFromNodeChild = fromNextSibling;
            }
            if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
              fromEl.appendChild(matchingFromEl);
              morphEl(matchingFromEl, curToNodeChild);
            } else {
              var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
              if (onBeforeNodeAddedResult !== false) {
                if (onBeforeNodeAddedResult) {
                  curToNodeChild = onBeforeNodeAddedResult;
                }
                if (curToNodeChild.actualize) {
                  curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
                }
                fromEl.appendChild(curToNodeChild);
                handleNodeAdded(curToNodeChild);
              }
            }
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
          }
        cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers[fromEl.nodeName];
        if (specialElHandler) {
          specialElHandler(fromEl, toEl);
        }
      }
      var morphedNode = fromNode;
      var morphedNodeType = morphedNode.nodeType;
      var toNodeType = toNode.nodeType;
      if (!childrenOnly) {
        if (morphedNodeType === ELEMENT_NODE) {
          if (toNodeType === ELEMENT_NODE) {
            if (!compareNodeNames(fromNode, toNode)) {
              onNodeDiscarded(fromNode);
              morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
            }
          } else {
            morphedNode = toNode;
          }
        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
          if (toNodeType === morphedNodeType) {
            if (morphedNode.nodeValue !== toNode.nodeValue) {
              morphedNode.nodeValue = toNode.nodeValue;
            }
            return morphedNode;
          } else {
            morphedNode = toNode;
          }
        }
      }
      if (morphedNode === toNode) {
        onNodeDiscarded(fromNode);
      } else {
        if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
          return;
        }
        morphEl(morphedNode, toNode, childrenOnly);
        if (keyedRemovalList) {
          for (var i3 = 0, len = keyedRemovalList.length; i3 < len; i3++) {
            var elToRemove = fromNodesLookup[keyedRemovalList[i3]];
            if (elToRemove) {
              removeNode(elToRemove, elToRemove.parentNode, false);
            }
          }
        }
      }
      if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        if (morphedNode.actualize) {
          morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
        }
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
      }
      return morphedNode;
    };
  }
  var morphdom = morphdomFactory(morphAttrs);
  var morphdom_esm_default = morphdom;

  // ../../node_modules/cable_ready/dist/cable_ready.min.js
  var t = "5.0.0-pre9";
  var n = { INPUT: true, TEXTAREA: true, SELECT: true };
  var o = { INPUT: true, TEXTAREA: true, OPTION: true };
  var r = { "datetime-local": true, "select-multiple": true, "select-one": true, color: true, date: true, datetime: true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, textarea: true, time: true, url: true, week: true };
  var s;
  var a = { get element() {
    return s;
  }, set(e) {
    s = e;
  } };
  var i = (e) => n[e.tagName] && r[e.type];
  var l = (e) => {
    const t2 = (e && e.nodeType === Node.ELEMENT_NODE ? e : document.querySelector(e)) || a.element;
    t2 && t2.focus && t2.focus();
  };
  var c = (e, t2, n3 = {}) => {
    const o3 = new CustomEvent(t2, { bubbles: true, cancelable: true, detail: n3 });
    e.dispatchEvent(o3), window.jQuery && window.jQuery(e).trigger(t2, n3);
  };
  var u = (e) => document.evaluate(e, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  var d = (e) => Array(e).flat();
  var m = (e, t2) => {
    Array.from(e.selectAll ? e.element : [e.element]).forEach(t2);
  };
  var h = (e) => e.split("").map((e2, t2) => e2.toUpperCase() === e2 ? `${0 !== t2 ? "-" : ""}${e2.toLowerCase()}` : e2).join("");
  var p = (e, t2) => !e.cancel && (e.delay ? setTimeout(t2, e.delay) : t2(), true);
  var f = (e, t2) => c(e, `cable-ready:before-${h(t2.operation)}`, t2);
  var b = (e, t2) => c(e, `cable-ready:after-${h(t2.operation)}`, t2);
  function y(e, t2) {
    let n3;
    return (...o3) => {
      clearTimeout(n3), n3 = setTimeout(() => e.apply(this, o3), t2);
    };
  }
  function g(e) {
    if (!e.ok)
      throw Error(e.statusText);
    return e;
  }
  async function w(e, t2) {
    try {
      const n3 = await fetch(e, { headers: { "X-REQUESTED-WITH": "XmlHttpRequest", ...t2 } });
      if (null == n3)
        return;
      return g(n3), n3;
    } catch (t3) {
      console.error(`Could not fetch ${e}`);
    }
  }
  var E = Object.freeze({ __proto__: null, isTextInput: i, assignFocus: l, dispatch: c, xpathToElement: u, getClassNames: d, processElements: m, operate: p, before: f, after: b, debounce: y, handleErrors: g, graciouslyFetch: w, kebabize: h });
  var v = (e) => (t2, n3) => !x.map((o3) => "function" != typeof o3 || o3(e, t2, n3)).includes(false);
  var T = (e) => (t2) => {
    M.forEach((n3) => {
      "function" == typeof n3 && n3(e, t2);
    });
  };
  var A = (e, t2, n3) => !(!o[t2.tagName] && t2.isEqualNode(n3));
  var S = (e, t2, n3) => t2 !== a.element || !t2.isContentEditable;
  var C = (e, t2, n3) => {
    const { permanentAttributeName: o3 } = e;
    if (!o3)
      return true;
    const r2 = t2.closest(`[${o3}]`);
    if (!r2 && t2 === a.element && i(t2)) {
      const e2 = { value: true };
      return Array.from(n3.attributes).forEach((n4) => {
        e2[n4.name] || t2.setAttribute(n4.name, n4.value);
      }), false;
    }
    return !r2;
  };
  var x = [A, C, S];
  var M = [];
  var O = Object.freeze({ __proto__: null, shouldMorphCallbacks: x, didMorphCallbacks: M, shouldMorph: v, didMorph: T, verifyNotMutable: A, verifyNotContentEditable: S, verifyNotPermanent: C });
  var k = { append: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { html: n3, focusSelector: o3 } = e;
        t2.insertAdjacentHTML("beforeend", n3 || ""), l(o3);
      }), b(t2, e);
    });
  }, graft: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { parent: n3, focusSelector: o3 } = e, r2 = document.querySelector(n3);
        r2 && (r2.appendChild(t2), l(o3));
      }), b(t2, e);
    });
  }, innerHtml: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { html: n3, focusSelector: o3 } = e;
        t2.innerHTML = n3 || "", l(o3);
      }), b(t2, e);
    });
  }, insertAdjacentHtml: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { html: n3, position: o3, focusSelector: r2 } = e;
        t2.insertAdjacentHTML(o3 || "beforeend", n3 || ""), l(r2);
      }), b(t2, e);
    });
  }, insertAdjacentText: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { text: n3, position: o3, focusSelector: r2 } = e;
        t2.insertAdjacentText(o3 || "beforeend", n3 || ""), l(r2);
      }), b(t2, e);
    });
  }, morph: (t2) => {
    m(t2, (n3) => {
      const { html: o3 } = t2, r2 = document.createElement("template");
      r2.innerHTML = String(o3).trim(), t2.content = r2.content;
      const s3 = n3.parentElement, a3 = Array.from(s3.children).indexOf(n3);
      f(n3, t2), p(t2, () => {
        const { childrenOnly: o4, focusSelector: s4 } = t2;
        morphdom_esm_default(n3, o4 ? r2.content : r2.innerHTML, { childrenOnly: !!o4, onBeforeElUpdated: v(t2), onElUpdated: T(t2) }), l(s4);
      }), b(s3.children[a3], t2);
    });
  }, outerHtml: (e) => {
    m(e, (t2) => {
      const n3 = t2.parentElement, o3 = Array.from(n3.children).indexOf(t2);
      f(t2, e), p(e, () => {
        const { html: n4, focusSelector: o4 } = e;
        t2.outerHTML = n4 || "", l(o4);
      }), b(n3.children[o3], e);
    });
  }, prepend: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { html: n3, focusSelector: o3 } = e;
        t2.insertAdjacentHTML("afterbegin", n3 || ""), l(o3);
      }), b(t2, e);
    });
  }, remove: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { focusSelector: n3 } = e;
        t2.remove(), l(n3);
      }), b(document, e);
    });
  }, replace: (e) => {
    m(e, (t2) => {
      const n3 = t2.parentElement, o3 = Array.from(n3.children).indexOf(t2);
      f(t2, e), p(e, () => {
        const { html: n4, focusSelector: o4 } = e;
        t2.outerHTML = n4 || "", l(o4);
      }), b(n3.children[o3], e);
    });
  }, textContent: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { text: n3, focusSelector: o3 } = e;
        t2.textContent = null != n3 ? n3 : "", l(o3);
      }), b(t2, e);
    });
  }, addCssClass: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3 } = e;
        t2.classList.add(...d(n3 || ""));
      }), b(t2, e);
    });
  }, removeAttribute: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3 } = e;
        t2.removeAttribute(n3);
      }), b(t2, e);
    });
  }, removeCssClass: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3 } = e;
        t2.classList.remove(...d(n3));
      }), b(t2, e);
    });
  }, setAttribute: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3, value: o3 } = e;
        t2.setAttribute(n3, o3 || "");
      }), b(t2, e);
    });
  }, setDatasetProperty: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3, value: o3 } = e;
        t2.dataset[n3] = o3 || "";
      }), b(t2, e);
    });
  }, setProperty: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3, value: o3 } = e;
        n3 in t2 && (t2[n3] = o3 || "");
      }), b(t2, e);
    });
  }, setStyle: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3, value: o3 } = e;
        t2.style[n3] = o3 || "";
      }), b(t2, e);
    });
  }, setStyles: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { styles: n3 } = e;
        for (let [e2, o3] of Object.entries(n3))
          t2.style[e2] = o3 || "";
      }), b(t2, e);
    });
  }, setValue: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { value: n3 } = e;
        t2.value = n3 || "";
      }), b(t2, e);
    });
  }, dispatchEvent: (e) => {
    m(e, (t2) => {
      f(t2, e), p(e, () => {
        const { name: n3, detail: o3 } = e;
        c(t2, n3, o3);
      }), b(t2, e);
    });
  }, setMeta: (e) => {
    f(document, e), p(e, () => {
      const { name: t2, content: n3 } = e;
      let o3 = document.head.querySelector(`meta[name='${t2}']`);
      o3 || (o3 = document.createElement("meta"), o3.name = t2, document.head.appendChild(o3)), o3.content = n3;
    }), b(document, e);
  }, clearStorage: (e) => {
    f(document, e), p(e, () => {
      const { type: t2 } = e;
      ("session" === t2 ? sessionStorage : localStorage).clear();
    }), b(document, e);
  }, go: (e) => {
    f(window, e), p(e, () => {
      const { delta: t2 } = e;
      history.go(t2);
    }), b(window, e);
  }, pushState: (e) => {
    f(window, e), p(e, () => {
      const { state: t2, title: n3, url: o3 } = e;
      history.pushState(t2 || {}, n3 || "", o3);
    }), b(window, e);
  }, redirectTo: (e) => {
    f(window, e), p(e, () => {
      let { url: t2, action: n3 } = e;
      n3 = n3 || "advance", window.Turbo && window.Turbo.visit(t2, { action: n3 }), window.Turbolinks && window.Turbolinks.visit(t2, { action: n3 }), window.Turbo || window.Turbolinks || (window.location.href = t2);
    }), b(window, e);
  }, reload: (e) => {
    f(window, e), p(e, () => {
      window.location.reload();
    }), b(window, e);
  }, removeStorageItem: (e) => {
    f(document, e), p(e, () => {
      const { key: t2, type: n3 } = e;
      ("session" === n3 ? sessionStorage : localStorage).removeItem(t2);
    }), b(document, e);
  }, replaceState: (e) => {
    f(window, e), p(e, () => {
      const { state: t2, title: n3, url: o3 } = e;
      history.replaceState(t2 || {}, n3 || "", o3);
    }), b(window, e);
  }, scrollIntoView: (e) => {
    const { element: t2 } = e;
    f(t2, e), p(e, () => {
      t2.scrollIntoView(e);
    }), b(t2, e);
  }, setCookie: (e) => {
    f(document, e), p(e, () => {
      const { cookie: t2 } = e;
      document.cookie = t2 || "";
    }), b(document, e);
  }, setFocus: (e) => {
    const { element: t2 } = e;
    f(t2, e), p(e, () => {
      l(t2);
    }), b(t2, e);
  }, setStorageItem: (e) => {
    f(document, e), p(e, () => {
      const { key: t2, value: n3, type: o3 } = e;
      ("session" === o3 ? sessionStorage : localStorage).setItem(t2, n3 || "");
    }), b(document, e);
  }, consoleLog: (e) => {
    f(document, e), p(e, () => {
      const { message: t2, level: n3 } = e;
      n3 && ["warn", "info", "error"].includes(n3) ? console[n3](t2 || "") : console.log(t2 || "");
    }), b(document, e);
  }, consoleTable: (e) => {
    f(document, e), p(e, () => {
      const { data: t2, columns: n3 } = e;
      console.table(t2, n3 || []);
    }), b(document, e);
  }, notification: (e) => {
    f(document, e), p(e, () => {
      const { title: t2, options: n3 } = e;
      Notification.requestPermission().then((o3) => {
        e.permission = o3, "granted" === o3 && new Notification(t2 || "", n3);
      });
    }), b(document, e);
  } };
  var L = k;
  var R = (e) => {
    L = { ...L, ...e };
  };
  var P = { get all() {
    return L;
  } };
  var q = (e, t2 = { emitMissingElementWarnings: true }) => {
    const n3 = {};
    e.forEach((e2) => {
      e2.batch && (n3[e2.batch] = n3[e2.batch] ? ++n3[e2.batch] : 1);
    }), e.forEach((e2) => {
      const o3 = e2.operation;
      try {
        if (e2.selector ? e2.element = e2.xpath ? u(e2.selector) : document[e2.selectAll ? "querySelectorAll" : "querySelector"](e2.selector) : e2.element = document, e2.element || t2.emitMissingElementWarnings) {
          a.set(document.activeElement);
          const t3 = P.all[o3];
          t3 ? (t3(e2), e2.batch && 0 == --n3[e2.batch] && c(document, "cable-ready:batch-complete", { batch: e2.batch })) : console.error(`CableReady couldn't find the "${o3}" operation. Make sure you use the camelized form when calling an operation method.`);
        }
      } catch (t3) {
        e2.element ? (console.error(`CableReady detected an error in ${o3 || "operation"}: ${t3.message}. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`), console.error(t3)) : console.warn(`CableReady ${o3 || "operation"} failed due to missing DOM element for selector: '${e2.selector}'`);
      }
    });
  };
  var H;
  var N = [25, 50, 75, 100, 200, 250, 500, 800, 1e3, 2e3];
  var I = async (e = 0) => {
    if (H)
      return H;
    if (e >= N.length)
      throw new Error("Couldn't obtain a Action Cable consumer within 5s");
    var t2;
    return await (t2 = N[e], new Promise((e2) => setTimeout(e2, t2))), await I(e + 1);
  };
  var U = { setConsumer(e) {
    H = e;
  }, get consumer() {
    return H;
  }, getConsumer: async () => await I() };
  var $ = class extends HTMLElement {
    disconnectedCallback() {
      this.channel && this.channel.unsubscribe();
    }
    createSubscription(e, t2, n3) {
      this.channel = e.subscriptions.create({ channel: t2, identifier: this.identifier }, { received: n3 });
    }
    get preview() {
      return document.documentElement.hasAttribute("data-turbolinks-preview") || document.documentElement.hasAttribute("data-turbo-preview");
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
  };
  var _ = class extends $ {
    async connectedCallback() {
      if (this.preview)
        return;
      const e = await U.getConsumer();
      e ? this.createSubscription(e, "CableReady::Stream", this.performOperations) : console.error("The `stream_from` helper cannot connect without an ActionCable consumer.\nPlease run `rails generate cable_ready:helpers` to fix this.");
    }
    performOperations(e) {
      e.cableReady && q(e.operations);
    }
  };
  var j = class extends $ {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = "\n<style>\n  :host {\n    display: block;\n  }\n</style>\n<slot></slot>\n";
    }
    async connectedCallback() {
      if (this.preview)
        return;
      this.update = y(this.update.bind(this), this.debounce);
      const e = await U.getConsumer();
      e ? this.createSubscription(e, "CableReady::Stream", this.update) : console.error("The `updates-for` helper cannot connect without an ActionCable consumer.\nPlease run `rails generate cable_ready:helpers` to fix this.");
    }
    async update(e) {
      const t2 = Array.from(document.querySelectorAll(this.query), (e2) => new D(e2));
      if (t2[0].element !== this)
        return;
      a.set(document.activeElement), this.html = {};
      const n3 = [...new Set(t2.map((e2) => e2.url))];
      await Promise.all(n3.map(async (e2) => {
        if (!this.html.hasOwnProperty(e2)) {
          const t3 = await w(e2, { "X-Cable-Ready": "update" });
          this.html[e2] = await t3.text();
        }
      })), this.index = {}, t2.forEach((t3) => {
        this.index.hasOwnProperty(t3.url) ? this.index[t3.url]++ : this.index[t3.url] = 0, t3.process(e, this.html, this.index);
      });
    }
    get query() {
      return `updates-for[identifier="${this.identifier}"]`;
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
    get debounce() {
      return this.hasAttribute("debounce") ? parseInt(this.getAttribute("debounce")) : 20;
    }
  };
  var D = class {
    constructor(e) {
      this.element = e;
    }
    async process(t2, n3, o3) {
      if (!this.shouldUpdate(t2))
        return;
      const r2 = o3[this.url], s3 = document.createElement("template");
      this.element.setAttribute("updating", "updating"), s3.innerHTML = String(n3[this.url]).trim(), await this.resolveTurboFrames(s3.content);
      const a3 = s3.content.querySelectorAll(this.query);
      if (a3.length <= r2)
        return void console.warn(`Update aborted due to insufficient number of elements. The offending url is ${this.url}.`);
      const i3 = { element: this.element, html: a3[r2], permanentAttributeName: "data-ignore-updates" };
      c(this.element, "cable-ready:before-update", i3), morphdom_esm_default(this.element, a3[r2], { childrenOnly: true, onBeforeElUpdated: v(i3), onElUpdated: (e) => {
        this.element.removeAttribute("updating"), c(this.element, "cable-ready:after-update", i3), l(i3.focusSelector);
      } });
    }
    async resolveTurboFrames(e) {
      const t2 = [...e.querySelectorAll('turbo-frame[src]:not([loading="lazy"])')];
      return Promise.all(t2.map((t3) => new Promise(async (n3) => {
        const o3 = await w(t3.getAttribute("src"), { "Turbo-Frame": t3.id, "X-Cable-Ready": "update" }), r2 = document.createElement("template");
        r2.innerHTML = await o3.text(), await this.resolveTurboFrames(r2.content), e.querySelector(`turbo-frame#${t3.id}`).innerHTML = String(r2.content.querySelector(`turbo-frame#${t3.id}`).innerHTML).trim(), n3();
      })));
    }
    shouldUpdate(e) {
      return !this.ignoresInnerUpdates && this.hasChangesSelectedForUpdate(e);
    }
    hasChangesSelectedForUpdate(e) {
      const t2 = this.element.getAttribute("only");
      return !(t2 && e.changed && !t2.split(" ").some((t3) => e.changed.includes(t3)));
    }
    get ignoresInnerUpdates() {
      return this.element.hasAttribute("ignore-inner-updates") && this.element.hasAttribute("performing-inner-update");
    }
    get url() {
      return this.element.hasAttribute("url") ? this.element.getAttribute("url") : location.href;
    }
    get identifier() {
      return this.element.identifier;
    }
    get query() {
      return this.element.query;
    }
  };
  var F = (e) => {
    const t2 = e && e.parentElement.closest("updates-for");
    t2 && (t2.setAttribute("performing-inner-update", ""), F(t2));
  };
  var z = (e) => {
    const t2 = e && e.parentElement.closest("updates-for");
    t2 && (t2.removeAttribute("performing-inner-update"), z(t2));
  };
  var X = { perform: q, performAsync: (e, t2 = { emitMissingElementWarnings: true }) => new Promise((n3, o3) => {
    try {
      n3(q(e, t2));
    } catch (e2) {
      o3(e2);
    }
  }), shouldMorphCallbacks: x, didMorphCallbacks: M, initialize: (e = {}) => {
    const { consumer: t2 } = e;
    document.addEventListener("stimulus-reflex:before", (e2) => {
      F(e2.detail.element);
    }), document.addEventListener("stimulus-reflex:after", (e2) => {
      setTimeout(() => {
        z(e2.detail.element);
      });
    }), document.addEventListener("turbo:submit-start", (e2) => {
      F(e2.target);
    }), document.addEventListener("turbo:submit-end", (e2) => {
      setTimeout(() => {
        z(e2.target);
      });
    }), t2 ? U.setConsumer(t2) : console.error("CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`."), customElements.get("stream-from") || customElements.define("stream-from", _), customElements.get("updates-for") || customElements.define("updates-for", j);
  }, addOperation: (e, t2) => {
    const n3 = {};
    n3[e] = t2, R(n3);
  }, addOperations: (e) => {
    R(e);
  }, version: t, cable: U, get DOMOperations() {
    return console.warn("DEPRECATED: Please use `CableReady.operations` instead of `CableReady.DOMOperations`"), P.all;
  }, get operations() {
    return P.all;
  }, get consumer() {
    return U.consumer;
  } };
  window.CableReady = X;

  // ../../node_modules/@rails/actioncable/app/assets/javascripts/actioncable.esm.js
  var adapters = {
    logger: self.console,
    WebSocket: self.WebSocket
  };
  var logger = {
    log(...messages) {
      if (this.enabled) {
        messages.push(Date.now());
        adapters.logger.log("[ActionCable]", ...messages);
      }
    }
  };
  var now = () => new Date().getTime();
  var secondsSince = (time) => (now() - time) / 1e3;
  var ConnectionMonitor = class {
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
        logger.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
      }
    }
    stop() {
      if (this.isRunning()) {
        this.stoppedAt = now();
        this.stopPolling();
        removeEventListener("visibilitychange", this.visibilityDidChange);
        logger.log("ConnectionMonitor stopped");
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
      logger.log("ConnectionMonitor recorded connect");
    }
    recordDisconnect() {
      this.disconnectedAt = now();
      logger.log("ConnectionMonitor recorded disconnect");
    }
    startPolling() {
      this.stopPolling();
      this.poll();
    }
    stopPolling() {
      clearTimeout(this.pollTimeout);
    }
    poll() {
      this.pollTimeout = setTimeout(() => {
        this.reconnectIfStale();
        this.poll();
      }, this.getPollInterval());
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
        logger.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
        this.reconnectAttempts++;
        if (this.disconnectedRecently()) {
          logger.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
        } else {
          logger.log("ConnectionMonitor reopening");
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
        setTimeout(() => {
          if (this.connectionIsStale() || !this.connection.isOpen()) {
            logger.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
            this.connection.reopen();
          }
        }, 200);
      }
    }
  };
  ConnectionMonitor.staleThreshold = 6;
  ConnectionMonitor.reconnectionBackoffRate = 0.15;
  var INTERNAL = {
    message_types: {
      welcome: "welcome",
      disconnect: "disconnect",
      ping: "ping",
      confirmation: "confirm_subscription",
      rejection: "reject_subscription"
    },
    disconnect_reasons: {
      unauthorized: "unauthorized",
      invalid_request: "invalid_request",
      server_restart: "server_restart"
    },
    default_mount_path: "/cable",
    protocols: ["actioncable-v1-json", "actioncable-unsupported"]
  };
  var { message_types, protocols } = INTERNAL;
  var supportedProtocols = protocols.slice(0, protocols.length - 1);
  var indexOf = [].indexOf;
  var Connection = class {
    constructor(consumer) {
      this.open = this.open.bind(this);
      this.consumer = consumer;
      this.subscriptions = this.consumer.subscriptions;
      this.monitor = new ConnectionMonitor(this);
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
        logger.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
        return false;
      } else {
        logger.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
        if (this.webSocket) {
          this.uninstallEventHandlers();
        }
        this.webSocket = new adapters.WebSocket(this.consumer.url, protocols);
        this.installEventHandlers();
        this.monitor.start();
        return true;
      }
    }
    close({ allowReconnect } = {
      allowReconnect: true
    }) {
      if (!allowReconnect) {
        this.monitor.stop();
      }
      if (this.isOpen()) {
        return this.webSocket.close();
      }
    }
    reopen() {
      logger.log(`Reopening WebSocket, current state is ${this.getState()}`);
      if (this.isActive()) {
        try {
          return this.close();
        } catch (error2) {
          logger.log("Failed to reopen WebSocket", error2);
        } finally {
          logger.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
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
    isProtocolSupported() {
      return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
    }
    isState(...states) {
      return indexOf.call(states, this.getState()) >= 0;
    }
    getState() {
      if (this.webSocket) {
        for (let state in adapters.WebSocket) {
          if (adapters.WebSocket[state] === this.webSocket.readyState) {
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
          logger.log(`Disconnecting. Reason: ${reason}`);
          return this.close({
            allowReconnect: reconnect
          });
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
      logger.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
      this.disconnected = false;
      if (!this.isProtocolSupported()) {
        logger.log("Protocol is unsupported. Stopping monitor and disconnecting.");
        return this.close({
          allowReconnect: false
        });
      }
    },
    close(event) {
      logger.log("WebSocket onclose event");
      if (this.disconnected) {
        return;
      }
      this.disconnected = true;
      this.monitor.recordDisconnect();
      return this.subscriptions.notifyAll("disconnected", {
        willAttemptReconnect: this.monitor.isRunning()
      });
    },
    error() {
      logger.log("WebSocket onerror event");
    }
  };
  var extend2 = function(object, properties) {
    if (properties != null) {
      for (let key in properties) {
        const value = properties[key];
        object[key] = value;
      }
    }
    return object;
  };
  var Subscription = class {
    constructor(consumer, params = {}, mixin) {
      this.consumer = consumer;
      this.identifier = JSON.stringify(params);
      extend2(this, mixin);
    }
    perform(action, data = {}) {
      data.action = action;
      return this.send(data);
    }
    send(data) {
      return this.consumer.send({
        command: "message",
        identifier: this.identifier,
        data: JSON.stringify(data)
      });
    }
    unsubscribe() {
      return this.consumer.subscriptions.remove(this);
    }
  };
  var SubscriptionGuarantor = class {
    constructor(subscriptions) {
      this.subscriptions = subscriptions;
      this.pendingSubscriptions = [];
    }
    guarantee(subscription) {
      if (this.pendingSubscriptions.indexOf(subscription) == -1) {
        logger.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
        this.pendingSubscriptions.push(subscription);
      } else {
        logger.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
      }
      this.startGuaranteeing();
    }
    forget(subscription) {
      logger.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
      this.pendingSubscriptions = this.pendingSubscriptions.filter((s3) => s3 !== subscription);
    }
    startGuaranteeing() {
      this.stopGuaranteeing();
      this.retrySubscribing();
    }
    stopGuaranteeing() {
      clearTimeout(this.retryTimeout);
    }
    retrySubscribing() {
      this.retryTimeout = setTimeout(() => {
        if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
          this.pendingSubscriptions.map((subscription) => {
            logger.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
            this.subscriptions.subscribe(subscription);
          });
        }
      }, 500);
    }
  };
  var Subscriptions = class {
    constructor(consumer) {
      this.consumer = consumer;
      this.guarantor = new SubscriptionGuarantor(this);
      this.subscriptions = [];
    }
    create(channelName, mixin) {
      const channel = channelName;
      const params = typeof channel === "object" ? channel : {
        channel
      };
      const subscription = new Subscription(this.consumer, params, mixin);
      return this.add(subscription);
    }
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
      this.subscriptions = this.subscriptions.filter((s3) => s3 !== subscription);
      return subscription;
    }
    findAll(identifier) {
      return this.subscriptions.filter((s3) => s3.identifier === identifier);
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
      logger.log(`Subscription confirmed ${identifier}`);
      this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
    }
    sendCommand(subscription, command) {
      const { identifier } = subscription;
      return this.consumer.send({
        command,
        identifier
      });
    }
  };
  var Consumer = class {
    constructor(url) {
      this._url = url;
      this.subscriptions = new Subscriptions(this);
      this.connection = new Connection(this);
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
      return this.connection.close({
        allowReconnect: false
      });
    }
    ensureActiveConnection() {
      if (!this.connection.isActive()) {
        return this.connection.open();
      }
    }
  };
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a3 = document.createElement("a");
      a3.href = url;
      a3.href = a3.href;
      a3.protocol = a3.protocol.replace("http", "ws");
      return a3.href;
    } else {
      return url;
    }
  }
  function createConsumer(url = getConfig("url") || INTERNAL.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }

  // ../../node_modules/stimulus_reflex/dist/stimulus_reflex.min.js
  var l2 = { reflexAttribute: "data-reflex", reflexPermanentAttribute: "data-reflex-permanent", reflexRootAttribute: "data-reflex-root", reflexSuppressLoggingAttribute: "data-reflex-suppress-logging", reflexDatasetAttribute: "data-reflex-dataset", reflexDatasetAllAttribute: "data-reflex-dataset-all", reflexSerializeFormAttribute: "data-reflex-serialize-form", reflexFormSelectorAttribute: "data-reflex-form-selector", reflexIncludeInnerHtmlAttribute: "data-reflex-include-inner-html", reflexIncludeTextContentAttribute: "data-reflex-include-text-content" };
  var n2 = {};
  var o2 = { set(e) {
    n2 = { ...l2, ...e.schema };
    for (const e2 in n2)
      Object.defineProperty(this, e2.slice(0, -9), { get: () => n2[e2] });
  } };
  var a2 = false;
  var s2 = { get enabled() {
    return a2;
  }, get disabled() {
    return !a2;
  }, get value() {
    return a2;
  }, set(e) {
    a2 = !!e;
  }, set debug(e) {
    a2 = !!e;
  } };
  var i2 = {};
  var d2 = (e, t2, r2, l3, n3, o3) => {
    const a3 = i2[e];
    s2.disabled || a3.promise.data.suppressLogging || (a3.timestamp = new Date(), console.log(`\u2191 stimulus \u2191 ${t2}`, { reflexId: e, args: r2, controller: l3, element: n3, controllerElement: o3 }));
  };
  var c2 = (e, t2) => {
    const { detail: r2 } = e || {}, { selector: l3, payload: n3 } = r2 || {}, { reflexId: o3, target: a3, morph: d3 } = r2.stimulusReflex || {}, c3 = i2[o3];
    if (s2.disabled || c3.promise.data.suppressLogging)
      return;
    const u3 = c3.totalOperations > 1 ? ` ${c3.completedOperations}/${c3.totalOperations}` : "", f3 = c3.timestamp ? `in ${new Date() - c3.timestamp}ms` : "CLONED", m3 = e.type.split(":")[1].split("-").slice(1).join("_");
    console.log(`\u2193 reflex \u2193 ${a3} \u2192 ${l3 || "\u221E"}${u3} ${f3}`, { reflexId: o3, morph: d3, operation: m3, halted: t2, payload: n3 });
  };
  var u2 = (e) => {
    const { detail: t2 } = e || {}, { reflexId: r2, target: l3, payload: n3 } = t2.stimulusReflex || {}, o3 = i2[r2];
    if (s2.disabled || o3.promise.data.suppressLogging)
      return;
    const a3 = o3.timestamp ? `in ${new Date() - o3.timestamp}ms` : "CLONED";
    console.log(`\u2193 reflex \u2193 ${l3} ${a3} %cERROR: ${e.detail.body}`, "color: #f00;", { reflexId: r2, payload: n3 });
  };
  var f2 = true;
  var m2 = { get enabled() {
    return f2;
  }, get disabled() {
    return !f2;
  }, get value() {
    return f2;
  }, set(e) {
    f2 = !!e;
  }, set deprecate(e) {
    f2 = !!e;
  } };
  var p2 = () => {
    const e = window.crypto || window.msCrypto;
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (t2) => (t2 ^ e.getRandomValues(new Uint8Array(1))[0] & 15 >> t2 / 4).toString(16));
  };
  var x2 = (e, t2 = true) => "string" != typeof e ? "" : (e = e.replace(/[\s_](.)/g, (e2) => e2.toUpperCase()).replace(/[\s_]/g, "").replace(/^(.)/, (e2) => e2.toLowerCase()), t2 && (e = e.substr(0, 1).toUpperCase() + e.substr(1)), e);
  var h2 = (e, t2) => {
    document.dispatchEvent(new CustomEvent(e, { bubbles: true, cancelable: false, detail: t2 })), window.jQuery && window.jQuery(document).trigger(e, t2);
  };
  var g2 = (e) => {
    if ("" !== e.id)
      return "//*[@id='" + e.id + "']";
    if (e === document.body)
      return "/html/body";
    let t2 = 0;
    const r2 = e?.parentNode ? e.parentNode.childNodes : [];
    for (var l3 = 0; l3 < r2.length; l3++) {
      const n3 = r2[l3];
      if (n3 === e) {
        return `${g2(e.parentNode)}/${e.tagName.toLowerCase()}[${t2 + 1}]`;
      }
      1 === n3.nodeType && n3.tagName === e.tagName && t2++;
    }
  };
  var b2 = (e) => document.evaluate(e, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  var y2 = (e, t2 = false) => {
    const r2 = document.evaluate(e, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), l3 = [];
    for (let e2 = 0; e2 < r2.snapshotLength; e2++)
      l3.push(r2.snapshotItem(e2));
    return t2 ? l3.reverse() : l3;
  };
  var v2 = (e = []) => {
    const t2 = e.filter((e2) => e2 && String(e2).length).map((e2) => e2.trim()).join(" ").trim();
    return t2.length ? t2 : null;
  };
  var E2 = (e) => e && e.length ? e.split(" ").filter((e2) => e2.trim().length) : [];
  var w2 = (e) => {
    let t2 = Array.from(e.attributes).reduce((e2, t3) => (e2[t3.name] = t3.value, e2), {});
    if (t2.checked = !!e.checked, t2.selected = !!e.selected, t2.tag_name = e.tagName, e.tagName.match(/select/i) || ((e2) => !!["checkbox", "radio"].includes(e2.type) && document.querySelectorAll(`input[type="${e2.type}"][name="${e2.name}"]`).length > 1)(e)) {
      const r2 = ((e2) => Array.from(e2.querySelectorAll("option:checked")).concat(Array.from(document.querySelectorAll(`input[type="${e2.type}"][name="${e2.name}"]`)).filter((e3) => e3.checked)).map((e3) => e3.value))(e);
      t2.values = r2, t2.value = r2.join(",");
    } else
      t2.value = e.value;
    return t2;
  };
  var C2 = (e, t2) => {
    if (!t2 || 0 === t2.length)
      return [];
    let r2 = [e];
    const l3 = g2(e);
    return t2.forEach((e2) => {
      try {
        switch (e2) {
          case "combined":
            m2.enabled && console.warn("In the next version of StimulusReflex, the 'combined' option to data-reflex-dataset will become 'ancestors'."), r2 = [...r2, ...y2(`${l3}/ancestor::*`, true)];
            break;
          case "ancestors":
            r2 = [...r2, ...y2(`${l3}/ancestor::*`, true)];
            break;
          case "parent":
            r2 = [...r2, ...y2(`${l3}/parent::*`)];
            break;
          case "siblings":
            r2 = [...r2, ...y2(`${l3}/preceding-sibling::*|${l3}/following-sibling::*`)];
            break;
          case "children":
            r2 = [...r2, ...y2(`${l3}/child::*`)];
            break;
          case "descendants":
            r2 = [...r2, ...y2(`${l3}/descendant::*`)];
            break;
          default:
            r2 = [...r2, ...document.querySelectorAll(e2)];
        }
      } catch (e3) {
        s2.enabled && console.error(e3);
      }
    }), r2;
  };
  var I2 = (e) => {
    let t2 = {};
    return e && e.attributes && Array.from(e.attributes).forEach((e2) => {
      e2.name.startsWith("data-") && (t2[e2.name] = e2.value);
    }), t2;
  };
  var R2 = false;
  var S2 = { get disabled() {
    return !R2;
  }, set(e) {
    R2 = e;
  } };
  var A2 = (e, t2, r2, l3, n3) => {
    if (!r2 || !r2.reflexData[l3])
      return;
    const o3 = r2.reflexController[l3], a3 = r2.reflexData[l3].target, s3 = a3.split("#")[1], d3 = o3[["before", "after", "finalize"].includes(e) ? `${e}${x2(s3)}` : `${x2(s3, false)}${x2(e)}`], c3 = o3[["before", "after", "finalize"].includes(e) ? `${e}Reflex` : `reflex${x2(e)}`];
    "function" == typeof d3 && d3.call(o3, t2, a3, r2.reflexError[l3], l3, n3), "function" == typeof c3 && c3.call(o3, t2, a3, r2.reflexError[l3], l3, n3), i2[l3] && e === i2[l3].finalStage && (Reflect.deleteProperty(r2.reflexController, l3), Reflect.deleteProperty(r2.reflexData, l3), Reflect.deleteProperty(r2.reflexError, l3));
  };
  document.addEventListener("stimulus-reflex:before", (e) => A2("before", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload), true), document.addEventListener("stimulus-reflex:success", (e) => {
    A2("success", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload), $2("after", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload);
  }, true), document.addEventListener("stimulus-reflex:nothing", (e) => {
    $2("success", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload);
  }, true), document.addEventListener("stimulus-reflex:error", (e) => {
    A2("error", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload), $2("after", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload);
  }, true), document.addEventListener("stimulus-reflex:halted", (e) => A2("halted", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload), true), document.addEventListener("stimulus-reflex:after", (e) => A2("after", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload), true), document.addEventListener("stimulus-reflex:finalize", (e) => A2("finalize", e.detail.element, e.detail.controller.element, e.detail.reflexId, e.detail.payload), true);
  var $2 = (e, t2, r2, l3, n3) => {
    if (!r2)
      return void (s2.enabled && !i2[l3].warned && (console.warn(`StimulusReflex was not able execute callbacks or emit events for "${e}" or later life-cycle stages for this Reflex. The StimulusReflex Controller Element is no longer present in the DOM. Could you move the StimulusReflex Controller to an element higher in your DOM?`), i2[l3].warned = true));
    if (!r2.reflexController || r2.reflexController && !r2.reflexController[l3])
      return void (s2.enabled && !i2[l3].warned && (console.warn(`StimulusReflex detected that the StimulusReflex Controller responsible for this Reflex has been replaced with a new instance. Callbacks and events for "${e}" or later life-cycle stages cannot be executed.`), i2[l3].warned = true));
    const { target: o3 } = r2.reflexData[l3] || {}, a3 = r2.reflexController[l3] || {}, d3 = `stimulus-reflex:${e}`, c3 = `${d3}:${o3.split("#")[1]}`, u3 = { reflex: o3, controller: a3, reflexId: l3, element: t2, payload: n3 }, f3 = { bubbles: true, cancelable: false, detail: u3 };
    r2.dispatchEvent(new CustomEvent(d3, f3)), r2.dispatchEvent(new CustomEvent(c3, f3)), window.jQuery && (window.jQuery(r2).trigger(d3, u3), window.jQuery(r2).trigger(c3, u3));
  };
  var L2 = (e, t2) => E2(t2.getAttribute(o2.controller)).reduce((r2, l3) => {
    const n3 = e.getControllerForElementAndIdentifier(t2, l3);
    return n3 && n3.StimulusReflex && r2.push(n3), r2;
  }, []);
  var O2 = (e) => {
    if (!e.cableReady)
      return;
    if (e.version.replace(".pre", "-pre") !== X.version)
      return void (s2.enabled && console.error(`Reflex failed due to cable_ready gem/NPM package version mismatch. Package versions must match exactly.
Note that if you are using pre-release builds, gems use the "x.y.z.preN" version format, while NPM packages use "x.y.z-preN".

cable_ready gem: ${e.version}
cable_ready NPM: ${X.version}`));
    let r2, l3 = [];
    for (let t2 = e.operations.length - 1; t2 >= 0; t2--)
      e.operations[t2].stimulusReflex && (l3.push(e.operations[t2]), e.operations.splice(t2, 1));
    if (!l3.some((e2) => e2.stimulusReflex.url !== location.href))
      if (l3.length && (r2 = l3[0].stimulusReflex, r2.payload = l3[0].payload), r2) {
        const { reflexId: n3, payload: o3 } = r2;
        if (!i2[n3] && S2.disabled) {
          const e2 = b2(r2.xpathController), t2 = b2(r2.xpathElement);
          e2.reflexController = e2.reflexController || {}, e2.reflexData = e2.reflexData || {}, e2.reflexError = e2.reflexError || {}, e2.reflexController[n3] = i2.app.getControllerForElementAndIdentifier(e2, r2.reflexController), e2.reflexData[n3] = r2, $2("before", t2, e2, n3, o3), _2(r2);
        }
        i2[n3] && (i2[n3].totalOperations = l3.length, i2[n3].pendingOperations = l3.length, i2[n3].completedOperations = 0, i2[n3].piggybackOperations = e.operations, X.perform(l3));
      } else
        e.operations.length && i2[e.operations[0].reflexId] && X.perform(e.operations);
  };
  var _2 = (e) => {
    const { reflexId: t2 } = e;
    i2[t2] = { finalStage: "finalize" };
    const r2 = new Promise((r3, l3) => {
      i2[t2].promise = { resolve: r3, reject: l3, data: e };
    });
    return r2.reflexId = t2, s2.enabled && r2.catch(() => {
    }), r2;
  };
  var D2 = ((e, t2 = 250) => {
    let r2;
    return (...l3) => {
      clearTimeout(r2), r2 = setTimeout(() => {
        r2 = null, e(...l3);
      }, t2);
    };
  })(() => {
    document.querySelectorAll(`[${o2.reflex}]`).forEach((e) => {
      const t2 = E2(e.getAttribute(o2.controller)), r2 = E2(e.getAttribute(o2.reflex)), l3 = E2(e.getAttribute(o2.action));
      r2.forEach((r3) => {
        const n4 = ((e2, t3) => t3.find((t4) => {
          if (t4.identifier)
            return ((e3) => {
              const t5 = e3.match(/(?:.*->)?(.*?)(?:Reflex)?#/);
              return t5 ? t5[1] : "";
            })(e2).replace(/([a-z0–9])([A-Z])/g, "$1-$2").replace(/(::)/g, "--").toLowerCase() === t4.identifier;
        }) || t3[0])(r3, ((e2, t3) => {
          let r4 = [];
          for (; t3; )
            r4 = r4.concat(L2(e2, t3)), t3 = t3.parentElement;
          return r4;
        })(i2.app, e));
        let o3;
        n4 ? (o3 = `${r3.split("->")[0]}->${n4.identifier}#__perform`, l3.includes(o3) || l3.push(o3)) : (o3 = `${r3.split("->")[0]}->stimulus-reflex#__perform`, t2.includes("stimulus-reflex") || t2.push("stimulus-reflex"), l3.includes(o3) || l3.push(o3));
      });
      const n3 = v2(t2), a3 = v2(l3);
      n3 && e.getAttribute(o2.controller) != n3 && e.setAttribute(o2.controller, n3), a3 && e.getAttribute(o2.action) != a3 && e.setAttribute(o2.action, a3);
    }), h2("stimulus-reflex:ready");
  }, 20);
  var T2 = class {
    constructor(e, t2, r2, l3, n3, o3, a3, s3, i3) {
      this.options = e, this.reflexElement = t2, this.controllerElement = r2, this.reflexController = l3, this.permanentAttributeName = n3, this.target = o3, this.args = a3, this.url = s3, this.tabId = i3;
    }
    get attrs() {
      return this._attrs = this._attrs || this.options.attrs || w2(this.reflexElement), this._attrs;
    }
    get reflexId() {
      return this._reflexId = this._reflexId || this.options.reflexId || p2(), this._reflexId;
    }
    get selectors() {
      return this._selectors = this._selectors || this.options.selectors || ((e) => {
        let t2 = [];
        for (; 0 === t2.length && e; ) {
          let r2 = e.getAttribute(o2.reflexRoot);
          if (r2) {
            0 === r2.length && e.id && (r2 = `#${e.id}`);
            const l3 = r2.split(",").filter((e2) => e2.trim().length);
            s2.enabled && 0 === l3.length && console.error(`No value found for ${o2.reflexRoot}. Add an #id to the element or provide a value for ${o2.reflexRoot}.`, e), t2 = t2.concat(l3.filter((e2) => document.querySelector(e2)));
          }
          e = e.parentElement ? e.parentElement.closest(`[${o2.reflexRoot}]`) : null;
        }
        return t2;
      })(this.reflexElement), "string" == typeof this._selectors ? [this._selectors] : this._selectors;
    }
    get resolveLate() {
      return this.options.resolveLate || false;
    }
    get dataset() {
      return this._dataset = this._dataset || ((e) => {
        const t2 = e.attributes[o2.reflexDataset], r2 = e.attributes[o2.reflexDatasetAll], l3 = t2 && t2.value.split(" ") || [], n3 = r2 && r2.value.split(" ") || [], a3 = C2(e, l3), s3 = C2(e, n3), i3 = a3.reduce((e2, t3) => ({ ...I2(t3), ...e2 }), {}), d3 = { dataset: { ...I2(e), ...i3 }, datasetAll: {} };
        return s3.forEach((e2) => {
          const t3 = I2(e2);
          Object.keys(t3).forEach((e3) => {
            const r3 = t3[e3];
            d3.datasetAll[e3] && Array.isArray(d3.datasetAll[e3]) ? d3.datasetAll[e3].push(r3) : d3.datasetAll[e3] = [r3];
          });
        }), d3;
      })(this.reflexElement), this._dataset;
    }
    get innerHTML() {
      return this.includeInnerHtml ? this.reflexElement.innerHTML : "";
    }
    get textContent() {
      return this.includeTextContent ? this.reflexElement.textContent : "";
    }
    get xpathController() {
      return g2(this.controllerElement);
    }
    get xpathElement() {
      return g2(this.reflexElement);
    }
    get formSelector() {
      const e = this.reflexElement.attributes[o2.reflexFormSelector] ? this.reflexElement.attributes[o2.reflexFormSelector].value : void 0;
      return this.options.formSelector || e;
    }
    get includeInnerHtml() {
      const e = this.reflexElement.attributes[o2.reflexIncludeInnerHtml] || false;
      return !(!this.options.includeInnerHTML && !e) && "false" !== e.value;
    }
    get includeTextContent() {
      const e = this.reflexElement.attributes[o2.reflexIncludeTextContent] || false;
      return !(!this.options.includeTextContent && !e) && "false" !== e.value;
    }
    get suppressLogging() {
      return this.options.suppressLogging || this.reflexElement.attributes[o2.reflexSuppressLogging] || false;
    }
    valueOf() {
      return { attrs: this.attrs, dataset: this.dataset, selectors: this.selectors, reflexId: this.reflexId, resolveLate: this.resolveLate, suppressLogging: this.suppressLogging, xpathController: this.xpathController, xpathElement: this.xpathElement, inner_html: this.innerHTML, text_content: this.textContent, formSelector: this.formSelector, reflexController: this.reflexController, permanentAttributeName: this.permanentAttributeName, target: this.target, args: this.args, url: this.url, tabId: this.tabId, version: "3.5.0-pre9" };
    }
  };
  var N2;
  var j2;
  var k2;
  var z2 = () => {
    k2 = true, document.body.classList.replace("stimulus-reflex-disconnected", "stimulus-reflex-connected"), h2("stimulus-reflex:connected"), h2("stimulus-reflex:action-cable:connected");
  };
  var P2 = () => {
    k2 = false, document.body.classList.replace("stimulus-reflex-connected", "stimulus-reflex-disconnected"), h2("stimulus-reflex:rejected"), h2("stimulus-reflex:action-cable:rejected"), Debug.enabled && console.warn("Channel subscription was rejected.");
  };
  var F2 = (e) => {
    k2 = false, document.body.classList.replace("stimulus-reflex-connected", "stimulus-reflex-disconnected"), h2("stimulus-reflex:disconnected", e), h2("stimulus-reflex:action-cable:disconnected", e);
  };
  var M2 = { consumer: N2, params: j2, get subscriptionActive() {
    return k2;
  }, createSubscription: (e) => {
    N2 = N2 || e.application.consumer || createConsumer();
    const { channel: t2 } = e.StimulusReflex, l3 = { channel: t2, ...j2 }, n3 = JSON.stringify(l3);
    e.StimulusReflex.subscription = N2.subscriptions.findAll(n3)[0] || N2.subscriptions.create(l3, { received: O2, connected: z2, rejected: P2, disconnected: F2 });
  }, connected: z2, rejected: P2, disconnected: F2, set(e, t2) {
    N2 = e, j2 = t2;
  } };
  var H2 = (e) => {
    const { stimulusReflex: t2, payload: r2 } = e.detail || {};
    if (!t2)
      return;
    const { reflexId: l3, xpathElement: n3, xpathController: o3 } = t2, a3 = b2(o3), s3 = b2(n3), d3 = i2[l3], { promise: c3 } = d3;
    d3.pendingOperations--, d3.pendingOperations > 0 || (t2.resolveLate || setTimeout(() => c3.resolve({ element: s3, event: e, data: c3.data, payload: r2, reflexId: l3, toString: () => "" })), setTimeout(() => $2("success", s3, a3, l3, r2)));
  };
  var U2 = (e) => {
    const { stimulusReflex: r2, payload: l3 } = e.detail || {};
    if (!r2)
      return;
    const { reflexId: n3, xpathElement: o3, xpathController: a3 } = r2, s3 = b2(a3), d3 = b2(o3), u3 = i2[n3], { promise: f3 } = u3;
    u3.completedOperations++, c2(e, false), u3.completedOperations < u3.totalOperations || (r2.resolveLate && setTimeout(() => f3.resolve({ element: d3, event: e, data: f3.data, payload: l3, reflexId: n3, toString: () => "" })), setTimeout(() => $2("finalize", d3, s3, n3, l3)), u3.piggybackOperations.length && X.perform(u3.piggybackOperations));
  };
  var q2 = (e, t2, r2, l3, n3) => {
    l3.finalStage = "after", c2(e, false), setTimeout(() => r2.resolve({ data: r2.data, element: n3, event: e, payload: t2, reflexId: r2.data.reflexId, toString: () => "" }));
  };
  var Q = (e, t2, r2, l3, n3) => {
    l3.finalStage = "halted", c2(e, true), setTimeout(() => r2.resolve({ data: r2.data, element: n3, event: e, payload: t2, reflexId: r2.data.reflexId, toString: () => "" }));
  };
  var V = (e, t2, r2, l3, n3) => {
    l3.finalStage = "after", u2(e), setTimeout(() => r2.reject({ data: r2.data, element: n3, event: e, payload: t2, reflexId: r2.data.reflexId, error: e.detail.body, toString: () => e.detail.body }));
  };
  var X2 = class extends Controller {
    constructor(...e) {
      super(...e), J(this);
    }
  };
  var Y = (e, { controller: t2, consumer: r2, debug: l3, params: n3, isolate: a3, deprecate: d3 } = {}) => {
    M2.set(r2, n3), document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.remove("stimulus-reflex-connected"), document.body.classList.add("stimulus-reflex-disconnected"), m2.enabled && r2 && console.warn("Deprecation warning: the next version of StimulusReflex will obtain a reference to consumer via the Stimulus application object.\nPlease add 'application.consumer = consumer' to your index.js after your Stimulus application has been established, and remove the consumer key from your StimulusReflex initialize() options object."), m2.enabled && S2.disabled && console.warn("Deprecation warning: the next version of StimulusReflex will standardize isolation mode, and the isolate option will be removed.\nPlease update your applications to assume that every tab will be isolated.");
    }, { once: true }), S2.set(!!a3), i2.app = e, o2.set(e), i2.app.register("stimulus-reflex", t2 || X2), s2.set(!!l3), void 0 !== d3 && m2.set(d3);
    new MutationObserver(D2).observe(document.documentElement, { attributeFilter: [o2.reflex, o2.action], childList: true, subtree: true });
  };
  var J = (e, t2 = {}) => {
    e.StimulusReflex = { ...t2, channel: "StimulusReflex::Channel" }, M2.createSubscription(e), Object.assign(e, { isActionCableConnectionOpen() {
      return this.StimulusReflex.subscription.consumer.connection.isOpen();
    }, stimulate() {
      const e2 = location.href, t3 = Array.from(arguments), r2 = t3.shift() || "StimulusReflex::Reflex#default_reflex", l3 = this.element, n3 = t3[0] && t3[0].nodeType === Node.ELEMENT_NODE ? t3.shift() : l3;
      if ("number" === n3.type && n3.validity && n3.validity.badInput)
        return void (s2.enabled && console.warn("Reflex aborted: invalid numeric input"));
      const a3 = {};
      if (t3[0] && "object" == typeof t3[0] && Object.keys(t3[0]).filter((e3) => ["attrs", "selectors", "reflexId", "resolveLate", "serializeForm", "suppressLogging", "includeInnerHTML", "includeTextContent"].includes(e3)).length) {
        const e3 = t3.shift();
        Object.keys(e3).forEach((t4) => a3[t4] = e3[t4]);
      }
      const i3 = new T2(a3, n3, l3, this.identifier, o2.reflexPermanent, r2, t3, e2, W), c3 = i3.reflexId;
      if (!this.isActionCableConnectionOpen())
        throw "The ActionCable connection is not open! `this.isActionCableConnectionOpen()` must return true before calling `this.stimulate()`";
      if (!M2.subscriptionActive)
        throw "The ActionCable channel subscription for StimulusReflex was rejected.";
      l3.reflexController = l3.reflexController || {}, l3.reflexData = l3.reflexData || {}, l3.reflexError = l3.reflexError || {}, l3.reflexController[c3] = this, l3.reflexData[c3] = i3.valueOf(), $2("before", n3, l3, c3), setTimeout(() => {
        const { params: e3 } = l3.reflexData[c3] || {}, t4 = n3.attributes[o2.reflexSerializeForm];
        t4 && (a3.serializeForm = "false" !== t4.value);
        const r3 = n3.closest(i3.formSelector) || document.querySelector(i3.formSelector) || n3.closest("form");
        m2.enabled && void 0 === a3.serializeForm && r3 && console.warn(`Deprecation warning: the next version of StimulusReflex will not serialize forms by default.
Please set ${o2.reflexSerializeForm}="true" on your Reflex Controller Element or pass { serializeForm: true } as an option to stimulate.`);
        const s3 = false === a3.serializeForm ? "" : ((e4, t5 = {}) => {
          if (!e4)
            return "";
          const r4 = t5.w || window, { element: l4 } = t5, n4 = new r4.FormData(e4), o3 = Array.from(n4, (e5) => e5.map(encodeURIComponent).join("=")), a4 = e4.querySelector("input[type=submit]");
          return l4 && l4.name && "INPUT" === l4.nodeName && "submit" === l4.type ? o3.push(`${encodeURIComponent(l4.name)}=${encodeURIComponent(l4.value)}`) : a4 && a4.name && o3.push(`${encodeURIComponent(a4.name)}=${encodeURIComponent(a4.value)}`), Array.from(o3).join("&");
        })(r3, { element: n3 });
        l3.reflexData[c3] = { ...i3.valueOf(), params: e3, formData: s3 }, this.StimulusReflex.subscription.send(l3.reflexData[c3]);
      });
      const u3 = _2(i3.valueOf());
      return d2(c3, r2, t3, this.context.scope.identifier, n3, l3), u3;
    }, __perform(e2) {
      let t3, r2 = e2.target;
      for (; r2 && !t3; )
        t3 = r2.getAttribute(o2.reflex), t3 && t3.trim().length || (r2 = r2.parentElement);
      const l3 = E2(t3).find((t4) => t4.split("->")[0] === e2.type);
      l3 && (e2.preventDefault(), e2.stopPropagation(), this.stimulate(l3.split("->")[1], r2));
    } });
  };
  var W = p2();
  var Z = (e, t2 = {}) => {
    J(e, t2);
  };
  document.addEventListener("cable-ready:after-dispatch-event", (e) => {
    const { stimulusReflex: r2, payload: l3, name: n3, body: o3 } = e.detail || {}, a3 = n3.split("-")[2];
    if (!r2 || !["nothing", "halted", "error"].includes(a3))
      return;
    const { reflexId: s3, xpathElement: d3, xpathController: c3 } = r2, u3 = b2(d3), f3 = b2(c3), m3 = i2[s3], { promise: p3 } = m3;
    switch (f3 && (f3.reflexError = f3.reflexError || {}, "error" === a3 && (f3.reflexError[s3] = o3)), a3) {
      case "nothing":
        q2(e, l3, p3, m3, u3);
        break;
      case "error":
        V(e, l3, p3, m3, u3);
        break;
      case "halted":
        Q(e, l3, p3, m3, u3);
    }
    setTimeout(() => $2(a3, u3, f3, s3, l3)), m3.piggybackOperations.length && X.perform(m3.piggybackOperations);
  }), document.addEventListener("cable-ready:before-inner-html", H2), document.addEventListener("cable-ready:before-morph", H2), document.addEventListener("cable-ready:after-inner-html", U2), document.addEventListener("cable-ready:after-morph", U2), window.addEventListener("load", D2);
  var B = { ...Object.freeze({ __proto__: null, initialize: Y, register: J, useReflex: Z }), get debug() {
    return s2.value;
  }, set debug(e) {
    s2.set(!!e);
  }, get deprecate() {
    return m2.value;
  }, set deprecate(e) {
    m2.set(!!e);
  } };
  window.StimulusReflex = B;

  // controllers/application_controller.js
  var application_controller_default = class extends Controller {
    connect() {
      B.register(this);
    }
    /* Application-wide lifecycle methods
     *
     * Use these methods to handle lifecycle concerns for the entire application.
     * Using the lifecycle is optional, so feel free to delete these stubs if you don't need them.
     *
     * Arguments:
     *
     *   element - the element that triggered the reflex
     *             may be different than the Stimulus controller's this.element
     *
     *   reflex - the name of the reflex e.g. "Example#demo"
     *
     *   error/noop - the error message (for reflexError), otherwise null
     *
     *   reflexId - a UUID4 or developer-provided unique identifier for each Reflex
     */
    beforeReflex(element, reflex, noop3, reflexId) {
    }
    reflexSuccess(element, reflex, noop3, reflexId) {
    }
    reflexError(element, reflex, error2, reflexId) {
    }
    reflexHalted(element, reflex, error2, reflexId) {
    }
    afterReflex(element, reflex, noop3, reflexId) {
    }
    finalizeReflex(element, reflex, noop3, reflexId) {
    }
  };

  // controllers/create_todo_controller.js
  var create_todo_controller_exports = {};
  __export(create_todo_controller_exports, {
    default: () => create_todo_controller_default
  });
  var create_todo_controller_default = class extends application_controller_default {
    add(e) {
      e.preventDefault();
      Array.from(e.target.elements).forEach((e2) => e2.value = "");
      this.stimulate("CreateTodoComponent#add", e.target);
    }
  };

  // controllers/theme_change_controller.js
  var theme_change_controller_exports = {};
  __export(theme_change_controller_exports, {
    default: () => theme_change_controller_default
  });
  var theme_change_controller_default = class extends application_controller_default {
    add(e) {
      e.preventDefault();
      Array.from(e.target.elements).forEach((e2) => e2.value = "");
      this.stimulate("CreateTodoComponent#add", e.target);
    }
  };

  // controllers/todo_item_controller.js
  var todo_item_controller_exports = {};
  __export(todo_item_controller_exports, {
    default: () => todo_item_controller_default
  });
  var todo_item_controller_default = class extends Controller {
    connect() {
      useDebounce(this, { wait: 100 });
    }
    add() {
    }
  };
  __publicField(todo_item_controller_default, "debounces", ["add"]);

  // controllers/window-size_controller.js
  var window_size_controller_exports = {};
  __export(window_size_controller_exports, {
    default: () => window_size_controller_default
  });
  var window_size_controller_default = class extends Controller {
    connect() {
      useWindowResize(this);
    }
    windowResize({ width, height }) {
      this.widthTarget.textContent = width;
      this.heightTarget.textContent = height;
    }
  };
  __publicField(window_size_controller_default, "targets", ["width", "height"]);

  // rails:/Users/xiaobo/Desktop/未命名文件夹 3/stimulus_reflex_todos/app/javascript/controllers/**/*_controller.js
  var modules = [{ name: "application", module: application_controller_exports, filename: "./application_controller.js" }, { name: "create-todo", module: create_todo_controller_exports, filename: "./create_todo_controller.js" }, { name: "theme-change", module: theme_change_controller_exports, filename: "./theme_change_controller.js" }, { name: "todo-item", module: todo_item_controller_exports, filename: "./todo_item_controller.js" }, { name: "window-size", module: window_size_controller_exports, filename: "./window-size_controller.js" }];
  var controller_default = modules;

  // controllers/index.js
  controller_default.forEach((controller) => {
    application.register(controller.name, controller.module.default);
  });
  application.register("intersection", IntersectionController);

  // channels/consumer.js
  var consumer_default = createConsumer();

  // config/cable_ready.js
  X.initialize({ consumer: consumer_default });

  // ../../node_modules/stimulus/dist/stimulus.js
  function camelize2(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_3, char) => char.toUpperCase());
  }
  function namespaceCamelize2(value) {
    return camelize2(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize2(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize2(value) {
    return value.replace(/([A-Z])/g, (_3, char) => `-${char.toLowerCase()}`);
  }
  function readInheritableStaticArrayValues2(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor2(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues2(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs2(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor2(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs2(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor2(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues2(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs2(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var getOwnKeys2 = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend3 = (() => {
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
      const a3 = function() {
        this.a.call(this);
      };
      const b3 = extendWithReflect(a3);
      b3.prototype.a = function() {
      };
      return new b3();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  var defaultSchema2 = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries2("abcdefghijklmnopqrstuvwxyz".split("").map((c3) => [c3, c3]))), objectFromEntries2("0123456789".split("").map((n3) => [n3, n3])))
  };
  function objectFromEntries2(array) {
    return array.reduce((memo, [k3, v3]) => Object.assign(Object.assign({}, memo), { [k3]: v3 }), {});
  }
  function ClassPropertiesBlessing2(constructor) {
    const classes = readInheritableStaticArrayValues2(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition2(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition2(key) {
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
      [`has${capitalize2(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing2(constructor) {
    const outlets = readInheritableStaticArrayValues2(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition2(outletDefinition));
    }, {});
  }
  function propertiesForOutletDefinition2(name) {
    const camelizedName = namespaceCamelize2(name);
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
      [`has${capitalize2(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing2(constructor) {
    const targets = readInheritableStaticArrayValues2(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition2(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition2(name) {
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
      [`has${capitalize2(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing2(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs2(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair2(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair2(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair2(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair2(valueDefinitionPair, controller);
    const { key, name, reader: read2, writer: write2 } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read2(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write2(value));
          }
        }
      },
      [`has${capitalize2(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair2([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition2({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant2(constant) {
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
  function parseValueTypeDefault2(defaultValue) {
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
  function parseValueTypeObject2(payload) {
    const typeFromObject = parseValueTypeConstant2(payload.typeObject.type);
    if (!typeFromObject)
      return;
    const defaultValueType = parseValueTypeDefault2(payload.typeObject.default);
    if (typeFromObject !== defaultValueType) {
      const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
    }
    return typeFromObject;
  }
  function parseValueTypeDefinition2(payload) {
    const typeFromObject = parseValueTypeObject2({
      controller: payload.controller,
      token: payload.token,
      typeObject: payload.typeDefinition
    });
    const typeFromDefaultValue = parseValueTypeDefault2(payload.typeDefinition);
    const typeFromConstant = parseValueTypeConstant2(payload.typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
    throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
  }
  function defaultValueForDefinition2(typeDefinition) {
    const constant = parseValueTypeConstant2(typeDefinition);
    if (constant)
      return defaultValuesByType2[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition2(payload) {
    const key = `${dasherize2(payload.token)}-value`;
    const type = parseValueTypeDefinition2(payload);
    return {
      type,
      key,
      name: camelize2(key),
      get defaultValue() {
        return defaultValueForDefinition2(payload.typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault2(payload.typeDefinition) !== void 0;
      },
      reader: readers2[type],
      writer: writers2[type] || writers2.default
    };
  }
  var defaultValuesByType2 = {
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
  var readers2 = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault2(array)}"`);
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
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault2(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers2 = {
    default: writeString2,
    array: writeJSON2,
    object: writeJSON2
  };
  function writeJSON2(value) {
    return JSON.stringify(value);
  }
  function writeString2(value) {
    return `${value}`;
  }
  var Controller2 = class {
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
  Controller2.blessings = [
    ClassPropertiesBlessing2,
    TargetPropertiesBlessing2,
    ValuePropertiesBlessing2,
    OutletPropertiesBlessing2
  ];
  Controller2.targets = [];
  Controller2.outlets = [];
  Controller2.values = {};

  // ../../node_modules/radiolabel/dist/index.m.js
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i3 = 0; i3 < props.length; i3++) {
      var descriptor = props[i3];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass)
      _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o3) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf2(o4) {
      return o4.__proto__ || Object.getPrototypeOf(o4);
    };
    return _getPrototypeOf(o3);
  }
  function _setPrototypeOf(o3, p3) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf2(o4, p4) {
      o4.__proto__ = p4;
      return o4;
    };
    return _setPrototypeOf(o3, p3);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct)
      return false;
    if (Reflect.construct.sham)
      return false;
    if (typeof Proxy === "function")
      return true;
    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function() {
      }));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _assertThisInitialized(self2) {
    if (self2 === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self2;
  }
  function _possibleConstructorReturn(self2, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }
    return _assertThisInitialized(self2);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function() {
      var Super = _getPrototypeOf(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  var DOCUMENT_FRAGMENT_NODE2 = 11;
  function morphAttrs2(fromNode, toNode) {
    var toNodeAttrs = toNode.attributes;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE2 || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE2) {
      return;
    }
    for (var i3 = toNodeAttrs.length - 1; i3 >= 0; i3--) {
      attr = toNodeAttrs[i3];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      attrValue = attr.value;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        if (fromValue !== attrValue) {
          if (attr.prefix === "xmlns") {
            attrName = attr.name;
          }
          fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
        }
      } else {
        fromValue = fromNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          fromNode.setAttribute(attrName, attrValue);
        }
      }
    }
    var fromNodeAttrs = fromNode.attributes;
    for (var d3 = fromNodeAttrs.length - 1; d3 >= 0; d3--) {
      attr = fromNodeAttrs[d3];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          fromNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!toNode.hasAttribute(attrName)) {
          fromNode.removeAttribute(attrName);
        }
      }
    }
  }
  var range2;
  var NS_XHTML2 = "http://www.w3.org/1999/xhtml";
  var doc2 = typeof document === "undefined" ? void 0 : document;
  var HAS_TEMPLATE_SUPPORT2 = !!doc2 && "content" in doc2.createElement("template");
  var HAS_RANGE_SUPPORT2 = !!doc2 && doc2.createRange && "createContextualFragment" in doc2.createRange();
  function createFragmentFromTemplate2(str) {
    var template = doc2.createElement("template");
    template.innerHTML = str;
    return template.content.childNodes[0];
  }
  function createFragmentFromRange2(str) {
    if (!range2) {
      range2 = doc2.createRange();
      range2.selectNode(doc2.body);
    }
    var fragment = range2.createContextualFragment(str);
    return fragment.childNodes[0];
  }
  function createFragmentFromWrap2(str) {
    var fragment = doc2.createElement("body");
    fragment.innerHTML = str;
    return fragment.childNodes[0];
  }
  function toElement2(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT2) {
      return createFragmentFromTemplate2(str);
    } else if (HAS_RANGE_SUPPORT2) {
      return createFragmentFromRange2(str);
    }
    return createFragmentFromWrap2(str);
  }
  function compareNodeNames2(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;
    if (fromNodeName === toNodeName) {
      return true;
    }
    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
      return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
      return toNodeName === fromNodeName.toUpperCase();
    } else {
      return false;
    }
  }
  function createElementNS2(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML2 ? doc2.createElement(name) : doc2.createElementNS(namespaceURI, name);
  }
  function moveChildren2(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
      var nextChild = curChild.nextSibling;
      toEl.appendChild(curChild);
      curChild = nextChild;
    }
    return toEl;
  }
  function syncBooleanAttrProp2(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
      fromEl[name] = toEl[name];
      if (fromEl[name]) {
        fromEl.setAttribute(name, "");
      } else {
        fromEl.removeAttribute(name);
      }
    }
  }
  var specialElHandlers2 = {
    OPTION: function(fromEl, toEl) {
      var parentNode = fromEl.parentNode;
      if (parentNode) {
        var parentName = parentNode.nodeName.toUpperCase();
        if (parentName === "OPTGROUP") {
          parentNode = parentNode.parentNode;
          parentName = parentNode && parentNode.nodeName.toUpperCase();
        }
        if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
          if (fromEl.hasAttribute("selected") && !toEl.selected) {
            fromEl.setAttribute("selected", "selected");
            fromEl.removeAttribute("selected");
          }
          parentNode.selectedIndex = -1;
        }
      }
      syncBooleanAttrProp2(fromEl, toEl, "selected");
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
      syncBooleanAttrProp2(fromEl, toEl, "checked");
      syncBooleanAttrProp2(fromEl, toEl, "disabled");
      if (fromEl.value !== toEl.value) {
        fromEl.value = toEl.value;
      }
      if (!toEl.hasAttribute("value")) {
        fromEl.removeAttribute("value");
      }
    },
    TEXTAREA: function(fromEl, toEl) {
      var newValue = toEl.value;
      if (fromEl.value !== newValue) {
        fromEl.value = newValue;
      }
      var firstChild = fromEl.firstChild;
      if (firstChild) {
        var oldValue = firstChild.nodeValue;
        if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
          return;
        }
        firstChild.nodeValue = newValue;
      }
    },
    SELECT: function(fromEl, toEl) {
      if (!toEl.hasAttribute("multiple")) {
        var selectedIndex = -1;
        var i3 = 0;
        var curChild = fromEl.firstChild;
        var optgroup;
        var nodeName;
        while (curChild) {
          nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
          if (nodeName === "OPTGROUP") {
            optgroup = curChild;
            curChild = optgroup.firstChild;
          } else {
            if (nodeName === "OPTION") {
              if (curChild.hasAttribute("selected")) {
                selectedIndex = i3;
                break;
              }
              i3++;
            }
            curChild = curChild.nextSibling;
            if (!curChild && optgroup) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          }
        }
        fromEl.selectedIndex = selectedIndex;
      }
    }
  };
  var ELEMENT_NODE2 = 1;
  var DOCUMENT_FRAGMENT_NODE$12 = 11;
  var TEXT_NODE2 = 3;
  var COMMENT_NODE2 = 8;
  function noop2() {
  }
  function defaultGetNodeKey2(node) {
    if (node) {
      return node.getAttribute && node.getAttribute("id") || node.id;
    }
  }
  function morphdomFactory2(morphAttrs3) {
    return function morphdom3(fromNode, toNode, options) {
      if (!options) {
        options = {};
      }
      if (typeof toNode === "string") {
        if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
          var toNodeHtml = toNode;
          toNode = doc2.createElement("html");
          toNode.innerHTML = toNodeHtml;
        } else {
          toNode = toElement2(toNode);
        }
      }
      var getNodeKey = options.getNodeKey || defaultGetNodeKey2;
      var onBeforeNodeAdded = options.onBeforeNodeAdded || noop2;
      var onNodeAdded = options.onNodeAdded || noop2;
      var onBeforeElUpdated = options.onBeforeElUpdated || noop2;
      var onElUpdated = options.onElUpdated || noop2;
      var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop2;
      var onNodeDiscarded = options.onNodeDiscarded || noop2;
      var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop2;
      var childrenOnly = options.childrenOnly === true;
      var fromNodesLookup = /* @__PURE__ */ Object.create(null);
      var keyedRemovalList = [];
      function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
      }
      function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (node.nodeType === ELEMENT_NODE2) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = void 0;
            if (skipKeyedNodes && (key = getNodeKey(curChild))) {
              addKeyedRemoval(key);
            } else {
              onNodeDiscarded(curChild);
              if (curChild.firstChild) {
                walkDiscardedChildNodes(curChild, skipKeyedNodes);
              }
            }
            curChild = curChild.nextSibling;
          }
        }
      }
      function removeNode(node, parentNode, skipKeyedNodes) {
        if (onBeforeNodeDiscarded(node) === false) {
          return;
        }
        if (parentNode) {
          parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
      }
      function indexTree(node) {
        if (node.nodeType === ELEMENT_NODE2 || node.nodeType === DOCUMENT_FRAGMENT_NODE$12) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = getNodeKey(curChild);
            if (key) {
              fromNodesLookup[key] = curChild;
            }
            indexTree(curChild);
            curChild = curChild.nextSibling;
          }
        }
      }
      indexTree(fromNode);
      function handleNodeAdded(el) {
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
          var nextSibling = curChild.nextSibling;
          var key = getNodeKey(curChild);
          if (key) {
            var unmatchedFromEl = fromNodesLookup[key];
            if (unmatchedFromEl && compareNodeNames2(curChild, unmatchedFromEl)) {
              curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
              morphEl(unmatchedFromEl, curChild);
            } else {
              handleNodeAdded(curChild);
            }
          } else {
            handleNodeAdded(curChild);
          }
          curChild = nextSibling;
        }
      }
      function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        while (curFromNodeChild) {
          var fromNextSibling = curFromNodeChild.nextSibling;
          if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
      }
      function morphEl(fromEl, toEl, childrenOnly2) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
          delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly2) {
          if (onBeforeElUpdated(fromEl, toEl) === false) {
            return;
          }
          morphAttrs3(fromEl, toEl);
          onElUpdated(fromEl);
          if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
            return;
          }
        }
        if (fromEl.nodeName !== "TEXTAREA") {
          morphChildren(fromEl, toEl);
        } else {
          specialElHandlers2.TEXTAREA(fromEl, toEl);
        }
      }
      function morphChildren(fromEl, toEl) {
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling;
        var toNextSibling;
        var matchingFromEl;
        outer:
          while (curToNodeChild) {
            toNextSibling = curToNodeChild.nextSibling;
            curToNodeKey = getNodeKey(curToNodeChild);
            while (curFromNodeChild) {
              fromNextSibling = curFromNodeChild.nextSibling;
              if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
                continue outer;
              }
              curFromNodeKey = getNodeKey(curFromNodeChild);
              var curFromNodeType = curFromNodeChild.nodeType;
              var isCompatible = void 0;
              if (curFromNodeType === curToNodeChild.nodeType) {
                if (curFromNodeType === ELEMENT_NODE2) {
                  if (curToNodeKey) {
                    if (curToNodeKey !== curFromNodeKey) {
                      if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                        if (fromNextSibling === matchingFromEl) {
                          isCompatible = false;
                        } else {
                          fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                          if (curFromNodeKey) {
                            addKeyedRemoval(curFromNodeKey);
                          } else {
                            removeNode(
                              curFromNodeChild,
                              fromEl,
                              true
                              /* skip keyed nodes */
                            );
                          }
                          curFromNodeChild = matchingFromEl;
                        }
                      } else {
                        isCompatible = false;
                      }
                    }
                  } else if (curFromNodeKey) {
                    isCompatible = false;
                  }
                  isCompatible = isCompatible !== false && compareNodeNames2(curFromNodeChild, curToNodeChild);
                  if (isCompatible) {
                    morphEl(curFromNodeChild, curToNodeChild);
                  }
                } else if (curFromNodeType === TEXT_NODE2 || curFromNodeType == COMMENT_NODE2) {
                  isCompatible = true;
                  if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                    curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                  }
                }
              }
              if (isCompatible) {
                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
                continue outer;
              }
              if (curFromNodeKey) {
                addKeyedRemoval(curFromNodeKey);
              } else {
                removeNode(
                  curFromNodeChild,
                  fromEl,
                  true
                  /* skip keyed nodes */
                );
              }
              curFromNodeChild = fromNextSibling;
            }
            if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames2(matchingFromEl, curToNodeChild)) {
              fromEl.appendChild(matchingFromEl);
              morphEl(matchingFromEl, curToNodeChild);
            } else {
              var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
              if (onBeforeNodeAddedResult !== false) {
                if (onBeforeNodeAddedResult) {
                  curToNodeChild = onBeforeNodeAddedResult;
                }
                if (curToNodeChild.actualize) {
                  curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc2);
                }
                fromEl.appendChild(curToNodeChild);
                handleNodeAdded(curToNodeChild);
              }
            }
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
          }
        cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers2[fromEl.nodeName];
        if (specialElHandler) {
          specialElHandler(fromEl, toEl);
        }
      }
      var morphedNode = fromNode;
      var morphedNodeType = morphedNode.nodeType;
      var toNodeType = toNode.nodeType;
      if (!childrenOnly) {
        if (morphedNodeType === ELEMENT_NODE2) {
          if (toNodeType === ELEMENT_NODE2) {
            if (!compareNodeNames2(fromNode, toNode)) {
              onNodeDiscarded(fromNode);
              morphedNode = moveChildren2(fromNode, createElementNS2(toNode.nodeName, toNode.namespaceURI));
            }
          } else {
            morphedNode = toNode;
          }
        } else if (morphedNodeType === TEXT_NODE2 || morphedNodeType === COMMENT_NODE2) {
          if (toNodeType === morphedNodeType) {
            if (morphedNode.nodeValue !== toNode.nodeValue) {
              morphedNode.nodeValue = toNode.nodeValue;
            }
            return morphedNode;
          } else {
            morphedNode = toNode;
          }
        }
      }
      if (morphedNode === toNode) {
        onNodeDiscarded(fromNode);
      } else {
        if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
          return;
        }
        morphEl(morphedNode, toNode, childrenOnly);
        if (keyedRemovalList) {
          for (var i3 = 0, len = keyedRemovalList.length; i3 < len; i3++) {
            var elToRemove = fromNodesLookup[keyedRemovalList[i3]];
            if (elToRemove) {
              removeNode(elToRemove, elToRemove.parentNode, false);
            }
          }
        }
      }
      if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        if (morphedNode.actualize) {
          morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc2);
        }
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
      }
      return morphedNode;
    };
  }
  var morphdom2 = morphdomFactory2(morphAttrs2);
  var inputTags = {
    INPUT: true,
    TEXTAREA: true,
    SELECT: true
  };
  var mutableTags = {
    INPUT: true,
    TEXTAREA: true,
    OPTION: true
  };
  var textInputTypes = {
    "datetime-local": true,
    "select-multiple": true,
    "select-one": true,
    color: true,
    date: true,
    datetime: true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    textarea: true,
    time: true,
    url: true,
    week: true
  };
  var isTextInput = (element) => {
    return inputTags[element.tagName] && textInputTypes[element.type];
  };
  var assignFocus = (selector3) => {
    const element = selector3 && selector3.nodeType === Node.ELEMENT_NODE ? selector3 : document.querySelector(selector3);
    const focusElement = element || activeElement;
    if (focusElement && focusElement.focus)
      focusElement.focus();
  };
  var dispatch2 = (element, name, detail = {}) => {
    const init4 = {
      bubbles: true,
      cancelable: true,
      detail
    };
    const evt = new CustomEvent(name, init4);
    element.dispatchEvent(evt);
    if (window.jQuery)
      window.jQuery(element).trigger(name, detail);
  };
  var xpathToElement = (xpath) => {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };
  var getClassNames = (names) => Array(names).flat();
  var processElements = (operation, callback) => {
    Array.from(operation.selectAll ? operation.element : [operation.element]).forEach(callback);
  };
  var verifyNotMutable = (detail, fromEl, toEl) => {
    if (!mutableTags[fromEl.tagName] && fromEl.isEqualNode(toEl))
      return false;
    return true;
  };
  var verifyNotPermanent = (detail, fromEl, toEl) => {
    const {
      permanentAttributeName
    } = detail;
    if (!permanentAttributeName)
      return true;
    const permanent = fromEl.closest(`[${permanentAttributeName}]`);
    if (!permanent && isTextInput(fromEl) && fromEl === activeElement) {
      const ignore = {
        value: true
      };
      Array.from(toEl.attributes).forEach((attribute) => {
        if (!ignore[attribute.name])
          fromEl.setAttribute(attribute.name, attribute.value);
      });
      return false;
    }
    return !permanent;
  };
  var activeElement;
  var shouldMorphCallbacks = [verifyNotMutable, verifyNotPermanent];
  var didMorphCallbacks = [];
  var shouldMorph = (operation) => (fromEl, toEl) => {
    return !shouldMorphCallbacks.map((callback) => {
      return typeof callback === "function" ? callback(operation, fromEl, toEl) : true;
    }).includes(false);
  };
  var didMorph = (operation) => (el) => {
    didMorphCallbacks.forEach((callback) => {
      if (typeof callback === "function")
        callback(operation, el);
    });
  };
  var DOMOperations = {
    // DOM Mutations
    append: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-append", operation);
        const {
          html,
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.insertAdjacentHTML("beforeend", html);
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-append", operation);
      });
    },
    graft: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-graft", operation);
        const {
          parent,
          focusSelector
        } = operation;
        const parentElement = document.querySelector(parent);
        if (!operation.cancel && parentElement) {
          parentElement.appendChild(element);
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-graft", operation);
      });
    },
    innerHtml: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-inner-html", operation);
        const {
          html,
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.innerHTML = html;
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-inner-html", operation);
      });
    },
    insertAdjacentHtml: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-insert-adjacent-html", operation);
        const {
          html,
          position,
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.insertAdjacentHTML(position || "beforeend", html);
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-insert-adjacent-html", operation);
      });
    },
    insertAdjacentText: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-insert-adjacent-text", operation);
        const {
          text,
          position,
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.insertAdjacentText(position || "beforeend", text);
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-insert-adjacent-text", operation);
      });
    },
    morph: (operation) => {
      processElements(operation, (element) => {
        const {
          html
        } = operation;
        const template = document.createElement("template");
        template.innerHTML = String(html).trim();
        operation.content = template.content;
        dispatch2(element, "cable-ready:before-morph", operation);
        const {
          childrenOnly,
          focusSelector
        } = operation;
        const parent = element.parentElement;
        const ordinal = Array.from(parent.children).indexOf(element);
        if (!operation.cancel) {
          morphdom2(element, childrenOnly ? template.content : template.innerHTML, {
            childrenOnly: !!childrenOnly,
            onBeforeElUpdated: shouldMorph(operation),
            onElUpdated: didMorph(operation)
          });
          assignFocus(focusSelector);
        }
        dispatch2(parent.children[ordinal], "cable-ready:after-morph", operation);
      });
    },
    outerHtml: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-outer-html", operation);
        const {
          html,
          focusSelector
        } = operation;
        const parent = element.parentElement;
        const ordinal = Array.from(parent.children).indexOf(element);
        if (!operation.cancel) {
          element.outerHTML = html;
          assignFocus(focusSelector);
        }
        dispatch2(parent.children[ordinal], "cable-ready:after-outer-html", operation);
      });
    },
    prepend: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-prepend", operation);
        const {
          html,
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.insertAdjacentHTML("afterbegin", html);
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-prepend", operation);
      });
    },
    remove: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-remove", operation);
        const {
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.remove();
          assignFocus(focusSelector);
        }
        dispatch2(document, "cable-ready:after-remove", operation);
      });
    },
    replace: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-replace", operation);
        const {
          html,
          focusSelector
        } = operation;
        const parent = element.parentElement;
        const ordinal = Array.from(parent.children).indexOf(element);
        if (!operation.cancel) {
          element.outerHTML = html;
          assignFocus(focusSelector);
        }
        dispatch2(parent.children[ordinal], "cable-ready:after-replace", operation);
      });
    },
    textContent: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-text-content", operation);
        const {
          text,
          focusSelector
        } = operation;
        if (!operation.cancel) {
          element.textContent = text;
          assignFocus(focusSelector);
        }
        dispatch2(element, "cable-ready:after-text-content", operation);
      });
    },
    // Element Property Mutations
    addCssClass: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-add-css-class", operation);
        const {
          name
        } = operation;
        if (!operation.cancel)
          element.classList.add(...getClassNames(name));
        dispatch2(element, "cable-ready:after-add-css-class", operation);
      });
    },
    removeAttribute: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-remove-attribute", operation);
        const {
          name
        } = operation;
        if (!operation.cancel)
          element.removeAttribute(name);
        dispatch2(element, "cable-ready:after-remove-attribute", operation);
      });
    },
    removeCssClass: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-remove-css-class", operation);
        const {
          name
        } = operation;
        if (!operation.cancel)
          element.classList.remove(...getClassNames(name));
        dispatch2(element, "cable-ready:after-remove-css-class", operation);
      });
    },
    setAttribute: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-set-attribute", operation);
        const {
          name,
          value
        } = operation;
        if (!operation.cancel)
          element.setAttribute(name, value);
        dispatch2(element, "cable-ready:after-set-attribute", operation);
      });
    },
    setDatasetProperty: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-set-dataset-property", operation);
        const {
          name,
          value
        } = operation;
        if (!operation.cancel)
          element.dataset[name] = value;
        dispatch2(element, "cable-ready:after-set-dataset-property", operation);
      });
    },
    setProperty: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-set-property", operation);
        const {
          name,
          value
        } = operation;
        if (!operation.cancel && name in element)
          element[name] = value;
        dispatch2(element, "cable-ready:after-set-property", operation);
      });
    },
    setStyle: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-set-style", operation);
        const {
          name,
          value
        } = operation;
        if (!operation.cancel)
          element.style[name] = value;
        dispatch2(element, "cable-ready:after-set-style", operation);
      });
    },
    setStyles: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-set-styles", operation);
        const {
          styles
        } = operation;
        for (let [name, value] of Object.entries(styles)) {
          if (!operation.cancel)
            element.style[name] = value;
        }
        dispatch2(element, "cable-ready:after-set-styles", operation);
      });
    },
    setValue: (operation) => {
      processElements(operation, (element) => {
        dispatch2(element, "cable-ready:before-set-value", operation);
        const {
          value
        } = operation;
        if (!operation.cancel)
          element.value = value;
        dispatch2(element, "cable-ready:after-set-value", operation);
      });
    },
    // DOM Events
    dispatchEvent: (operation) => {
      processElements(operation, (element) => {
        const {
          name,
          detail
        } = operation;
        dispatch2(element, name, detail);
      });
    },
    // Browser Manipulations
    clearStorage: (operation) => {
      dispatch2(document, "cable-ready:before-clear-storage", operation);
      const {
        type
      } = operation;
      const storage = type === "session" ? sessionStorage : localStorage;
      if (!operation.cancel)
        storage.clear();
      dispatch2(document, "cable-ready:after-clear-storage", operation);
    },
    go: (operation) => {
      dispatch2(window, "cable-ready:before-go", operation);
      const {
        delta
      } = operation;
      if (!operation.cancel)
        history.go(delta);
      dispatch2(window, "cable-ready:after-go", operation);
    },
    pushState: (operation) => {
      dispatch2(window, "cable-ready:before-push-state", operation);
      const {
        state,
        title,
        url
      } = operation;
      if (!operation.cancel)
        history.pushState(state || {}, title || "", url);
      dispatch2(window, "cable-ready:after-push-state", operation);
    },
    removeStorageItem: (operation) => {
      dispatch2(document, "cable-ready:before-remove-storage-item", operation);
      const {
        key,
        type
      } = operation;
      const storage = type === "session" ? sessionStorage : localStorage;
      if (!operation.cancel)
        storage.removeItem(key);
      dispatch2(document, "cable-ready:after-remove-storage-item", operation);
    },
    replaceState: (operation) => {
      dispatch2(window, "cable-ready:before-replace-state", operation);
      const {
        state,
        title,
        url
      } = operation;
      if (!operation.cancel)
        history.replaceState(state || {}, title || "", url);
      dispatch2(window, "cable-ready:after-replace-state", operation);
    },
    scrollIntoView: (operation) => {
      const {
        element
      } = operation;
      dispatch2(element, "cable-ready:before-scroll-into-view", operation);
      if (!operation.cancel)
        element.scrollIntoView(operation);
      dispatch2(element, "cable-ready:after-scroll-into-view", operation);
    },
    setCookie: (operation) => {
      dispatch2(document, "cable-ready:before-set-cookie", operation);
      const {
        cookie
      } = operation;
      if (!operation.cancel)
        document.cookie = cookie;
      dispatch2(document, "cable-ready:after-set-cookie", operation);
    },
    setFocus: (operation) => {
      const {
        element
      } = operation;
      dispatch2(element, "cable-ready:before-set-focus", operation);
      if (!operation.cancel)
        assignFocus(element);
      dispatch2(element, "cable-ready:after-set-focus", operation);
    },
    setStorageItem: (operation) => {
      dispatch2(document, "cable-ready:before-set-storage-item", operation);
      const {
        key,
        value,
        type
      } = operation;
      const storage = type === "session" ? sessionStorage : localStorage;
      if (!operation.cancel)
        storage.setItem(key, value);
      dispatch2(document, "cable-ready:after-set-storage-item", operation);
    },
    // Notifications
    consoleLog: (operation) => {
      const {
        message,
        level
      } = operation;
      level && ["warn", "info", "error"].includes(level) ? console[level](message) : console.log(message);
    },
    notification: (operation) => {
      dispatch2(document, "cable-ready:before-notification", operation);
      const {
        title,
        options
      } = operation;
      if (!operation.cancel)
        Notification.requestPermission().then((result) => {
          operation.permission = result;
          if (result === "granted")
            new Notification(title || "", options);
        });
      dispatch2(document, "cable-ready:after-notification", operation);
    },
    playSound: (operation) => {
      dispatch2(document, "cable-ready:before-play-sound", operation);
      const {
        src
      } = operation;
      if (!operation.cancel) {
        const canplaythrough = () => {
          document.audio.removeEventListener("canplaythrough", canplaythrough);
          document.audio.play();
        };
        const ended = () => {
          document.audio.removeEventListener("ended", canplaythrough);
          dispatch2(document, "cable-ready:after-play-sound", operation);
        };
        document.audio.addEventListener("canplaythrough", canplaythrough);
        document.audio.addEventListener("ended", ended);
        document.audio.src = src;
        document.audio.play();
      } else
        dispatch2(document, "cable-ready:after-play-sound", operation);
    }
  };
  var perform = (operations, options = {
    emitMissingElementWarnings: true
  }) => {
    for (let name in operations) {
      if (operations.hasOwnProperty(name)) {
        const entries = operations[name];
        for (let i3 = 0; i3 < entries.length; i3++) {
          const operation = entries[i3];
          try {
            if (operation.selector) {
              operation.element = operation.xpath ? xpathToElement(operation.selector) : document[operation.selectAll ? "querySelectorAll" : "querySelector"](operation.selector);
            } else {
              operation.element = document;
            }
            if (operation.element || options.emitMissingElementWarnings) {
              activeElement = document.activeElement;
              DOMOperations[name](operation);
            }
          } catch (e) {
            if (operation.element) {
              console.error(`CableReady detected an error in ${name}: ${e.message}. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`);
              console.error(e);
            } else {
              console.log(`CableReady ${name} failed due to missing DOM element for selector: '${operation.selector}'`);
            }
          }
        }
      }
    }
  };
  var performAsync = (operations, options = {
    emitMissingElementWarnings: true
  }) => {
    return new Promise((resolve, reject) => {
      try {
        resolve(perform(operations, options));
      } catch (err) {
        reject(err);
      }
    });
  };
  document.addEventListener("DOMContentLoaded", function() {
    if (!document.audio) {
      document.audio = new Audio("data:audio/mpeg;base64,//OExAAAAAAAAAAAAEluZm8AAAAHAAAABAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P39/f39/f39/f39/f39/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/AAAAAAAAAAAAAAAAAAAAAAAAAAAAJAa/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MUxAAAAANIAAAAAExBTUUzLjk2LjFV//MUxAsAAANIAAAAAFVVVVVVVVVVVVVV//MUxBYAAANIAAAAAFVVVVVVVVVVVVVV//MUxCEAAANIAAAAAFVVVVVVVVVVVVVV");
      const unlockAudio = () => {
        document.body.removeEventListener("click", unlockAudio);
        document.body.removeEventListener("touchstart", unlockAudio);
        document.audio.play().then(() => {
        }).catch(() => {
        });
      };
      document.body.addEventListener("click", unlockAudio);
      document.body.addEventListener("touchstart", unlockAudio);
    }
  });
  var CableReady = {
    perform,
    performAsync,
    DOMOperations,
    shouldMorphCallbacks,
    didMorphCallbacks
  };
  function _assertThisInitialized$1(self2) {
    if (self2 === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self2;
  }
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  var _config = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: {
      lineHeight: ""
    }
  };
  var _defaults = {
    duration: 0.5,
    overwrite: false,
    delay: 0
  };
  var _suppressOverwrites;
  var _bigNum = 1e8;
  var _tinyNum = 1 / _bigNum;
  var _2PI = Math.PI * 2;
  var _HALF_PI = _2PI / 4;
  var _gsID = 0;
  var _sqrt = Math.sqrt;
  var _cos = Math.cos;
  var _sin = Math.sin;
  var _isString = function _isString2(value) {
    return typeof value === "string";
  };
  var _isFunction = function _isFunction2(value) {
    return typeof value === "function";
  };
  var _isNumber = function _isNumber2(value) {
    return typeof value === "number";
  };
  var _isUndefined = function _isUndefined2(value) {
    return typeof value === "undefined";
  };
  var _isObject = function _isObject2(value) {
    return typeof value === "object";
  };
  var _isNotFalse = function _isNotFalse2(value) {
    return value !== false;
  };
  var _windowExists = function _windowExists2() {
    return typeof window !== "undefined";
  };
  var _isFuncOrString = function _isFuncOrString2(value) {
    return _isFunction(value) || _isString(value);
  };
  var _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
  };
  var _isArray = Array.isArray;
  var _strictNumExp = /(?:-?\.?\d|\.)+/gi;
  var _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g;
  var _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g;
  var _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi;
  var _relExp = /[+-]=-?[.\d]+/;
  var _delimitedValueExp = /[^,'"\[\]\s]+/gi;
  var _unitExp = /[\d.+\-=]+(?:e[-+]\d*)*/i;
  var _globalTimeline;
  var _win;
  var _coreInitted;
  var _doc;
  var _globals = {};
  var _installScope = {};
  var _coreReady;
  var _install = function _install2(scope) {
    return (_installScope = _merge(scope, _globals)) && gsap;
  };
  var _missingPlugin = function _missingPlugin2(property, value) {
    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
  };
  var _warn = function _warn2(message, suppress) {
    return !suppress && console.warn(message);
  };
  var _addGlobal = function _addGlobal2(name, obj) {
    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
  };
  var _emptyFunc = function _emptyFunc2() {
    return 0;
  };
  var _reservedProps = {};
  var _lazyTweens = [];
  var _lazyLookup = {};
  var _lastRenderedFrame;
  var _plugins = {};
  var _effects = {};
  var _nextGCFrame = 30;
  var _harnessPlugins = [];
  var _callbackNames = "";
  var _harness = function _harness2(targets) {
    var target = targets[0], harnessPlugin, i3;
    _isObject(target) || _isFunction(target) || (targets = [targets]);
    if (!(harnessPlugin = (target._gsap || {}).harness)) {
      i3 = _harnessPlugins.length;
      while (i3-- && !_harnessPlugins[i3].targetTest(target)) {
      }
      harnessPlugin = _harnessPlugins[i3];
    }
    i3 = targets.length;
    while (i3--) {
      targets[i3] && (targets[i3]._gsap || (targets[i3]._gsap = new GSCache(targets[i3], harnessPlugin))) || targets.splice(i3, 1);
    }
    return targets;
  };
  var _getCache = function _getCache2(target) {
    return target._gsap || _harness(toArray(target))[0]._gsap;
  };
  var _getProperty = function _getProperty2(target, property, v3) {
    return (v3 = target[property]) && _isFunction(v3) ? target[property]() : _isUndefined(v3) && target.getAttribute && target.getAttribute(property) || v3;
  };
  var _forEachName = function _forEachName2(names, func) {
    return (names = names.split(",")).forEach(func) || names;
  };
  var _round = function _round2(value) {
    return Math.round(value * 1e5) / 1e5 || 0;
  };
  var _roundPrecise = function _roundPrecise2(value) {
    return Math.round(value * 1e7) / 1e7 || 0;
  };
  var _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
    var l3 = toFind.length, i3 = 0;
    for (; toSearch.indexOf(toFind[i3]) < 0 && ++i3 < l3; ) {
    }
    return i3 < l3;
  };
  var _lazyRender = function _lazyRender2() {
    var l3 = _lazyTweens.length, a3 = _lazyTweens.slice(0), i3, tween;
    _lazyLookup = {};
    _lazyTweens.length = 0;
    for (i3 = 0; i3 < l3; i3++) {
      tween = a3[i3];
      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
    }
  };
  var _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
    _lazyTweens.length && _lazyRender();
    animation.render(time, suppressEvents, force);
    _lazyTweens.length && _lazyRender();
  };
  var _numericIfPossible = function _numericIfPossible2(value) {
    var n3 = parseFloat(value);
    return (n3 || n3 === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n3 : _isString(value) ? value.trim() : value;
  };
  var _passThrough = function _passThrough2(p3) {
    return p3;
  };
  var _setDefaults = function _setDefaults2(obj, defaults2) {
    for (var p3 in defaults2) {
      p3 in obj || (obj[p3] = defaults2[p3]);
    }
    return obj;
  };
  var _setKeyframeDefaults = function _setKeyframeDefaults2(obj, defaults2) {
    for (var p3 in defaults2) {
      p3 in obj || p3 === "duration" || p3 === "ease" || (obj[p3] = defaults2[p3]);
    }
  };
  var _merge = function _merge2(base, toMerge) {
    for (var p3 in toMerge) {
      base[p3] = toMerge[p3];
    }
    return base;
  };
  var _mergeDeep = function _mergeDeep2(base, toMerge) {
    for (var p3 in toMerge) {
      p3 !== "__proto__" && p3 !== "constructor" && p3 !== "prototype" && (base[p3] = _isObject(toMerge[p3]) ? _mergeDeep2(base[p3] || (base[p3] = {}), toMerge[p3]) : toMerge[p3]);
    }
    return base;
  };
  var _copyExcluding = function _copyExcluding2(obj, excluding) {
    var copy = {}, p3;
    for (p3 in obj) {
      p3 in excluding || (copy[p3] = obj[p3]);
    }
    return copy;
  };
  var _inheritDefaults = function _inheritDefaults2(vars) {
    var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;
    if (_isNotFalse(vars.inherit)) {
      while (parent) {
        func(vars, parent.vars.defaults);
        parent = parent.parent || parent._dp;
      }
    }
    return vars;
  };
  var _arraysMatch = function _arraysMatch2(a1, a22) {
    var i3 = a1.length, match = i3 === a22.length;
    while (match && i3-- && a1[i3] === a22[i3]) {
    }
    return i3 < 0;
  };
  var _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }
    if (lastProp === void 0) {
      lastProp = "_last";
    }
    var prev = parent[lastProp], t2;
    if (sortBy) {
      t2 = child[sortBy];
      while (prev && prev[sortBy] > t2) {
        prev = prev._prev;
      }
    }
    if (prev) {
      child._next = prev._next;
      prev._next = child;
    } else {
      child._next = parent[firstProp];
      parent[firstProp] = child;
    }
    if (child._next) {
      child._next._prev = child;
    } else {
      parent[lastProp] = child;
    }
    child._prev = prev;
    child.parent = child._dp = parent;
    return child;
  };
  var _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }
    if (lastProp === void 0) {
      lastProp = "_last";
    }
    var prev = child._prev, next = child._next;
    if (prev) {
      prev._next = next;
    } else if (parent[firstProp] === child) {
      parent[firstProp] = next;
    }
    if (next) {
      next._prev = prev;
    } else if (parent[lastProp] === child) {
      parent[lastProp] = prev;
    }
    child._next = child._prev = child.parent = null;
  };
  var _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
    child._act = 0;
  };
  var _uncache = function _uncache2(animation, child) {
    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
      var a3 = animation;
      while (a3) {
        a3._dirty = 1;
        a3 = a3.parent;
      }
    }
    return animation;
  };
  var _recacheAncestors = function _recacheAncestors2(animation) {
    var parent = animation.parent;
    while (parent && parent.parent) {
      parent._dirty = 1;
      parent.totalDuration();
      parent = parent.parent;
    }
    return animation;
  };
  var _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
    return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
  };
  var _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
  };
  var _animationCycle = function _animationCycle2(tTime, cycleDuration) {
    var whole = Math.floor(tTime /= cycleDuration);
    return tTime && whole === tTime ? whole - 1 : whole;
  };
  var _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
  };
  var _setEnd = function _setEnd2(animation) {
    return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
  };
  var _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
    var parent = animation._dp;
    if (parent && parent.smoothChildTiming && animation._ts) {
      animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
      _setEnd(animation);
      parent._dirty || _uncache(parent, animation);
    }
    return animation;
  };
  var _postAddChecks = function _postAddChecks2(timeline2, child) {
    var t2;
    if (child._time || child._initted && !child._dur) {
      t2 = _parentToChildTotalTime(timeline2.rawTime(), child);
      if (!child._dur || _clamp(0, child.totalDuration(), t2) - child._tTime > _tinyNum) {
        child.render(t2, true);
      }
    }
    if (_uncache(timeline2, child)._dp && timeline2._initted && timeline2._time >= timeline2._dur && timeline2._ts) {
      if (timeline2._dur < timeline2.duration()) {
        t2 = timeline2;
        while (t2._dp) {
          t2.rawTime() >= 0 && t2.totalTime(t2._tTime);
          t2 = t2._dp;
        }
      }
      timeline2._zTime = -_tinyNum;
    }
  };
  var _addToTimeline = function _addToTimeline2(timeline2, child, position, skipChecks) {
    child.parent && _removeFromParent(child);
    child._start = _roundPrecise((_isNumber(position) ? position : position || timeline2 !== _globalTimeline ? _parsePosition(timeline2, position, child) : timeline2._time) + child._delay);
    child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
    _addLinkedListItem(timeline2, child, "_first", "_last", timeline2._sort ? "_start" : 0);
    _isFromOrFromStart(child) || (timeline2._recent = child);
    skipChecks || _postAddChecks(timeline2, child);
    return timeline2;
  };
  var _scrollTrigger = function _scrollTrigger2(animation, trigger2) {
    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger2)) && _globals.ScrollTrigger.create(trigger2, animation);
  };
  var _attemptInitTween = function _attemptInitTween2(tween, totalTime, force, suppressEvents) {
    _initTween(tween, totalTime);
    if (!tween._initted) {
      return 1;
    }
    if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
      _lazyTweens.push(tween);
      tween._lazy = [totalTime, suppressEvents];
      return 1;
    }
  };
  var _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
    var parent = _ref.parent;
    return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
  };
  var _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
    var data = _ref2.data;
    return data === "isFromStart" || data === "isStart";
  };
  var _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
    var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
    if (repeatDelay && tween._repeat) {
      tTime = _clamp(0, tween._tDur, totalTime);
      iteration = _animationCycle(tTime, repeatDelay);
      prevIteration = _animationCycle(tween._tTime, repeatDelay);
      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
      if (iteration !== prevIteration) {
        prevRatio = 1 - ratio;
        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
      }
    }
    if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
        return;
      }
      prevIteration = tween._zTime;
      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
      suppressEvents || (suppressEvents = totalTime && !prevIteration);
      tween.ratio = ratio;
      tween._from && (ratio = 1 - ratio);
      tween._time = 0;
      tween._tTime = tTime;
      pt = tween._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
      tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
      tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
        ratio && _removeFromParent(tween, 1);
        if (!suppressEvents) {
          _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
          tween._prom && tween._prom();
        }
      }
    } else if (!tween._zTime) {
      tween._zTime = totalTime;
    }
  };
  var _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
    var child;
    if (time > prevTime) {
      child = animation._first;
      while (child && child._start <= time) {
        if (!child._dur && child.data === "isPause" && child._start > prevTime) {
          return child;
        }
        child = child._next;
      }
    } else {
      child = animation._last;
      while (child && child._start >= time) {
        if (!child._dur && child.data === "isPause" && child._start < prevTime) {
          return child;
        }
        child = child._prev;
      }
    }
  };
  var _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
    var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
    animation._dur = dur;
    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
    totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
    skipUncache || _uncache(animation.parent, animation);
    return animation;
  };
  var _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
  };
  var _zeroPosition = {
    _start: 0,
    endTime: _emptyFunc,
    totalDuration: _emptyFunc
  };
  var _parsePosition = function _parsePosition2(animation, position, percentAnimation) {
    var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur, i3, offset2, isPercent;
    if (_isString(position) && (isNaN(position) || position in labels)) {
      offset2 = position.charAt(0);
      isPercent = position.substr(-1) === "%";
      i3 = position.indexOf("=");
      if (offset2 === "<" || offset2 === ">") {
        i3 >= 0 && (position = position.replace(/=/, ""));
        return (offset2 === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i3 < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
      }
      if (i3 < 0) {
        position in labels || (labels[position] = clippedDuration);
        return labels[position];
      }
      offset2 = parseFloat(position.charAt(i3 - 1) + position.substr(i3 + 1));
      if (isPercent && percentAnimation) {
        offset2 = offset2 / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
      }
      return i3 > 1 ? _parsePosition2(animation, position.substr(0, i3 - 1), percentAnimation) + offset2 : clippedDuration + offset2;
    }
    return position == null ? clippedDuration : +position;
  };
  var _createTweenType = function _createTweenType2(type, params, timeline2) {
    var isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
    isLegacy && (vars.duration = params[1]);
    vars.parent = timeline2;
    if (type) {
      irVars = vars;
      parent = timeline2;
      while (parent && !("immediateRender" in irVars)) {
        irVars = parent.vars.defaults || {};
        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
      }
      vars.immediateRender = _isNotFalse(irVars.immediateRender);
      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
    }
    return new Tween(params[0], vars, params[varsIndex + 1]);
  };
  var _conditionalReturn = function _conditionalReturn2(value, func) {
    return value || value === 0 ? func(value) : func;
  };
  var _clamp = function _clamp2(min2, max2, value) {
    return value < min2 ? min2 : value > max2 ? max2 : value;
  };
  var getUnit = function getUnit2(value) {
    if (typeof value !== "string") {
      return "";
    }
    var v3 = _unitExp.exec(value);
    return v3 ? value.substr(v3.index + v3[0].length) : "";
  };
  var clamp = function clamp2(min2, max2, value) {
    return _conditionalReturn(value, function(v3) {
      return _clamp(min2, max2, v3);
    });
  };
  var _slice = [].slice;
  var _isArrayLike = function _isArrayLike2(value, nonEmpty) {
    return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
  };
  var _flatten = function _flatten2(ar, leaveStrings, accumulator) {
    if (accumulator === void 0) {
      accumulator = [];
    }
    return ar.forEach(function(value) {
      var _accumulator;
      return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
    }) || accumulator;
  };
  var toArray = function toArray2(value, scope, leaveStrings) {
    return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
  };
  var selector = function selector2(value) {
    value = toArray(value)[0] || _warn("Invalid scope") || {};
    return function(v3) {
      var el = value.current || value.nativeElement || value;
      return toArray(v3, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc.createElement("div") : value);
    };
  };
  var shuffle = function shuffle2(a3) {
    return a3.sort(function() {
      return 0.5 - Math.random();
    });
  };
  var distribute = function distribute2(v3) {
    if (_isFunction(v3)) {
      return v3;
    }
    var vars = _isObject(v3) ? v3 : {
      each: v3
    }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
    if (_isString(from)) {
      ratioX = ratioY = {
        center: 0.5,
        edges: 0.5,
        end: 1
      }[from] || 0;
    } else if (!isDecimal && ratios) {
      ratioX = from[0];
      ratioY = from[1];
    }
    return function(i3, target, a3) {
      var l3 = (a3 || vars).length, distances = cache[l3], originX, originY, x3, y3, d3, j3, max2, min2, wrapAt;
      if (!distances) {
        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];
        if (!wrapAt) {
          max2 = -_bigNum;
          while (max2 < (max2 = a3[wrapAt++].getBoundingClientRect().left) && wrapAt < l3) {
          }
          wrapAt--;
        }
        distances = cache[l3] = [];
        originX = ratios ? Math.min(wrapAt, l3) * ratioX - 0.5 : from % wrapAt;
        originY = ratios ? l3 * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
        max2 = 0;
        min2 = _bigNum;
        for (j3 = 0; j3 < l3; j3++) {
          x3 = j3 % wrapAt - originX;
          y3 = originY - (j3 / wrapAt | 0);
          distances[j3] = d3 = !axis ? _sqrt(x3 * x3 + y3 * y3) : Math.abs(axis === "y" ? y3 : x3);
          d3 > max2 && (max2 = d3);
          d3 < min2 && (min2 = d3);
        }
        from === "random" && shuffle(distances);
        distances.max = max2 - min2;
        distances.min = min2;
        distances.v = l3 = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l3 ? l3 - 1 : !axis ? Math.max(wrapAt, l3 / wrapAt) : axis === "y" ? l3 / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
        distances.b = l3 < 0 ? base - l3 : base;
        distances.u = getUnit(vars.amount || vars.each) || 0;
        ease = ease && l3 < 0 ? _invertEase(ease) : ease;
      }
      l3 = (distances[i3] - distances.min) / distances.max || 0;
      return _roundPrecise(distances.b + (ease ? ease(l3) : l3) * distances.v) + distances.u;
    };
  };
  var _roundModifier = function _roundModifier2(v3) {
    var p3 = Math.pow(10, ((v3 + "").split(".")[1] || "").length);
    return function(raw) {
      var n3 = Math.round(parseFloat(raw) / v3) * v3 * p3;
      return (n3 - n3 % 1) / p3 + (_isNumber(raw) ? 0 : getUnit(raw));
    };
  };
  var snap = function snap2(snapTo, value) {
    var isArray = _isArray(snapTo), radius, is2D;
    if (!isArray && _isObject(snapTo)) {
      radius = isArray = snapTo.radius || _bigNum;
      if (snapTo.values) {
        snapTo = toArray(snapTo.values);
        if (is2D = !_isNumber(snapTo[0])) {
          radius *= radius;
        }
      } else {
        snapTo = _roundModifier(snapTo.increment);
      }
    }
    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
      is2D = snapTo(raw);
      return Math.abs(is2D - raw) <= radius ? is2D : raw;
    } : function(raw) {
      var x3 = parseFloat(is2D ? raw.x : raw), y3 = parseFloat(is2D ? raw.y : 0), min2 = _bigNum, closest = 0, i3 = snapTo.length, dx, dy;
      while (i3--) {
        if (is2D) {
          dx = snapTo[i3].x - x3;
          dy = snapTo[i3].y - y3;
          dx = dx * dx + dy * dy;
        } else {
          dx = Math.abs(snapTo[i3] - x3);
        }
        if (dx < min2) {
          min2 = dx;
          closest = i3;
        }
      }
      closest = !radius || min2 <= radius ? snapTo[closest] : raw;
      return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
    });
  };
  var random = function random2(min2, max2, roundingIncrement, returnFunction) {
    return _conditionalReturn(_isArray(min2) ? !max2 : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
      return _isArray(min2) ? min2[~~(Math.random() * min2.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min2 - roundingIncrement / 2 + Math.random() * (max2 - min2 + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
    });
  };
  var pipe = function pipe2() {
    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
      functions[_key] = arguments[_key];
    }
    return function(value) {
      return functions.reduce(function(v3, f3) {
        return f3(v3);
      }, value);
    };
  };
  var unitize = function unitize2(func, unit) {
    return function(value) {
      return func(parseFloat(value)) + (unit || getUnit(value));
    };
  };
  var normalize = function normalize2(min2, max2, value) {
    return mapRange(min2, max2, 0, 1, value);
  };
  var _wrapArray = function _wrapArray2(a3, wrapper, value) {
    return _conditionalReturn(value, function(index) {
      return a3[~~wrapper(index)];
    });
  };
  var wrap = function wrap2(min2, max2, value) {
    var range4 = max2 - min2;
    return _isArray(min2) ? _wrapArray(min2, wrap2(0, min2.length), max2) : _conditionalReturn(value, function(value2) {
      return (range4 + (value2 - min2) % range4) % range4 + min2;
    });
  };
  var wrapYoyo = function wrapYoyo2(min2, max2, value) {
    var range4 = max2 - min2, total = range4 * 2;
    return _isArray(min2) ? _wrapArray(min2, wrapYoyo2(0, min2.length - 1), max2) : _conditionalReturn(value, function(value2) {
      value2 = (total + (value2 - min2) % total) % total || 0;
      return min2 + (value2 > range4 ? total - value2 : value2);
    });
  };
  var _replaceRandom = function _replaceRandom2(value) {
    var prev = 0, s3 = "", i3, nums, end2, isArray;
    while (~(i3 = value.indexOf("random(", prev))) {
      end2 = value.indexOf(")", i3);
      isArray = value.charAt(i3 + 7) === "[";
      nums = value.substr(i3 + 7, end2 - i3 - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
      s3 += value.substr(prev, i3 - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
      prev = end2 + 1;
    }
    return s3 + value.substr(prev, value.length - prev);
  };
  var mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
    var inRange = inMax - inMin, outRange = outMax - outMin;
    return _conditionalReturn(value, function(value2) {
      return outMin + ((value2 - inMin) / inRange * outRange || 0);
    });
  };
  var interpolate = function interpolate2(start2, end2, progress, mutate) {
    var func = isNaN(start2 + end2) ? 0 : function(p4) {
      return (1 - p4) * start2 + p4 * end2;
    };
    if (!func) {
      var isString = _isString(start2), master = {}, p3, i3, interpolators, l3, il;
      progress === true && (mutate = 1) && (progress = null);
      if (isString) {
        start2 = {
          p: start2
        };
        end2 = {
          p: end2
        };
      } else if (_isArray(start2) && !_isArray(end2)) {
        interpolators = [];
        l3 = start2.length;
        il = l3 - 2;
        for (i3 = 1; i3 < l3; i3++) {
          interpolators.push(interpolate2(start2[i3 - 1], start2[i3]));
        }
        l3--;
        func = function func2(p4) {
          p4 *= l3;
          var i4 = Math.min(il, ~~p4);
          return interpolators[i4](p4 - i4);
        };
        progress = end2;
      } else if (!mutate) {
        start2 = _merge(_isArray(start2) ? [] : {}, start2);
      }
      if (!interpolators) {
        for (p3 in end2) {
          _addPropTween.call(master, start2, p3, "get", end2[p3]);
        }
        func = function func2(p4) {
          return _renderPropTweens(p4, master) || (isString ? start2.p : start2);
        };
      }
    }
    return _conditionalReturn(progress, func);
  };
  var _getLabelInDirection = function _getLabelInDirection2(timeline2, fromTime, backward) {
    var labels = timeline2.labels, min2 = _bigNum, p3, distance, label;
    for (p3 in labels) {
      distance = labels[p3] - fromTime;
      if (distance < 0 === !!backward && distance && min2 > (distance = Math.abs(distance))) {
        label = p3;
        min2 = distance;
      }
    }
    return label;
  };
  var _callback = function _callback2(animation, type, executeLazyFirst) {
    var v3 = animation.vars, callback = v3[type], params, scope;
    if (!callback) {
      return;
    }
    params = v3[type + "Params"];
    scope = v3.callbackScope || animation;
    executeLazyFirst && _lazyTweens.length && _lazyRender();
    return params ? callback.apply(scope, params) : callback.call(scope);
  };
  var _interrupt = function _interrupt2(animation) {
    _removeFromParent(animation);
    animation.scrollTrigger && animation.scrollTrigger.kill(false);
    animation.progress() < 1 && _callback(animation, "onInterrupt");
    return animation;
  };
  var _quickTween;
  var _createPlugin = function _createPlugin2(config3) {
    config3 = !config3.name && config3["default"] || config3;
    var name = config3.name, isFunc = _isFunction(config3), Plugin = name && !isFunc && config3.init ? function() {
      this._props = [];
    } : config3, instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    }, statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };
    _wake();
    if (config3 !== Plugin) {
      if (_plugins[name]) {
        return;
      }
      _setDefaults(Plugin, _setDefaults(_copyExcluding(config3, instanceDefaults), statics));
      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config3, statics)));
      _plugins[Plugin.prop = name] = Plugin;
      if (config3.targetTest) {
        _harnessPlugins.push(Plugin);
        _reservedProps[name] = 1;
      }
      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
    }
    _addGlobal(name, Plugin);
    config3.register && config3.register(gsap, Plugin, PropTween);
  };
  var _255 = 255;
  var _colorLookup = {
    aqua: [0, _255, _255],
    lime: [0, _255, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, _255],
    navy: [0, 0, 128],
    white: [_255, _255, _255],
    olive: [128, 128, 0],
    yellow: [_255, _255, 0],
    orange: [_255, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [_255, 0, 0],
    pink: [_255, 192, 203],
    cyan: [0, _255, _255],
    transparent: [_255, _255, _255, 0]
  };
  var _hue = function _hue2(h3, m1, m22) {
    h3 = h3 < 0 ? h3 + 1 : h3 > 1 ? h3 - 1 : h3;
    return (h3 * 6 < 1 ? m1 + (m22 - m1) * h3 * 6 : h3 < 0.5 ? m22 : h3 * 3 < 2 ? m1 + (m22 - m1) * (2 / 3 - h3) * 6 : m1) * _255 + 0.5 | 0;
  };
  var splitColor = function splitColor2(v3, toHSL, forceAlpha) {
    var a3 = !v3 ? _colorLookup.black : _isNumber(v3) ? [v3 >> 16, v3 >> 8 & _255, v3 & _255] : 0, r2, g3, b3, h3, s3, l3, max2, min2, d3, wasHSL;
    if (!a3) {
      if (v3.substr(-1) === ",") {
        v3 = v3.substr(0, v3.length - 1);
      }
      if (_colorLookup[v3]) {
        a3 = _colorLookup[v3];
      } else if (v3.charAt(0) === "#") {
        if (v3.length < 6) {
          r2 = v3.charAt(1);
          g3 = v3.charAt(2);
          b3 = v3.charAt(3);
          v3 = "#" + r2 + r2 + g3 + g3 + b3 + b3 + (v3.length === 5 ? v3.charAt(4) + v3.charAt(4) : "");
        }
        if (v3.length === 9) {
          a3 = parseInt(v3.substr(1, 6), 16);
          return [a3 >> 16, a3 >> 8 & _255, a3 & _255, parseInt(v3.substr(7), 16) / 255];
        }
        v3 = parseInt(v3.substr(1), 16);
        a3 = [v3 >> 16, v3 >> 8 & _255, v3 & _255];
      } else if (v3.substr(0, 3) === "hsl") {
        a3 = wasHSL = v3.match(_strictNumExp);
        if (!toHSL) {
          h3 = +a3[0] % 360 / 360;
          s3 = +a3[1] / 100;
          l3 = +a3[2] / 100;
          g3 = l3 <= 0.5 ? l3 * (s3 + 1) : l3 + s3 - l3 * s3;
          r2 = l3 * 2 - g3;
          a3.length > 3 && (a3[3] *= 1);
          a3[0] = _hue(h3 + 1 / 3, r2, g3);
          a3[1] = _hue(h3, r2, g3);
          a3[2] = _hue(h3 - 1 / 3, r2, g3);
        } else if (~v3.indexOf("=")) {
          a3 = v3.match(_numExp);
          forceAlpha && a3.length < 4 && (a3[3] = 1);
          return a3;
        }
      } else {
        a3 = v3.match(_strictNumExp) || _colorLookup.transparent;
      }
      a3 = a3.map(Number);
    }
    if (toHSL && !wasHSL) {
      r2 = a3[0] / _255;
      g3 = a3[1] / _255;
      b3 = a3[2] / _255;
      max2 = Math.max(r2, g3, b3);
      min2 = Math.min(r2, g3, b3);
      l3 = (max2 + min2) / 2;
      if (max2 === min2) {
        h3 = s3 = 0;
      } else {
        d3 = max2 - min2;
        s3 = l3 > 0.5 ? d3 / (2 - max2 - min2) : d3 / (max2 + min2);
        h3 = max2 === r2 ? (g3 - b3) / d3 + (g3 < b3 ? 6 : 0) : max2 === g3 ? (b3 - r2) / d3 + 2 : (r2 - g3) / d3 + 4;
        h3 *= 60;
      }
      a3[0] = ~~(h3 + 0.5);
      a3[1] = ~~(s3 * 100 + 0.5);
      a3[2] = ~~(l3 * 100 + 0.5);
    }
    forceAlpha && a3.length < 4 && (a3[3] = 1);
    return a3;
  };
  var _colorOrderData = function _colorOrderData2(v3) {
    var values = [], c3 = [], i3 = -1;
    v3.split(_colorExp).forEach(function(v4) {
      var a3 = v4.match(_numWithUnitExp) || [];
      values.push.apply(values, a3);
      c3.push(i3 += a3.length + 1);
    });
    values.c = c3;
    return values;
  };
  var _formatColors = function _formatColors2(s3, toHSL, orderMatchData) {
    var result = "", colors = (s3 + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i3 = 0, c3, shell, d3, l3;
    if (!colors) {
      return s3;
    }
    colors = colors.map(function(color) {
      return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
    });
    if (orderMatchData) {
      d3 = _colorOrderData(s3);
      c3 = orderMatchData.c;
      if (c3.join(result) !== d3.c.join(result)) {
        shell = s3.replace(_colorExp, "1").split(_numWithUnitExp);
        l3 = shell.length - 1;
        for (; i3 < l3; i3++) {
          result += shell[i3] + (~c3.indexOf(i3) ? colors.shift() || type + "0,0,0,0)" : (d3.length ? d3 : colors.length ? colors : orderMatchData).shift());
        }
      }
    }
    if (!shell) {
      shell = s3.split(_colorExp);
      l3 = shell.length - 1;
      for (; i3 < l3; i3++) {
        result += shell[i3] + colors[i3];
      }
    }
    return result + shell[l3];
  };
  var _colorExp = function() {
    var s3 = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p3;
    for (p3 in _colorLookup) {
      s3 += "|" + p3 + "\\b";
    }
    return new RegExp(s3 + ")", "gi");
  }();
  var _hslExp = /hsl[a]?\(/;
  var _colorStringFilter = function _colorStringFilter2(a3) {
    var combined = a3.join(" "), toHSL;
    _colorExp.lastIndex = 0;
    if (_colorExp.test(combined)) {
      toHSL = _hslExp.test(combined);
      a3[1] = _formatColors(a3[1], toHSL);
      a3[0] = _formatColors(a3[0], toHSL, _colorOrderData(a3[1]));
      return true;
    }
  };
  var _tickerActive;
  var _ticker = function() {
    var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners = [], _id, _req, _raf, _self, _delta, _i, _tick = function _tick2(v3) {
      var elapsed = _getTime() - _lastUpdate, manual = v3 === true, overlap, dispatch3, time, frame;
      elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
      _lastUpdate += elapsed;
      time = _lastUpdate - _startTime;
      overlap = time - _nextTime;
      if (overlap > 0 || manual) {
        frame = ++_self.frame;
        _delta = time - _self.time * 1e3;
        _self.time = time = time / 1e3;
        _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
        dispatch3 = 1;
      }
      manual || (_id = _req(_tick2));
      if (dispatch3) {
        for (_i = 0; _i < _listeners.length; _i++) {
          _listeners[_i](time, _delta, frame, v3);
        }
      }
    };
    _self = {
      time: 0,
      frame: 0,
      tick: function tick() {
        _tick(true);
      },
      deltaRatio: function deltaRatio(fps) {
        return _delta / (1e3 / (fps || 60));
      },
      wake: function wake() {
        if (_coreReady) {
          if (!_coreInitted && _windowExists()) {
            _win = _coreInitted = window;
            _doc = _win.document || {};
            _globals.gsap = gsap;
            (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);
            _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});
            _raf = _win.requestAnimationFrame;
          }
          _id && _self.sleep();
          _req = _raf || function(f3) {
            return setTimeout(f3, _nextTime - _self.time * 1e3 + 1 | 0);
          };
          _tickerActive = 1;
          _tick(2);
        }
      },
      sleep: function sleep() {
        (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
        _tickerActive = 0;
        _req = _emptyFunc;
      },
      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
        _lagThreshold = threshold || 1 / _tinyNum;
        _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
      },
      fps: function fps(_fps) {
        _gap = 1e3 / (_fps || 240);
        _nextTime = _self.time * 1e3 + _gap;
      },
      add: function add2(callback) {
        _listeners.indexOf(callback) < 0 && _listeners.push(callback);
        _wake();
      },
      remove: function remove(callback) {
        var i3;
        ~(i3 = _listeners.indexOf(callback)) && _listeners.splice(i3, 1) && _i >= i3 && _i--;
      },
      _listeners
    };
    return _self;
  }();
  var _wake = function _wake2() {
    return !_tickerActive && _ticker.wake();
  };
  var _easeMap = {};
  var _customEaseExp = /^[\d.\-M][\d.\-,\s]/;
  var _quotesExp = /["']/g;
  var _parseObjectInString = function _parseObjectInString2(value) {
    var obj = {}, split = value.substr(1, value.length - 3).split(":"), key = split[0], i3 = 1, l3 = split.length, index, val, parsedVal;
    for (; i3 < l3; i3++) {
      val = split[i3];
      index = i3 !== l3 - 1 ? val.lastIndexOf(",") : val.length;
      parsedVal = val.substr(0, index);
      obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
      key = val.substr(index + 1).trim();
    }
    return obj;
  };
  var _valueInParentheses = function _valueInParentheses2(value) {
    var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
  };
  var _configEaseFromString = function _configEaseFromString2(name) {
    var split = (name + "").split("("), ease = _easeMap[split[0]];
    return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
  };
  var _invertEase = function _invertEase2(ease) {
    return function(p3) {
      return 1 - ease(1 - p3);
    };
  };
  var _propagateYoyoEase = function _propagateYoyoEase2(timeline2, isYoyo) {
    var child = timeline2._first, ease;
    while (child) {
      if (child instanceof Timeline) {
        _propagateYoyoEase2(child, isYoyo);
      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
        if (child.timeline) {
          _propagateYoyoEase2(child.timeline, isYoyo);
        } else {
          ease = child._ease;
          child._ease = child._yEase;
          child._yEase = ease;
          child._yoyo = isYoyo;
        }
      }
      child = child._next;
    }
  };
  var _parseEase = function _parseEase2(ease, defaultEase) {
    return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
  };
  var _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
    if (easeOut === void 0) {
      easeOut = function easeOut2(p3) {
        return 1 - easeIn(1 - p3);
      };
    }
    if (easeInOut === void 0) {
      easeInOut = function easeInOut2(p3) {
        return p3 < 0.5 ? easeIn(p3 * 2) / 2 : 1 - easeIn((1 - p3) * 2) / 2;
      };
    }
    var ease = {
      easeIn,
      easeOut,
      easeInOut
    }, lowercaseName;
    _forEachName(names, function(name) {
      _easeMap[name] = _globals[name] = ease;
      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
      for (var p3 in ease) {
        _easeMap[lowercaseName + (p3 === "easeIn" ? ".in" : p3 === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p3] = ease[p3];
      }
    });
    return ease;
  };
  var _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
    return function(p3) {
      return p3 < 0.5 ? (1 - easeOut(1 - p3 * 2)) / 2 : 0.5 + easeOut((p3 - 0.5) * 2) / 2;
    };
  };
  var _configElastic = function _configElastic2(type, amplitude, period) {
    var p1 = amplitude >= 1 ? amplitude : 1, p22 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p22 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p4) {
      return p4 === 1 ? 1 : p1 * Math.pow(2, -10 * p4) * _sin((p4 - p3) * p22) + 1;
    }, ease = type === "out" ? easeOut : type === "in" ? function(p4) {
      return 1 - easeOut(1 - p4);
    } : _easeInOutFromOut(easeOut);
    p22 = _2PI / p22;
    ease.config = function(amplitude2, period2) {
      return _configElastic2(type, amplitude2, period2);
    };
    return ease;
  };
  var _configBack = function _configBack2(type, overshoot) {
    if (overshoot === void 0) {
      overshoot = 1.70158;
    }
    var easeOut = function easeOut2(p3) {
      return p3 ? --p3 * p3 * ((overshoot + 1) * p3 + overshoot) + 1 : 0;
    }, ease = type === "out" ? easeOut : type === "in" ? function(p3) {
      return 1 - easeOut(1 - p3);
    } : _easeInOutFromOut(easeOut);
    ease.config = function(overshoot2) {
      return _configBack2(type, overshoot2);
    };
    return ease;
  };
  _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i3) {
    var power = i3 < 5 ? i3 + 1 : i3;
    _insertEase(name + ",Power" + (power - 1), i3 ? function(p3) {
      return Math.pow(p3, power);
    } : function(p3) {
      return p3;
    }, function(p3) {
      return 1 - Math.pow(1 - p3, power);
    }, function(p3) {
      return p3 < 0.5 ? Math.pow(p3 * 2, power) / 2 : 1 - Math.pow((1 - p3) * 2, power) / 2;
    });
  });
  _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
  _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
  (function(n3, c3) {
    var n1 = 1 / c3, n22 = 2 * n1, n32 = 2.5 * n1, easeOut = function easeOut2(p3) {
      return p3 < n1 ? n3 * p3 * p3 : p3 < n22 ? n3 * Math.pow(p3 - 1.5 / c3, 2) + 0.75 : p3 < n32 ? n3 * (p3 -= 2.25 / c3) * p3 + 0.9375 : n3 * Math.pow(p3 - 2.625 / c3, 2) + 0.984375;
    };
    _insertEase("Bounce", function(p3) {
      return 1 - easeOut(1 - p3);
    }, easeOut);
  })(7.5625, 2.75);
  _insertEase("Expo", function(p3) {
    return p3 ? Math.pow(2, 10 * (p3 - 1)) : 0;
  });
  _insertEase("Circ", function(p3) {
    return -(_sqrt(1 - p3 * p3) - 1);
  });
  _insertEase("Sine", function(p3) {
    return p3 === 1 ? 1 : -_cos(p3 * _HALF_PI) + 1;
  });
  _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
  _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
    config: function config(steps, immediateStart) {
      if (steps === void 0) {
        steps = 1;
      }
      var p1 = 1 / steps, p22 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max2 = 1 - _tinyNum;
      return function(p4) {
        return ((p22 * _clamp(0, max2, p4) | 0) + p3) * p1;
      };
    }
  };
  _defaults.ease = _easeMap["quad.out"];
  _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
    return _callbackNames += name + "," + name + "Params,";
  });
  var GSCache = function GSCache2(target, harness) {
    this.id = _gsID++;
    target._gsap = this;
    this.target = target;
    this.harness = harness;
    this.get = harness ? harness.get : _getProperty;
    this.set = harness ? harness.getSetter : _getSetter;
  };
  var Animation = /* @__PURE__ */ function() {
    function Animation2(vars) {
      this.vars = vars;
      this._delay = +vars.delay || 0;
      if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
        this._rDelay = vars.repeatDelay || 0;
        this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
      }
      this._ts = 1;
      _setDuration(this, +vars.duration, 1, 1);
      this.data = vars.data;
      _tickerActive || _ticker.wake();
    }
    var _proto = Animation2.prototype;
    _proto.delay = function delay(value) {
      if (value || value === 0) {
        this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
        this._delay = value;
        return this;
      }
      return this._delay;
    };
    _proto.duration = function duration(value) {
      return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
    };
    _proto.totalDuration = function totalDuration(value) {
      if (!arguments.length) {
        return this._tDur;
      }
      this._dirty = 0;
      return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
    };
    _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
      _wake();
      if (!arguments.length) {
        return this._tTime;
      }
      var parent = this._dp;
      if (parent && parent.smoothChildTiming && this._ts) {
        _alignPlayhead(this, _totalTime);
        !parent._dp || parent.parent || _postAddChecks(parent, this);
        while (parent && parent.parent) {
          if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
            parent.totalTime(parent._tTime, true);
          }
          parent = parent.parent;
        }
        if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
          _addToTimeline(this._dp, this, this._start - this._delay);
        }
      }
      if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
        this._ts || (this._pTime = _totalTime);
        _lazySafeRender(this, _totalTime, suppressEvents);
      }
      return this;
    };
    _proto.time = function time(value, suppressEvents) {
      return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
    };
    _proto.totalProgress = function totalProgress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
    };
    _proto.progress = function progress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
    };
    _proto.iteration = function iteration(value, suppressEvents) {
      var cycleDuration = this.duration() + this._rDelay;
      return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
    };
    _proto.timeScale = function timeScale(value) {
      if (!arguments.length) {
        return this._rts === -_tinyNum ? 0 : this._rts;
      }
      if (this._rts === value) {
        return this;
      }
      var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
      this._rts = +value || 0;
      this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
      _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
      _setEnd(this);
      return this;
    };
    _proto.paused = function paused(value) {
      if (!arguments.length) {
        return this._ps;
      }
      if (this._ps !== value) {
        this._ps = value;
        if (value) {
          this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
          this._ts = this._act = 0;
        } else {
          _wake();
          this._ts = this._rts;
          this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
        }
      }
      return this;
    };
    _proto.startTime = function startTime(value) {
      if (arguments.length) {
        this._start = value;
        var parent = this.parent || this._dp;
        parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
        return this;
      }
      return this._start;
    };
    _proto.endTime = function endTime(includeRepeats) {
      return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
    };
    _proto.rawTime = function rawTime(wrapRepeats) {
      var parent = this.parent || this._dp;
      return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
    };
    _proto.globalTime = function globalTime(rawTime) {
      var animation = this, time = arguments.length ? rawTime : animation.rawTime();
      while (animation) {
        time = animation._start + time / (animation._ts || 1);
        animation = animation._dp;
      }
      return time;
    };
    _proto.repeat = function repeat(value) {
      if (arguments.length) {
        this._repeat = value === Infinity ? -2 : value;
        return _onUpdateTotalDuration(this);
      }
      return this._repeat === -2 ? Infinity : this._repeat;
    };
    _proto.repeatDelay = function repeatDelay(value) {
      if (arguments.length) {
        var time = this._time;
        this._rDelay = value;
        _onUpdateTotalDuration(this);
        return time ? this.time(time) : this;
      }
      return this._rDelay;
    };
    _proto.yoyo = function yoyo(value) {
      if (arguments.length) {
        this._yoyo = value;
        return this;
      }
      return this._yoyo;
    };
    _proto.seek = function seek(position, suppressEvents) {
      return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
    };
    _proto.restart = function restart(includeDelay, suppressEvents) {
      return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    };
    _proto.play = function play(from, suppressEvents) {
      from != null && this.seek(from, suppressEvents);
      return this.reversed(false).paused(false);
    };
    _proto.reverse = function reverse(from, suppressEvents) {
      from != null && this.seek(from || this.totalDuration(), suppressEvents);
      return this.reversed(true).paused(false);
    };
    _proto.pause = function pause(atTime, suppressEvents) {
      atTime != null && this.seek(atTime, suppressEvents);
      return this.paused(true);
    };
    _proto.resume = function resume() {
      return this.paused(false);
    };
    _proto.reversed = function reversed(value) {
      if (arguments.length) {
        !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
        return this;
      }
      return this._rts < 0;
    };
    _proto.invalidate = function invalidate() {
      this._initted = this._act = 0;
      this._zTime = -_tinyNum;
      return this;
    };
    _proto.isActive = function isActive() {
      var parent = this.parent || this._dp, start2 = this._start, rawTime;
      return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start2 && rawTime < this.endTime(true) - _tinyNum);
    };
    _proto.eventCallback = function eventCallback(type, callback, params) {
      var vars = this.vars;
      if (arguments.length > 1) {
        if (!callback) {
          delete vars[type];
        } else {
          vars[type] = callback;
          params && (vars[type + "Params"] = params);
          type === "onUpdate" && (this._onUpdate = callback);
        }
        return this;
      }
      return vars[type];
    };
    _proto.then = function then(onFulfilled) {
      var self2 = this;
      return new Promise(function(resolve) {
        var f3 = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve2() {
          var _then = self2.then;
          self2.then = null;
          _isFunction(f3) && (f3 = f3(self2)) && (f3.then || f3 === self2) && (self2.then = _then);
          resolve(f3);
          self2.then = _then;
        };
        if (self2._initted && self2.totalProgress() === 1 && self2._ts >= 0 || !self2._tTime && self2._ts < 0) {
          _resolve();
        } else {
          self2._prom = _resolve;
        }
      });
    };
    _proto.kill = function kill() {
      _interrupt(this);
    };
    return Animation2;
  }();
  _setDefaults(Animation.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: false,
    parent: null,
    _initted: false,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -_tinyNum,
    _prom: 0,
    _ps: false,
    _rts: 1
  });
  var Timeline = /* @__PURE__ */ function(_Animation) {
    _inheritsLoose(Timeline2, _Animation);
    function Timeline2(vars, position) {
      var _this;
      if (vars === void 0) {
        vars = {};
      }
      _this = _Animation.call(this, vars) || this;
      _this.labels = {};
      _this.smoothChildTiming = !!vars.smoothChildTiming;
      _this.autoRemoveChildren = !!vars.autoRemoveChildren;
      _this._sort = _isNotFalse(vars.sortChildren);
      _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized$1(_this), position);
      vars.reversed && _this.reverse();
      vars.paused && _this.paused(true);
      vars.scrollTrigger && _scrollTrigger(_assertThisInitialized$1(_this), vars.scrollTrigger);
      return _this;
    }
    var _proto2 = Timeline2.prototype;
    _proto2.to = function to(targets, vars, position) {
      _createTweenType(0, arguments, this);
      return this;
    };
    _proto2.from = function from(targets, vars, position) {
      _createTweenType(1, arguments, this);
      return this;
    };
    _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
      _createTweenType(2, arguments, this);
      return this;
    };
    _proto2.set = function set(targets, vars, position) {
      vars.duration = 0;
      vars.parent = this;
      _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
      vars.immediateRender = !!vars.immediateRender;
      new Tween(targets, vars, _parsePosition(this, position), 1);
      return this;
    };
    _proto2.call = function call(callback, params, position) {
      return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
    };
    _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.duration = duration;
      vars.stagger = vars.stagger || stagger;
      vars.onComplete = onCompleteAll;
      vars.onCompleteParams = onCompleteAllParams;
      vars.parent = this;
      new Tween(targets, vars, _parsePosition(this, position));
      return this;
    };
    _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.runBackwards = 1;
      _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
      return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
    };
    _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
      toVars.startAt = fromVars;
      _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
      return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
    };
    _proto2.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
      this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
      if (tTime !== this._tTime || force || crossingStart) {
        if (prevTime !== this._time && dur) {
          tTime += this._time - prevTime;
          totalTime += this._time - prevTime;
        }
        time = tTime;
        prevStart = this._start;
        timeScale = this._ts;
        prevPaused = !timeScale;
        if (crossingStart) {
          dur || (prevTime = this._zTime);
          (totalTime || !suppressEvents) && (this._zTime = totalTime);
        }
        if (this._repeat) {
          yoyo = this._yoyo;
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }
          time = _roundPrecise(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);
            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }
            time > dur && (time = dur);
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration);
          if (yoyo && iteration & 1) {
            time = dur - time;
            isYoyo = 1;
          }
          if (iteration !== prevIteration && !this._lock) {
            var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
            iteration < prevIteration && (rewinding = !rewinding);
            prevTime = rewinding ? 0 : dur;
            this._lock = 1;
            this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
            this._tTime = tTime;
            !suppressEvents && this.parent && _callback(this, "onRepeat");
            this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
            if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
              return this;
            }
            dur = this._dur;
            tDur = this._tDur;
            if (doesWrap) {
              this._lock = 2;
              prevTime = rewinding ? dur : -1e-4;
              this.render(prevTime, true);
              this.vars.repeatRefresh && !isYoyo && this.invalidate();
            }
            this._lock = 0;
            if (!this._ts && !prevPaused) {
              return this;
            }
            _propagateYoyoEase(this, isYoyo);
          }
        }
        if (this._hasPause && !this._forcing && this._lock < 2) {
          pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
          if (pauseTween) {
            tTime -= time - (time = pauseTween._start);
          }
        }
        this._tTime = tTime;
        this._time = time;
        this._act = !timeScale;
        if (!this._initted) {
          this._onUpdate = this.vars.onUpdate;
          this._initted = 1;
          this._zTime = totalTime;
          prevTime = 0;
        }
        if (!prevTime && time && !suppressEvents) {
          _callback(this, "onStart");
          if (this._tTime !== tTime) {
            return this;
          }
        }
        if (time >= prevTime && totalTime >= 0) {
          child = this._first;
          while (child) {
            next = child._next;
            if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = -_tinyNum);
                break;
              }
            }
            child = next;
          }
        } else {
          child = this._last;
          var adjustedTime = totalTime < 0 ? totalTime : time;
          while (child) {
            next = child._prev;
            if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                return this.render(totalTime, suppressEvents, force);
              }
              child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);
              if (time !== this._time || !this._ts && !prevPaused) {
                pauseTween = 0;
                next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                break;
              }
            }
            child = next;
          }
        }
        if (pauseTween && !suppressEvents) {
          this.pause();
          pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
          if (this._ts) {
            this._start = prevStart;
            _setEnd(this);
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
        if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) {
          if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
            if (!this._lock) {
              (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
              if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
                _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
                this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
              }
            }
          }
        }
      }
      return this;
    };
    _proto2.add = function add2(child, position) {
      var _this2 = this;
      _isNumber(position) || (position = _parsePosition(this, position, child));
      if (!(child instanceof Animation)) {
        if (_isArray(child)) {
          child.forEach(function(obj) {
            return _this2.add(obj, position);
          });
          return this;
        }
        if (_isString(child)) {
          return this.addLabel(child, position);
        }
        if (_isFunction(child)) {
          child = Tween.delayedCall(0, child);
        } else {
          return this;
        }
      }
      return this !== child ? _addToTimeline(this, child, position) : this;
    };
    _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
      if (nested === void 0) {
        nested = true;
      }
      if (tweens === void 0) {
        tweens = true;
      }
      if (timelines === void 0) {
        timelines = true;
      }
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = -_bigNum;
      }
      var a3 = [], child = this._first;
      while (child) {
        if (child._start >= ignoreBeforeTime) {
          if (child instanceof Tween) {
            tweens && a3.push(child);
          } else {
            timelines && a3.push(child);
            nested && a3.push.apply(a3, child.getChildren(true, tweens, timelines));
          }
        }
        child = child._next;
      }
      return a3;
    };
    _proto2.getById = function getById2(id) {
      var animations = this.getChildren(1, 1, 1), i3 = animations.length;
      while (i3--) {
        if (animations[i3].vars.id === id) {
          return animations[i3];
        }
      }
    };
    _proto2.remove = function remove(child) {
      if (_isString(child)) {
        return this.removeLabel(child);
      }
      if (_isFunction(child)) {
        return this.killTweensOf(child);
      }
      _removeLinkedListItem(this, child);
      if (child === this._recent) {
        this._recent = this._last;
      }
      return _uncache(this);
    };
    _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
      if (!arguments.length) {
        return this._tTime;
      }
      this._forcing = 1;
      if (!this._dp && this._ts) {
        this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
      }
      _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
      this._forcing = 0;
      return this;
    };
    _proto2.addLabel = function addLabel(label, position) {
      this.labels[label] = _parsePosition(this, position);
      return this;
    };
    _proto2.removeLabel = function removeLabel(label) {
      delete this.labels[label];
      return this;
    };
    _proto2.addPause = function addPause(position, callback, params) {
      var t2 = Tween.delayedCall(0, callback || _emptyFunc, params);
      t2.data = "isPause";
      this._hasPause = 1;
      return _addToTimeline(this, t2, _parsePosition(this, position));
    };
    _proto2.removePause = function removePause(position) {
      var child = this._first;
      position = _parsePosition(this, position);
      while (child) {
        if (child._start === position && child.data === "isPause") {
          _removeFromParent(child);
        }
        child = child._next;
      }
    };
    _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      var tweens = this.getTweensOf(targets, onlyActive), i3 = tweens.length;
      while (i3--) {
        _overwritingTween !== tweens[i3] && tweens[i3].kill(targets, props);
      }
      return this;
    };
    _proto2.getTweensOf = function getTweensOf2(targets, onlyActive) {
      var a3 = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber(onlyActive), children;
      while (child) {
        if (child instanceof Tween) {
          if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
            a3.push(child);
          }
        } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
          a3.push.apply(a3, children);
        }
        child = child._next;
      }
      return a3;
    };
    _proto2.tweenTo = function tweenTo(position, vars) {
      vars = vars || {};
      var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
        ease: vars.ease || "none",
        lazy: false,
        immediateRender: false,
        time: endTime,
        overwrite: "auto",
        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
        onStart: function onStart() {
          tl.pause();
          if (!initted) {
            var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            initted = 1;
          }
          _onStart && _onStart.apply(tween, onStartParams || []);
        }
      }, vars));
      return immediateRender ? tween.render(0) : tween;
    };
    _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
      return this.tweenTo(toPosition, _setDefaults({
        startAt: {
          time: _parsePosition(this, fromPosition)
        }
      }, vars));
    };
    _proto2.recent = function recent() {
      return this._recent;
    };
    _proto2.nextLabel = function nextLabel(afterTime) {
      if (afterTime === void 0) {
        afterTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, afterTime));
    };
    _proto2.previousLabel = function previousLabel(beforeTime) {
      if (beforeTime === void 0) {
        beforeTime = this._time;
      }
      return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
    };
    _proto2.currentLabel = function currentLabel(value) {
      return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
    };
    _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = 0;
      }
      var child = this._first, labels = this.labels, p3;
      while (child) {
        if (child._start >= ignoreBeforeTime) {
          child._start += amount;
          child._end += amount;
        }
        child = child._next;
      }
      if (adjustLabels) {
        for (p3 in labels) {
          if (labels[p3] >= ignoreBeforeTime) {
            labels[p3] += amount;
          }
        }
      }
      return _uncache(this);
    };
    _proto2.invalidate = function invalidate() {
      var child = this._first;
      this._lock = 0;
      while (child) {
        child.invalidate();
        child = child._next;
      }
      return _Animation.prototype.invalidate.call(this);
    };
    _proto2.clear = function clear(includeLabels) {
      if (includeLabels === void 0) {
        includeLabels = true;
      }
      var child = this._first, next;
      while (child) {
        next = child._next;
        this.remove(child);
        child = next;
      }
      this._dp && (this._time = this._tTime = this._pTime = 0);
      includeLabels && (this.labels = {});
      return _uncache(this);
    };
    _proto2.totalDuration = function totalDuration(value) {
      var max2 = 0, self2 = this, child = self2._last, prevStart = _bigNum, prev, start2, parent;
      if (arguments.length) {
        return self2.timeScale((self2._repeat < 0 ? self2.duration() : self2.totalDuration()) / (self2.reversed() ? -value : value));
      }
      if (self2._dirty) {
        parent = self2.parent;
        while (child) {
          prev = child._prev;
          child._dirty && child.totalDuration();
          start2 = child._start;
          if (start2 > prevStart && self2._sort && child._ts && !self2._lock) {
            self2._lock = 1;
            _addToTimeline(self2, child, start2 - child._delay, 1)._lock = 0;
          } else {
            prevStart = start2;
          }
          if (start2 < 0 && child._ts) {
            max2 -= start2;
            if (!parent && !self2._dp || parent && parent.smoothChildTiming) {
              self2._start += start2 / self2._ts;
              self2._time -= start2;
              self2._tTime -= start2;
            }
            self2.shiftChildren(-start2, false, -Infinity);
            prevStart = 0;
          }
          child._end > max2 && child._ts && (max2 = child._end);
          child = prev;
        }
        _setDuration(self2, self2 === _globalTimeline && self2._time > max2 ? self2._time : max2, 1, 1);
        self2._dirty = 0;
      }
      return self2._tDur;
    };
    Timeline2.updateRoot = function updateRoot(time) {
      if (_globalTimeline._ts) {
        _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
        _lastRenderedFrame = _ticker.frame;
      }
      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame += _config.autoSleep || 120;
        var child = _globalTimeline._first;
        if (!child || !child._ts) {
          if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child && !child._ts) {
              child = child._next;
            }
            child || _ticker.sleep();
          }
        }
      }
    };
    return Timeline2;
  }(Animation);
  _setDefaults(Timeline.prototype, {
    _lock: 0,
    _hasPause: 0,
    _forcing: 0
  });
  var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start2, end2, setter, stringFilter, funcParam) {
    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a3;
    pt.b = start2;
    pt.e = end2;
    start2 += "";
    end2 += "";
    if (hasRandom = ~end2.indexOf("random(")) {
      end2 = _replaceRandom(end2);
    }
    if (stringFilter) {
      a3 = [start2, end2];
      stringFilter(a3, target, prop);
      start2 = a3[0];
      end2 = a3[1];
    }
    startNums = start2.match(_complexStringNumExp) || [];
    while (result = _complexStringNumExp.exec(end2)) {
      endNum = result[0];
      chunk = end2.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(") {
        color = 1;
      }
      if (endNum !== startNums[matchIndex++]) {
        startNum = parseFloat(startNums[matchIndex - 1]) || 0;
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
          m: color && color < 4 ? Math.round : 0
        };
        index = _complexStringNumExp.lastIndex;
      }
    }
    pt.c = index < end2.length ? end2.substring(index, end2.length) : "";
    pt.fp = funcParam;
    if (_relExp.test(end2) || hasRandom) {
      pt.e = 0;
    }
    this._pt = pt;
    return pt;
  };
  var _addPropTween = function _addPropTween2(target, prop, start2, end2, index, targets, modifier, stringFilter, funcParam) {
    _isFunction(end2) && (end2 = end2(index || 0, target, targets));
    var currentValue = target[prop], parsedStart = start2 !== "get" ? start2 : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
    if (_isString(end2)) {
      if (~end2.indexOf("random(")) {
        end2 = _replaceRandom(end2);
      }
      if (end2.charAt(1) === "=") {
        pt = parseFloat(parsedStart) + parseFloat(end2.substr(2)) * (end2.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
        if (pt || pt === 0) {
          end2 = pt;
        }
      }
    }
    if (parsedStart !== end2) {
      if (!isNaN(parsedStart * end2) && end2 !== "") {
        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end2 - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
        funcParam && (pt.fp = funcParam);
        modifier && pt.modifier(modifier, this, target);
        return this._pt = pt;
      }
      !currentValue && !(prop in target) && _missingPlugin(prop, end2);
      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end2, setter, stringFilter || _config.stringFilter, funcParam);
    }
  };
  var _processVars = function _processVars2(vars, index, target, targets, tween) {
    _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
    if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
      return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
    }
    var copy = {}, p3;
    for (p3 in vars) {
      copy[p3] = _parseFuncOrString(vars[p3], tween, index, target, targets);
    }
    return copy;
  };
  var _checkPlugin = function _checkPlugin2(property, vars, tween, index, target, targets) {
    var plugin, pt, ptLookup, i3;
    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
      if (tween !== _quickTween) {
        ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
        i3 = plugin._props.length;
        while (i3--) {
          ptLookup[plugin._props[i3]] = pt;
        }
      }
    }
    return plugin;
  };
  var _overwritingTween;
  var _initTween = function _initTween2(tween, time) {
    var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, onUpdateParams = vars.onUpdateParams, callbackScope = vars.callbackScope, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i3, p3, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
    tl && (!keyframes || !ease) && (ease = "none");
    tween._ease = _parseEase(ease, _defaults.ease);
    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;
    if (yoyoEase && tween._yoyo && !tween._repeat) {
      yoyoEase = tween._yEase;
      tween._yEase = tween._ease;
      tween._ease = yoyoEase;
    }
    tween._from = !tl && !!vars.runBackwards;
    if (!tl) {
      harness = targets[0] ? _getCache(targets[0]).harness : 0;
      harnessVars = harness && vars[harness.prop];
      cleanVars = _copyExcluding(vars, _reservedProps);
      prevStartAt && prevStartAt.render(-1, true).kill();
      if (startAt) {
        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
          data: "isStart",
          overwrite: false,
          parent,
          immediateRender: true,
          lazy: _isNotFalse(lazy),
          startAt: null,
          delay: 0,
          onUpdate,
          onUpdateParams,
          callbackScope,
          stagger: 0
        }, startAt)));
        time < 0 && !immediateRender && !autoRevert && tween._startAt.render(-1, true);
        if (immediateRender) {
          time > 0 && !autoRevert && (tween._startAt = 0);
          if (dur && time <= 0) {
            time && (tween._zTime = time);
            return;
          }
        } else if (autoRevert === false) {
          tween._startAt = 0;
        }
      } else if (runBackwards && dur) {
        if (prevStartAt) {
          !autoRevert && (tween._startAt = 0);
        } else {
          time && (immediateRender = false);
          p3 = _setDefaults({
            overwrite: false,
            data: "isFromStart",
            //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
            lazy: immediateRender && _isNotFalse(lazy),
            immediateRender,
            //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
            stagger: 0,
            parent
            //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})
          }, cleanVars);
          harnessVars && (p3[harness.prop] = harnessVars);
          _removeFromParent(tween._startAt = Tween.set(targets, p3));
          time < 0 && tween._startAt.render(-1, true);
          if (!immediateRender) {
            _initTween2(tween._startAt, _tinyNum);
          } else if (!time) {
            return;
          }
        }
      }
      tween._pt = 0;
      lazy = dur && _isNotFalse(lazy) || lazy && !dur;
      for (i3 = 0; i3 < targets.length; i3++) {
        target = targets[i3];
        gsData = target._gsap || _harness(targets)[i3]._gsap;
        tween._ptLookup[i3] = ptLookup = {};
        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
        index = fullTargets === targets ? i3 : fullTargets.indexOf(target);
        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
          plugin._props.forEach(function(name) {
            ptLookup[name] = pt;
          });
          plugin.priority && (hasPriority = 1);
        }
        if (!harness || harnessVars) {
          for (p3 in cleanVars) {
            if (_plugins[p3] && (plugin = _checkPlugin(p3, cleanVars, tween, index, target, fullTargets))) {
              plugin.priority && (hasPriority = 1);
            } else {
              ptLookup[p3] = pt = _addPropTween.call(tween, target, p3, "get", cleanVars[p3], index, fullTargets, 0, vars.stringFilter);
            }
          }
        }
        tween._op && tween._op[i3] && tween.kill(target, tween._op[i3]);
        if (autoOverwrite && tween._pt) {
          _overwritingTween = tween;
          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
          overwritten = !tween.parent;
          _overwritingTween = 0;
        }
        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
      }
      hasPriority && _sortPropTweensByPriority(tween);
      tween._onInit && tween._onInit(tween);
    }
    tween._onUpdate = onUpdate;
    tween._initted = (!tween._op || tween._pt) && !overwritten;
  };
  var _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
    var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p3, i3, aliases;
    if (!propertyAliases) {
      return vars;
    }
    copy = _merge({}, vars);
    for (p3 in propertyAliases) {
      if (p3 in copy) {
        aliases = propertyAliases[p3].split(",");
        i3 = aliases.length;
        while (i3--) {
          copy[aliases[i3]] = copy[p3];
        }
      }
    }
    return copy;
  };
  var _parseFuncOrString = function _parseFuncOrString2(value, tween, i3, target, targets) {
    return _isFunction(value) ? value.call(tween, i3, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
  };
  var _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase";
  var _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
  var Tween = /* @__PURE__ */ function(_Animation2) {
    _inheritsLoose(Tween2, _Animation2);
    function Tween2(targets, vars, position, skipInherit) {
      var _this3;
      if (typeof vars === "number") {
        position.duration = vars;
        vars = position;
        position = null;
      }
      _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
      var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults2 = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i3, copy, l3, p3, curTarget, staggerFunc, staggerVarsToMerge;
      _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
      _this3._ptLookup = [];
      _this3._overwrite = overwrite;
      if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        vars = _this3.vars;
        tl = _this3.timeline = new Timeline({
          data: "nested",
          defaults: defaults2 || {}
        });
        tl.kill();
        tl.parent = tl._dp = _assertThisInitialized$1(_this3);
        tl._start = 0;
        if (keyframes) {
          _inheritDefaults(_setDefaults(tl.vars.defaults, {
            ease: "none"
          }));
          stagger ? parsedTargets.forEach(function(t2, i4) {
            return keyframes.forEach(function(frame, j3) {
              return tl.to(t2, frame, j3 ? ">" : i4 * stagger);
            });
          }) : keyframes.forEach(function(frame) {
            return tl.to(parsedTargets, frame, ">");
          });
        } else {
          l3 = parsedTargets.length;
          staggerFunc = stagger ? distribute(stagger) : _emptyFunc;
          if (_isObject(stagger)) {
            for (p3 in stagger) {
              if (~_staggerTweenProps.indexOf(p3)) {
                staggerVarsToMerge || (staggerVarsToMerge = {});
                staggerVarsToMerge[p3] = stagger[p3];
              }
            }
          }
          for (i3 = 0; i3 < l3; i3++) {
            copy = {};
            for (p3 in vars) {
              if (_staggerPropsToSkip.indexOf(p3) < 0) {
                copy[p3] = vars[p3];
              }
            }
            copy.stagger = 0;
            yoyoEase && (copy.yoyoEase = yoyoEase);
            staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
            curTarget = parsedTargets[i3];
            copy.duration = +_parseFuncOrString(duration, _assertThisInitialized$1(_this3), i3, curTarget, parsedTargets);
            copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized$1(_this3), i3, curTarget, parsedTargets) || 0) - _this3._delay;
            if (!stagger && l3 === 1 && copy.delay) {
              _this3._delay = delay = copy.delay;
              _this3._start += delay;
              copy.delay = 0;
            }
            tl.to(curTarget, copy, staggerFunc(i3, curTarget, parsedTargets));
          }
          tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
        }
        duration || _this3.duration(duration = tl.duration());
      } else {
        _this3.timeline = 0;
      }
      if (overwrite === true && !_suppressOverwrites) {
        _overwritingTween = _assertThisInitialized$1(_this3);
        _globalTimeline.killTweensOf(parsedTargets);
        _overwritingTween = 0;
      }
      _addToTimeline(parent, _assertThisInitialized$1(_this3), position);
      vars.reversed && _this3.reverse();
      vars.paused && _this3.paused(true);
      if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized$1(_this3)) && parent.data !== "nested") {
        _this3._tTime = -_tinyNum;
        _this3.render(Math.max(0, -delay));
      }
      scrollTrigger && _scrollTrigger(_assertThisInitialized$1(_this3), scrollTrigger);
      return _this3;
    }
    var _proto3 = Tween2.prototype;
    _proto3.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time, tDur = this._tDur, dur = this._dur, tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline2, yoyoEase;
      if (!dur) {
        _renderZeroDurationTween(this, totalTime, suppressEvents, force);
      } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== totalTime < 0) {
        time = tTime;
        timeline2 = this.timeline;
        if (this._repeat) {
          cycleDuration = dur + this._rDelay;
          if (this._repeat < -1 && totalTime < 0) {
            return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
          }
          time = _roundPrecise(tTime % cycleDuration);
          if (tTime === tDur) {
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);
            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }
            time > dur && (time = dur);
          }
          isYoyo = this._yoyo && iteration & 1;
          if (isYoyo) {
            yoyoEase = this._yEase;
            time = dur - time;
          }
          prevIteration = _animationCycle(this._tTime, cycleDuration);
          if (time === prevTime && !force && this._initted) {
            return this;
          }
          if (iteration !== prevIteration) {
            timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
            if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
              this._lock = force = 1;
              this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
            }
          }
        }
        if (!this._initted) {
          if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
            this._tTime = 0;
            return this;
          }
          if (dur !== this._dur) {
            return this.render(totalTime, suppressEvents, force);
          }
        }
        this._tTime = tTime;
        this._time = time;
        if (!this._act && this._ts) {
          this._act = 1;
          this._lazy = 0;
        }
        this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
        if (this._from) {
          this.ratio = ratio = 1 - ratio;
        }
        if (time && !prevTime && !suppressEvents) {
          _callback(this, "onStart");
          if (this._tTime !== tTime) {
            return this;
          }
        }
        pt = this._pt;
        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }
        timeline2 && timeline2.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline2._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);
        if (this._onUpdate && !suppressEvents) {
          totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force);
          _callback(this, "onUpdate");
        }
        this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
        if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
          totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
          (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
          if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
            _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }
      return this;
    };
    _proto3.targets = function targets() {
      return this._targets;
    };
    _proto3.invalidate = function invalidate() {
      this._pt = this._op = this._startAt = this._onUpdate = this._lazy = this.ratio = 0;
      this._ptLookup = [];
      this.timeline && this.timeline.invalidate();
      return _Animation2.prototype.invalidate.call(this);
    };
    _proto3.kill = function kill(targets, vars) {
      if (vars === void 0) {
        vars = "all";
      }
      if (!targets && (!vars || vars === "all")) {
        this._lazy = this._pt = 0;
        return this.parent ? _interrupt(this) : this;
      }
      if (this.timeline) {
        var tDur = this.timeline.totalDuration();
        this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
        this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
        return this;
      }
      var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p3, pt, i3;
      if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
        vars === "all" && (this._pt = 0);
        return _interrupt(this);
      }
      overwrittenProps = this._op = this._op || [];
      if (vars !== "all") {
        if (_isString(vars)) {
          p3 = {};
          _forEachName(vars, function(name) {
            return p3[name] = 1;
          });
          vars = p3;
        }
        vars = _addAliasesToVars(parsedTargets, vars);
      }
      i3 = parsedTargets.length;
      while (i3--) {
        if (~killingTargets.indexOf(parsedTargets[i3])) {
          curLookup = propTweenLookup[i3];
          if (vars === "all") {
            overwrittenProps[i3] = vars;
            props = curLookup;
            curOverwriteProps = {};
          } else {
            curOverwriteProps = overwrittenProps[i3] = overwrittenProps[i3] || {};
            props = vars;
          }
          for (p3 in props) {
            pt = curLookup && curLookup[p3];
            if (pt) {
              if (!("kill" in pt.d) || pt.d.kill(p3) === true) {
                _removeLinkedListItem(this, pt, "_pt");
              }
              delete curLookup[p3];
            }
            if (curOverwriteProps !== "all") {
              curOverwriteProps[p3] = 1;
            }
          }
        }
      }
      this._initted && !this._pt && firstPT && _interrupt(this);
      return this;
    };
    Tween2.to = function to(targets, vars) {
      return new Tween2(targets, vars, arguments[2]);
    };
    Tween2.from = function from(targets, vars) {
      return _createTweenType(1, arguments);
    };
    Tween2.delayedCall = function delayedCall(delay, callback, params, scope) {
      return new Tween2(callback, 0, {
        immediateRender: false,
        lazy: false,
        overwrite: false,
        delay,
        onComplete: callback,
        onReverseComplete: callback,
        onCompleteParams: params,
        onReverseCompleteParams: params,
        callbackScope: scope
      });
    };
    Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
      return _createTweenType(2, arguments);
    };
    Tween2.set = function set(targets, vars) {
      vars.duration = 0;
      vars.repeatDelay || (vars.repeat = 0);
      return new Tween2(targets, vars);
    };
    Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      return _globalTimeline.killTweensOf(targets, props, onlyActive);
    };
    return Tween2;
  }(Animation);
  _setDefaults(Tween.prototype, {
    _targets: [],
    _lazy: 0,
    _startAt: 0,
    _op: 0,
    _onInit: 0
  });
  _forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
    Tween[name] = function() {
      var tl = new Timeline(), params = _slice.call(arguments, 0);
      params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
      return tl[name].apply(tl, params);
    };
  });
  var _setterPlain = function _setterPlain2(target, property, value) {
    return target[property] = value;
  };
  var _setterFunc = function _setterFunc2(target, property, value) {
    return target[property](value);
  };
  var _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
    return target[property](data.fp, value);
  };
  var _setterAttribute = function _setterAttribute2(target, property, value) {
    return target.setAttribute(property, value);
  };
  var _getSetter = function _getSetter2(target, property) {
    return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
  };
  var _renderPlain = function _renderPlain2(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
  };
  var _renderBoolean = function _renderBoolean2(ratio, data) {
    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
  };
  var _renderComplexString = function _renderComplexString2(ratio, data) {
    var pt = data._pt, s3 = "";
    if (!ratio && data.b) {
      s3 = data.b;
    } else if (ratio === 1 && data.e) {
      s3 = data.e;
    } else {
      while (pt) {
        s3 = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s3;
        pt = pt._next;
      }
      s3 += data.c;
    }
    data.set(data.t, data.p, s3, data);
  };
  var _renderPropTweens = function _renderPropTweens2(ratio, data) {
    var pt = data._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
  };
  var _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
    var pt = this._pt, next;
    while (pt) {
      next = pt._next;
      pt.p === property && pt.modifier(modifier, tween, target);
      pt = next;
    }
  };
  var _killPropTweensOf = function _killPropTweensOf2(property) {
    var pt = this._pt, hasNonDependentRemaining, next;
    while (pt) {
      next = pt._next;
      if (pt.p === property && !pt.op || pt.op === property) {
        _removeLinkedListItem(this, pt, "_pt");
      } else if (!pt.dep) {
        hasNonDependentRemaining = 1;
      }
      pt = next;
    }
    return !hasNonDependentRemaining;
  };
  var _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
  };
  var _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
    var pt = parent._pt, next, pt2, first, last;
    while (pt) {
      next = pt._next;
      pt2 = first;
      while (pt2 && pt2.pr > pt.pr) {
        pt2 = pt2._next;
      }
      if (pt._prev = pt2 ? pt2._prev : last) {
        pt._prev._next = pt;
      } else {
        first = pt;
      }
      if (pt._next = pt2) {
        pt2._prev = pt;
      } else {
        last = pt;
      }
      pt = next;
    }
    parent._pt = first;
  };
  var PropTween = /* @__PURE__ */ function() {
    function PropTween2(next, target, prop, start2, change, renderer, data, setter, priority) {
      this.t = target;
      this.s = start2;
      this.c = change;
      this.p = prop;
      this.r = renderer || _renderPlain;
      this.d = data || this;
      this.set = setter || _setterPlain;
      this.pr = priority || 0;
      this._next = next;
      if (next) {
        next._prev = this;
      }
    }
    var _proto4 = PropTween2.prototype;
    _proto4.modifier = function modifier(func, tween, target) {
      this.mSet = this.mSet || this.set;
      this.set = _setterWithModifier;
      this.m = func;
      this.mt = target;
      this.tween = tween;
    };
    return PropTween2;
  }();
  _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
    return _reservedProps[name] = 1;
  });
  _globals.TweenMax = _globals.TweenLite = Tween;
  _globals.TimelineLite = _globals.TimelineMax = Timeline;
  _globalTimeline = new Timeline({
    sortChildren: false,
    defaults: _defaults,
    autoRemoveChildren: true,
    id: "root",
    smoothChildTiming: true
  });
  _config.stringFilter = _colorStringFilter;
  var _gsap = {
    registerPlugin: function registerPlugin() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      args.forEach(function(config3) {
        return _createPlugin(config3);
      });
    },
    timeline: function timeline(vars) {
      return new Timeline(vars);
    },
    getTweensOf: function getTweensOf(targets, onlyActive) {
      return _globalTimeline.getTweensOf(targets, onlyActive);
    },
    getProperty: function getProperty(target, property, unit, uncache) {
      _isString(target) && (target = toArray(target)[0]);
      var getter = _getCache(target || {}).get, format2 = unit ? _passThrough : _numericIfPossible;
      unit === "native" && (unit = "");
      return !target ? target : !property ? function(property2, unit2, uncache2) {
        return format2((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
      } : format2((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    },
    quickSetter: function quickSetter(target, property, unit) {
      target = toArray(target);
      if (target.length > 1) {
        var setters = target.map(function(t2) {
          return gsap.quickSetter(t2, property, unit);
        }), l3 = setters.length;
        return function(value) {
          var i3 = l3;
          while (i3--) {
            setters[i3](value);
          }
        };
      }
      target = target[0] || {};
      var Plugin = _plugins[property], cache = _getCache(target), p3 = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
        var p4 = new Plugin();
        _quickTween._pt = 0;
        p4.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
        p4.render(1, p4);
        _quickTween._pt && _renderPropTweens(1, _quickTween);
      } : cache.set(target, p3);
      return Plugin ? setter : function(value) {
        return setter(target, p3, unit ? value + unit : value, cache, 1);
      };
    },
    isTweening: function isTweening(targets) {
      return _globalTimeline.getTweensOf(targets, true).length > 0;
    },
    defaults: function defaults(value) {
      value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
      return _mergeDeep(_defaults, value || {});
    },
    config: function config2(value) {
      return _mergeDeep(_config, value || {});
    },
    registerEffect: function registerEffect(_ref3) {
      var name = _ref3.name, effect4 = _ref3.effect, plugins = _ref3.plugins, defaults2 = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
      (plugins || "").split(",").forEach(function(pluginName) {
        return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
      });
      _effects[name] = function(targets, vars, tl) {
        return effect4(toArray(targets), _setDefaults(vars || {}, defaults2), tl);
      };
      if (extendTimeline) {
        Timeline.prototype[name] = function(targets, vars, position) {
          return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
        };
      }
    },
    registerEase: function registerEase(name, ease) {
      _easeMap[name] = _parseEase(ease);
    },
    parseEase: function parseEase(ease, defaultEase) {
      return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
    },
    getById: function getById(id) {
      return _globalTimeline.getById(id);
    },
    exportRoot: function exportRoot(vars, includeDelayedCalls) {
      if (vars === void 0) {
        vars = {};
      }
      var tl = new Timeline(vars), child, next;
      tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
      _globalTimeline.remove(tl);
      tl._dp = 0;
      tl._time = tl._tTime = _globalTimeline._time;
      child = _globalTimeline._first;
      while (child) {
        next = child._next;
        if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
          _addToTimeline(tl, child, child._start - child._delay);
        }
        child = next;
      }
      _addToTimeline(_globalTimeline, tl, 0);
      return tl;
    },
    utils: {
      wrap,
      wrapYoyo,
      distribute,
      random,
      snap,
      normalize,
      getUnit,
      clamp,
      splitColor,
      toArray,
      selector,
      mapRange,
      pipe,
      unitize,
      interpolate,
      shuffle
    },
    install: _install,
    effects: _effects,
    ticker: _ticker,
    updateRoot: Timeline.updateRoot,
    plugins: _plugins,
    globalTimeline: _globalTimeline,
    core: {
      PropTween,
      globals: _addGlobal,
      Tween,
      Timeline,
      Animation,
      getCache: _getCache,
      _removeLinkedListItem,
      suppressOverwrites: function suppressOverwrites(value) {
        return _suppressOverwrites = value;
      }
    }
  };
  _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
    return _gsap[name] = Tween[name];
  });
  _ticker.add(Timeline.updateRoot);
  _quickTween = _gsap.to({}, {
    duration: 0
  });
  var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
    var pt = plugin._pt;
    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
      pt = pt._next;
    }
    return pt;
  };
  var _addModifiers = function _addModifiers2(tween, modifiers) {
    var targets = tween._targets, p3, i3, pt;
    for (p3 in modifiers) {
      i3 = targets.length;
      while (i3--) {
        pt = tween._ptLookup[i3][p3];
        if (pt && (pt = pt.d)) {
          if (pt._pt) {
            pt = _getPluginPropTween(pt, p3);
          }
          pt && pt.modifier && pt.modifier(modifiers[p3], tween, targets[i3], p3);
        }
      }
    }
  };
  var _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
    return {
      name,
      rawVars: 1,
      //don't pre-process function-based values or "random()" strings.
      init: function init4(target, vars, tween) {
        tween._onInit = function(tween2) {
          var temp, p3;
          if (_isString(vars)) {
            temp = {};
            _forEachName(vars, function(name2) {
              return temp[name2] = 1;
            });
            vars = temp;
          }
          if (modifier) {
            temp = {};
            for (p3 in vars) {
              temp[p3] = modifier(vars[p3]);
            }
            vars = temp;
          }
          _addModifiers(tween2, vars);
        };
      }
    };
  };
  var gsap = _gsap.registerPlugin({
    name: "attr",
    init: function init(target, vars, tween, index, targets) {
      var p3, pt;
      for (p3 in vars) {
        pt = this.add(target, "setAttribute", (target.getAttribute(p3) || 0) + "", vars[p3], index, targets, 0, 0, p3);
        pt && (pt.op = p3);
        this._props.push(p3);
      }
    }
  }, {
    name: "endArray",
    init: function init2(target, value) {
      var i3 = value.length;
      while (i3--) {
        this.add(target, i3, target[i3] || 0, value[i3]);
      }
    }
  }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
  Tween.version = Timeline.version = gsap.version = "3.8.0";
  _coreReady = 1;
  _windowExists() && _wake();
  var _win$1;
  var _doc$1;
  var _docElement;
  var _pluginInitted;
  var _tempDiv;
  var _tempDivStyler;
  var _recentSetterPlugin;
  var _windowExists$1 = function _windowExists3() {
    return typeof window !== "undefined";
  };
  var _transformProps = {};
  var _RAD2DEG = 180 / Math.PI;
  var _DEG2RAD = Math.PI / 180;
  var _atan2 = Math.atan2;
  var _bigNum$1 = 1e8;
  var _capsExp = /([A-Z])/g;
  var _horizontalExp = /(?:left|right|width|margin|padding|x)/i;
  var _complexExp = /[\s,\(]\S/;
  var _propertyAliases = {
    autoAlpha: "opacity,visibility",
    scale: "scaleX,scaleY",
    alpha: "opacity"
  };
  var _renderCSSProp = function _renderCSSProp2(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
  };
  var _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
  };
  var _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
  };
  var _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
    var value = data.s + data.c * ratio;
    data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
  };
  var _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
  };
  var _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
  };
  var _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
    return target.style[property] = value;
  };
  var _setterCSSProp = function _setterCSSProp2(target, property, value) {
    return target.style.setProperty(property, value);
  };
  var _setterTransform = function _setterTransform2(target, property, value) {
    return target._gsap[property] = value;
  };
  var _setterScale = function _setterScale2(target, property, value) {
    return target._gsap.scaleX = target._gsap.scaleY = value;
  };
  var _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache.scaleX = cache.scaleY = value;
    cache.renderTransform(ratio, cache);
  };
  var _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache[property] = value;
    cache.renderTransform(ratio, cache);
  };
  var _transformProp = "transform";
  var _transformOriginProp = _transformProp + "Origin";
  var _supports3D;
  var _createElement = function _createElement2(type, ns) {
    var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type);
    return e.style ? e : _doc$1.createElement(type);
  };
  var _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
    var cs = getComputedStyle(target);
    return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
  };
  var _prefixes = "O,Moz,ms,Ms,Webkit".split(",");
  var _checkPropPrefix = function _checkPropPrefix2(property, element, preferPrefix) {
    var e = element || _tempDiv, s3 = e.style, i3 = 5;
    if (property in s3 && !preferPrefix) {
      return property;
    }
    property = property.charAt(0).toUpperCase() + property.substr(1);
    while (i3-- && !(_prefixes[i3] + property in s3)) {
    }
    return i3 < 0 ? null : (i3 === 3 ? "ms" : i3 >= 0 ? _prefixes[i3] : "") + property;
  };
  var _initCore = function _initCore2() {
    if (_windowExists$1() && window.document) {
      _win$1 = window;
      _doc$1 = _win$1.document;
      _docElement = _doc$1.documentElement;
      _tempDiv = _createElement("div") || {
        style: {}
      };
      _tempDivStyler = _createElement("div");
      _transformProp = _checkPropPrefix(_transformProp);
      _transformOriginProp = _transformProp + "Origin";
      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
      _supports3D = !!_checkPropPrefix("perspective");
      _pluginInitted = 1;
    }
  };
  var _getBBoxHack = function _getBBoxHack2(swapIfPossible) {
    var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), oldParent = this.parentNode, oldSibling = this.nextSibling, oldCSS = this.style.cssText, bbox;
    _docElement.appendChild(svg);
    svg.appendChild(this);
    this.style.display = "block";
    if (swapIfPossible) {
      try {
        bbox = this.getBBox();
        this._gsapBBox = this.getBBox;
        this.getBBox = _getBBoxHack2;
      } catch (e) {
      }
    } else if (this._gsapBBox) {
      bbox = this._gsapBBox();
    }
    if (oldParent) {
      if (oldSibling) {
        oldParent.insertBefore(this, oldSibling);
      } else {
        oldParent.appendChild(this);
      }
    }
    _docElement.removeChild(svg);
    this.style.cssText = oldCSS;
    return bbox;
  };
  var _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
    var i3 = attributesArray.length;
    while (i3--) {
      if (target.hasAttribute(attributesArray[i3])) {
        return target.getAttribute(attributesArray[i3]);
      }
    }
  };
  var _getBBox = function _getBBox2(target) {
    var bounds;
    try {
      bounds = target.getBBox();
    } catch (error2) {
      bounds = _getBBoxHack.call(target, true);
    }
    bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true));
    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
      width: 0,
      height: 0
    } : bounds;
  };
  var _isSVG = function _isSVG2(e) {
    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
  };
  var _removeProperty = function _removeProperty2(target, property) {
    if (property) {
      var style = target.style;
      if (property in _transformProps && property !== _transformOriginProp) {
        property = _transformProp;
      }
      if (style.removeProperty) {
        if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
          property = "-" + property;
        }
        style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
      } else {
        style.removeAttribute(property);
      }
    }
  };
  var _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end2, onlySetAtEnd) {
    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
    plugin._pt = pt;
    pt.b = beginning;
    pt.e = end2;
    plugin._props.push(property);
    return pt;
  };
  var _nonConvertibleUnits = {
    deg: 1,
    rad: 1,
    turn: 1
  };
  var _convertToUnit = function _convertToUnit2(target, property, value, unit) {
    var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache, isSVG;
    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
      return curValue;
    }
    curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
    isSVG = target.getCTM && _isSVG(target);
    if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
      px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
      return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
    }
    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
    parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
    if (isSVG) {
      parent = (target.ownerSVGElement || {}).parentNode;
    }
    if (!parent || parent === _doc$1 || !parent.appendChild) {
      parent = _doc$1.body;
    }
    cache = parent._gsap;
    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
      return _round(curValue / cache.width * amount);
    } else {
      (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static");
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
      if (horizontal && toPercent) {
        cache = _getCache(parent);
        cache.time = _ticker.time;
        cache.width = parent[measureProperty];
      }
    }
    return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
  };
  var _get = function _get2(target, property, unit, uncache) {
    var value;
    _pluginInitted || _initCore();
    if (property in _propertyAliases && property !== "transform") {
      property = _propertyAliases[property];
      if (~property.indexOf(",")) {
        property = property.split(",")[0];
      }
    }
    if (_transformProps[property] && property !== "transform") {
      value = _parseTransform(target, uncache);
      value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
    } else {
      value = target.style[property];
      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
      }
    }
    return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
  };
  var _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start2, end2) {
    if (!start2 || start2 === "none") {
      var p3 = _checkPropPrefix(prop, target, 1), s3 = p3 && _getComputedProperty(target, p3, 1);
      if (s3 && s3 !== start2) {
        prop = p3;
        start2 = s3;
      } else if (prop === "borderColor") {
        start2 = _getComputedProperty(target, "borderTopColor");
      }
    }
    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a3, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, relative, endValues;
    pt.b = start2;
    pt.e = end2;
    start2 += "";
    end2 += "";
    if (end2 === "auto") {
      target.style[prop] = end2;
      end2 = _getComputedProperty(target, prop) || end2;
      target.style[prop] = start2;
    }
    a3 = [start2, end2];
    _colorStringFilter(a3);
    start2 = a3[0];
    end2 = a3[1];
    startValues = start2.match(_numWithUnitExp) || [];
    endValues = end2.match(_numWithUnitExp) || [];
    if (endValues.length) {
      while (result = _numWithUnitExp.exec(end2)) {
        endValue = result[0];
        chunk = end2.substring(index, result.index);
        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
          color = 1;
        }
        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
          startNum = parseFloat(startValue) || 0;
          startUnit = startValue.substr((startNum + "").length);
          relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;
          if (relative) {
            endValue = endValue.substr(2);
          }
          endNum = parseFloat(endValue);
          endUnit = endValue.substr((endNum + "").length);
          index = _numWithUnitExp.lastIndex - endUnit.length;
          if (!endUnit) {
            endUnit = endUnit || _config.units[prop] || startUnit;
            if (index === end2.length) {
              end2 += endUnit;
              pt.e += endUnit;
            }
          }
          if (startUnit !== endUnit) {
            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
          }
          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: relative ? relative * endNum : endNum - startNum,
            m: color && color < 4 || prop === "zIndex" ? Math.round : 0
          };
        }
      }
      pt.c = index < end2.length ? end2.substring(index, end2.length) : "";
    } else {
      pt.r = prop === "display" && end2 === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
    }
    _relExp.test(end2) && (pt.e = 0);
    this._pt = pt;
    return pt;
  };
  var _keywordToPercent = {
    top: "0%",
    bottom: "100%",
    left: "0%",
    right: "100%",
    center: "50%"
  };
  var _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
    var split = value.split(" "), x3 = split[0], y3 = split[1] || "50%";
    if (x3 === "top" || x3 === "bottom" || y3 === "left" || y3 === "right") {
      value = x3;
      x3 = y3;
      y3 = value;
    }
    split[0] = _keywordToPercent[x3] || x3;
    split[1] = _keywordToPercent[y3] || y3;
    return split.join(" ");
  };
  var _renderClearProps = function _renderClearProps2(ratio, data) {
    if (data.tween && data.tween._time === data.tween._dur) {
      var target = data.t, style = target.style, props = data.u, cache = target._gsap, prop, clearTransforms, i3;
      if (props === "all" || props === true) {
        style.cssText = "";
        clearTransforms = 1;
      } else {
        props = props.split(",");
        i3 = props.length;
        while (--i3 > -1) {
          prop = props[i3];
          if (_transformProps[prop]) {
            clearTransforms = 1;
            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
          }
          _removeProperty(target, prop);
        }
      }
      if (clearTransforms) {
        _removeProperty(target, _transformProp);
        if (cache) {
          cache.svg && target.removeAttribute("transform");
          _parseTransform(target, 1);
          cache.uncache = 1;
        }
      }
    }
  };
  var _specialProps = {
    clearProps: function clearProps(plugin, target, property, endValue, tween) {
      if (tween.data !== "isFromStart") {
        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
        pt.u = endValue;
        pt.pr = -10;
        pt.tween = tween;
        plugin._props.push(property);
        return 1;
      }
    }
    /* className feature (about 0.4kb gzipped).
    , className(plugin, target, property, endValue, tween) {
    	let _renderClassName = (ratio, data) => {
    			data.css.render(ratio, data.css);
    			if (!ratio || ratio === 1) {
    				let inline = data.rmv,
    					target = data.t,
    					p;
    				target.setAttribute("class", ratio ? data.e : data.b);
    				for (p in inline) {
    					_removeProperty(target, p);
    				}
    			}
    		},
    		_getAllStyles = (target) => {
    			let styles = {},
    				computed = getComputedStyle(target),
    				p;
    			for (p in computed) {
    				if (isNaN(p) && p !== "cssText" && p !== "length") {
    					styles[p] = computed[p];
    				}
    			}
    			_setDefaults(styles, _parseTransform(target, 1));
    			return styles;
    		},
    		startClassList = target.getAttribute("class"),
    		style = target.style,
    		cssText = style.cssText,
    		cache = target._gsap,
    		classPT = cache.classPT,
    		inlineToRemoveAtEnd = {},
    		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
    		changingVars = {},
    		startVars = _getAllStyles(target),
    		transformRelated = /(transform|perspective)/i,
    		endVars, p;
    	if (classPT) {
    		classPT.r(1, classPT.d);
    		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
    	}
    	target.setAttribute("class", data.e);
    	endVars = _getAllStyles(target, true);
    	target.setAttribute("class", startClassList);
    	for (p in endVars) {
    		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
    			changingVars[p] = endVars[p];
    			if (!style[p] && style[p] !== "0") {
    				inlineToRemoveAtEnd[p] = 1;
    			}
    		}
    	}
    	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
    	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
    		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
    	}
    	_parseTransform(target, true); //to clear the caching of transforms
    	data.css = new gsap.plugins.css();
    	data.css.init(target, changingVars, tween);
    	plugin._props.push(...data.css._props);
    	return 1;
    }
    */
  };
  var _identity2DMatrix = [1, 0, 0, 1, 0, 0];
  var _rotationalProperties = {};
  var _isNullTransform = function _isNullTransform2(value) {
    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
  };
  var _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
    var matrixString = _getComputedProperty(target, _transformProp);
    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
  };
  var _getMatrix = function _getMatrix2(target, force2D) {
    var cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
    if (cache.svg && target.getAttribute("transform")) {
      temp = target.transform.baseVal.consolidate().matrix;
      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
      temp = style.display;
      style.display = "block";
      parent = target.parentNode;
      if (!parent || !target.offsetParent) {
        addedToDOM = 1;
        nextSibling = target.nextSibling;
        _docElement.appendChild(target);
      }
      matrix = _getComputedTransformMatrixAsArray(target);
      temp ? style.display = temp : _removeProperty(target, "display");
      if (addedToDOM) {
        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
      }
    }
    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
  };
  var _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
    var cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a3 = matrix[0], b3 = matrix[1], c3 = matrix[2], d3 = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x3, y3;
    if (!originIsAbsolute) {
      bounds = _getBBox(target);
      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
    } else if (matrix !== _identity2DMatrix && (determinant = a3 * d3 - b3 * c3)) {
      x3 = xOrigin * (d3 / determinant) + yOrigin * (-c3 / determinant) + (c3 * ty - d3 * tx) / determinant;
      y3 = xOrigin * (-b3 / determinant) + yOrigin * (a3 / determinant) - (a3 * ty - b3 * tx) / determinant;
      xOrigin = x3;
      yOrigin = y3;
    }
    if (smooth || smooth !== false && cache.smooth) {
      tx = xOrigin - xOriginOld;
      ty = yOrigin - yOriginOld;
      cache.xOffset = xOffsetOld + (tx * a3 + ty * c3) - tx;
      cache.yOffset = yOffsetOld + (tx * b3 + ty * d3) - ty;
    } else {
      cache.xOffset = cache.yOffset = 0;
    }
    cache.xOrigin = xOrigin;
    cache.yOrigin = yOrigin;
    cache.smooth = !!smooth;
    cache.origin = origin;
    cache.originIsAbsolute = !!originIsAbsolute;
    target.style[_transformOriginProp] = "0px 0px";
    if (pluginToAddPropTweensTo) {
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
    }
    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
  };
  var _parseTransform = function _parseTransform2(target, uncache) {
    var cache = target._gsap || new GSCache(target);
    if ("x" in cache && !uncache && !cache.uncache) {
      return cache;
    }
    var style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", origin = _getComputedProperty(target, _transformOriginProp) || "0", x3, y3, z3, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a3, b3, c3, d3, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
    x3 = y3 = z3 = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
    scaleX = scaleY = 1;
    cache.svg = !!(target.getCTM && _isSVG(target));
    matrix = _getMatrix(target, cache.svg);
    if (cache.svg) {
      t1 = (!cache.uncache || origin === "0px 0px") && !uncache && target.getAttribute("data-svg-origin");
      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
    }
    xOrigin = cache.xOrigin || 0;
    yOrigin = cache.yOrigin || 0;
    if (matrix !== _identity2DMatrix) {
      a3 = matrix[0];
      b3 = matrix[1];
      c3 = matrix[2];
      d3 = matrix[3];
      x3 = a12 = matrix[4];
      y3 = a22 = matrix[5];
      if (matrix.length === 6) {
        scaleX = Math.sqrt(a3 * a3 + b3 * b3);
        scaleY = Math.sqrt(d3 * d3 + c3 * c3);
        rotation = a3 || b3 ? _atan2(b3, a3) * _RAD2DEG : 0;
        skewX = c3 || d3 ? _atan2(c3, d3) * _RAD2DEG + rotation : 0;
        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
        if (cache.svg) {
          x3 -= xOrigin - (xOrigin * a3 + yOrigin * c3);
          y3 -= yOrigin - (xOrigin * b3 + yOrigin * d3);
        }
      } else {
        a32 = matrix[6];
        a42 = matrix[7];
        a13 = matrix[8];
        a23 = matrix[9];
        a33 = matrix[10];
        a43 = matrix[11];
        x3 = matrix[12];
        y3 = matrix[13];
        z3 = matrix[14];
        angle = _atan2(a32, a33);
        rotationX = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a12 * cos + a13 * sin;
          t2 = a22 * cos + a23 * sin;
          t3 = a32 * cos + a33 * sin;
          a13 = a12 * -sin + a13 * cos;
          a23 = a22 * -sin + a23 * cos;
          a33 = a32 * -sin + a33 * cos;
          a43 = a42 * -sin + a43 * cos;
          a12 = t1;
          a22 = t2;
          a32 = t3;
        }
        angle = _atan2(-c3, a33);
        rotationY = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a3 * cos - a13 * sin;
          t2 = b3 * cos - a23 * sin;
          t3 = c3 * cos - a33 * sin;
          a43 = d3 * sin + a43 * cos;
          a3 = t1;
          b3 = t2;
          c3 = t3;
        }
        angle = _atan2(b3, a3);
        rotation = angle * _RAD2DEG;
        if (angle) {
          cos = Math.cos(angle);
          sin = Math.sin(angle);
          t1 = a3 * cos + b3 * sin;
          t2 = a12 * cos + a22 * sin;
          b3 = b3 * cos - a3 * sin;
          a22 = a22 * cos - a12 * sin;
          a3 = t1;
          a12 = t2;
        }
        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
          rotationX = rotation = 0;
          rotationY = 180 - rotationY;
        }
        scaleX = _round(Math.sqrt(a3 * a3 + b3 * b3 + c3 * c3));
        scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
        angle = _atan2(a12, a22);
        skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
      }
      if (cache.svg) {
        t1 = target.getAttribute("transform");
        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
        t1 && target.setAttribute("transform", t1);
      }
    }
    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
      if (invertedScaleX) {
        scaleX *= -1;
        skewX += rotation <= 0 ? 180 : -180;
        rotation += rotation <= 0 ? 180 : -180;
      } else {
        scaleY *= -1;
        skewX += skewX <= 0 ? 180 : -180;
      }
    }
    cache.x = x3 - ((cache.xPercent = x3 && (cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x3) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
    cache.y = y3 - ((cache.yPercent = y3 && (cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y3) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
    cache.z = z3 + px;
    cache.scaleX = _round(scaleX);
    cache.scaleY = _round(scaleY);
    cache.rotation = _round(rotation) + deg;
    cache.rotationX = _round(rotationX) + deg;
    cache.rotationY = _round(rotationY) + deg;
    cache.skewX = skewX + deg;
    cache.skewY = skewY + deg;
    cache.transformPerspective = perspective + px;
    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
      style[_transformOriginProp] = _firstTwoOnly(origin);
    }
    cache.xOffset = cache.yOffset = 0;
    cache.force3D = _config.force3D;
    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
    cache.uncache = 0;
    return cache;
  };
  var _firstTwoOnly = function _firstTwoOnly2(value) {
    return (value = value.split(" "))[0] + " " + value[1];
  };
  var _addPxTranslate = function _addPxTranslate2(target, start2, value) {
    var unit = getUnit(start2);
    return _round(parseFloat(start2) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
  };
  var _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache) {
    cache.z = "0px";
    cache.rotationY = cache.rotationX = "0deg";
    cache.force3D = 0;
    _renderCSSTransforms(ratio, cache);
  };
  var _zeroDeg = "0deg";
  var _zeroPx = "0px";
  var _endParenthesis = ") ";
  var _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache) {
    var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x3 = _ref.x, y3 = _ref.y, z3 = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
      var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
      angle = parseFloat(rotationX) * _DEG2RAD;
      cos = Math.cos(angle);
      x3 = _addPxTranslate(target, x3, a13 * cos * -zOrigin);
      y3 = _addPxTranslate(target, y3, -Math.sin(angle) * -zOrigin);
      z3 = _addPxTranslate(target, z3, a33 * cos * -zOrigin + zOrigin);
    }
    if (transformPerspective !== _zeroPx) {
      transforms += "perspective(" + transformPerspective + _endParenthesis;
    }
    if (xPercent || yPercent) {
      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
    }
    if (use3D || x3 !== _zeroPx || y3 !== _zeroPx || z3 !== _zeroPx) {
      transforms += z3 !== _zeroPx || use3D ? "translate3d(" + x3 + ", " + y3 + ", " + z3 + ") " : "translate(" + x3 + ", " + y3 + _endParenthesis;
    }
    if (rotation !== _zeroDeg) {
      transforms += "rotate(" + rotation + _endParenthesis;
    }
    if (rotationY !== _zeroDeg) {
      transforms += "rotateY(" + rotationY + _endParenthesis;
    }
    if (rotationX !== _zeroDeg) {
      transforms += "rotateX(" + rotationX + _endParenthesis;
    }
    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
    }
    target.style[_transformProp] = transforms || "translate(0, 0)";
  };
  var _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache) {
    var _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x3 = _ref2.x, y3 = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x3), ty = parseFloat(y3), a11, a21, a12, a22, temp;
    rotation = parseFloat(rotation);
    skewX = parseFloat(skewX);
    skewY = parseFloat(skewY);
    if (skewY) {
      skewY = parseFloat(skewY);
      skewX += skewY;
      rotation += skewY;
    }
    if (rotation || skewX) {
      rotation *= _DEG2RAD;
      skewX *= _DEG2RAD;
      a11 = Math.cos(rotation) * scaleX;
      a21 = Math.sin(rotation) * scaleX;
      a12 = Math.sin(rotation - skewX) * -scaleY;
      a22 = Math.cos(rotation - skewX) * scaleY;
      if (skewX) {
        skewY *= _DEG2RAD;
        temp = Math.tan(skewX - skewY);
        temp = Math.sqrt(1 + temp * temp);
        a12 *= temp;
        a22 *= temp;
        if (skewY) {
          temp = Math.tan(skewY);
          temp = Math.sqrt(1 + temp * temp);
          a11 *= temp;
          a21 *= temp;
        }
      }
      a11 = _round(a11);
      a21 = _round(a21);
      a12 = _round(a12);
      a22 = _round(a22);
    } else {
      a11 = scaleX;
      a22 = scaleY;
      a21 = a12 = 0;
    }
    if (tx && !~(x3 + "").indexOf("px") || ty && !~(y3 + "").indexOf("px")) {
      tx = _convertToUnit(target, "x", x3, "px");
      ty = _convertToUnit(target, "y", y3, "px");
    }
    if (xOrigin || yOrigin || xOffset || yOffset) {
      tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
      ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
    }
    if (xPercent || yPercent) {
      temp = target.getBBox();
      tx = _round(tx + xPercent / 100 * temp.width);
      ty = _round(ty + yPercent / 100 * temp.height);
    }
    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
    target.setAttribute("transform", temp);
    forceCSS && (target.style[_transformProp] = temp);
  };
  var _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue, relative) {
    var cap = 360, isString = _isString(endValue), endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = relative ? endNum * relative : endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
    if (isString) {
      direction = endValue.split("_")[1];
      if (direction === "short") {
        change %= cap;
        if (change !== change % (cap / 2)) {
          change += change < 0 ? cap : -cap;
        }
      }
      if (direction === "cw" && change < 0) {
        change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      } else if (direction === "ccw" && change > 0) {
        change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      }
    }
    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
    pt.e = finalValue;
    pt.u = "deg";
    plugin._props.push(property);
    return pt;
  };
  var _assign = function _assign2(target, source) {
    for (var p3 in source) {
      target[p3] = source[p3];
    }
    return target;
  };
  var _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
    var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p3, startValue, endValue, startNum, endNum, startUnit, endUnit;
    if (startCache.svg) {
      startValue = target.getAttribute("transform");
      target.setAttribute("transform", "");
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      _removeProperty(target, _transformProp);
      target.setAttribute("transform", startValue);
    } else {
      startValue = getComputedStyle(target)[_transformProp];
      style[_transformProp] = transforms;
      endCache = _parseTransform(target, 1);
      style[_transformProp] = startValue;
    }
    for (p3 in _transformProps) {
      startValue = startCache[p3];
      endValue = endCache[p3];
      if (startValue !== endValue && exclude.indexOf(p3) < 0) {
        startUnit = getUnit(startValue);
        endUnit = getUnit(endValue);
        startNum = startUnit !== endUnit ? _convertToUnit(target, p3, startValue, endUnit) : parseFloat(startValue);
        endNum = parseFloat(endValue);
        plugin._pt = new PropTween(plugin._pt, endCache, p3, startNum, endNum - startNum, _renderCSSProp);
        plugin._pt.u = endUnit || 0;
        plugin._props.push(p3);
      }
    }
    _assign(endCache, startCache);
  };
  _forEachName("padding,margin,Width,Radius", function(name, index) {
    var t2 = "Top", r2 = "Right", b3 = "Bottom", l3 = "Left", props = (index < 3 ? [t2, r2, b3, l3] : [t2 + l3, t2 + r2, b3 + r2, b3 + l3]).map(function(side) {
      return index < 2 ? name + side : "border" + side + name;
    });
    _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
      var a3, vars;
      if (arguments.length < 4) {
        a3 = props.map(function(prop) {
          return _get(plugin, prop, property);
        });
        vars = a3.join(" ");
        return vars.split(a3[0]).length === 5 ? a3[0] : vars;
      }
      a3 = (endValue + "").split(" ");
      vars = {};
      props.forEach(function(prop, i3) {
        return vars[prop] = a3[i3] = a3[i3] || a3[(i3 - 1) / 2 | 0];
      });
      plugin.init(target, vars, tween);
    };
  });
  var CSSPlugin = {
    name: "css",
    register: _initCore,
    targetTest: function targetTest(target) {
      return target.style && target.nodeType;
    },
    init: function init3(target, vars, tween, index, targets) {
      var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p3, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority;
      _pluginInitted || _initCore();
      for (p3 in vars) {
        if (p3 === "autoRound") {
          continue;
        }
        endValue = vars[p3];
        if (_plugins[p3] && _checkPlugin(p3, vars, tween, index, target, targets)) {
          continue;
        }
        type = typeof endValue;
        specialProp = _specialProps[p3];
        if (type === "function") {
          endValue = endValue.call(tween, index, target, targets);
          type = typeof endValue;
        }
        if (type === "string" && ~endValue.indexOf("random(")) {
          endValue = _replaceRandom(endValue);
        }
        if (specialProp) {
          specialProp(this, target, p3, endValue, tween) && (hasPriority = 1);
        } else if (p3.substr(0, 2) === "--") {
          startValue = (getComputedStyle(target).getPropertyValue(p3) + "").trim();
          endValue += "";
          _colorExp.lastIndex = 0;
          if (!_colorExp.test(startValue)) {
            startUnit = getUnit(startValue);
            endUnit = getUnit(endValue);
          }
          endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p3, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
          this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p3);
          props.push(p3);
        } else if (type !== "undefined") {
          if (startAt && p3 in startAt) {
            startValue = typeof startAt[p3] === "function" ? startAt[p3].call(tween, index, target, targets) : startAt[p3];
            p3 in _config.units && !getUnit(startValue) && (startValue += _config.units[p3]);
            _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
            (startValue + "").charAt(1) === "=" && (startValue = _get(target, p3));
          } else {
            startValue = _get(target, p3);
          }
          startNum = parseFloat(startValue);
          relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;
          relative && (endValue = endValue.substr(2));
          endNum = parseFloat(endValue);
          if (p3 in _propertyAliases) {
            if (p3 === "autoAlpha") {
              if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                startNum = 0;
              }
              _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
            }
            if (p3 !== "scale" && p3 !== "transform") {
              p3 = _propertyAliases[p3];
              ~p3.indexOf(",") && (p3 = p3.split(",")[0]);
            }
          }
          isTransformRelated = p3 in _transformProps;
          if (isTransformRelated) {
            if (!transformPropTween) {
              cache = target._gsap;
              cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
              smooth = vars.smoothOrigin !== false && cache.smooth;
              transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
              transformPropTween.dep = 1;
            }
            if (p3 === "scale") {
              this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? relative * endNum : endNum - cache.scaleY) || 0);
              props.push("scaleY", p3);
              p3 += "X";
            } else if (p3 === "transformOrigin") {
              endValue = _convertKeywordsToPercentages(endValue);
              if (cache.svg) {
                _applySVGOrigin(target, endValue, 0, smooth, 0, this);
              } else {
                endUnit = parseFloat(endValue.split(" ")[2]) || 0;
                endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
                _addNonTweeningPT(this, style, p3, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
              }
              continue;
            } else if (p3 === "svgOrigin") {
              _applySVGOrigin(target, endValue, 1, smooth, 0, this);
              continue;
            } else if (p3 in _rotationalProperties) {
              _addRotationalPropTween(this, cache, p3, startNum, endValue, relative);
              continue;
            } else if (p3 === "smoothOrigin") {
              _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
              continue;
            } else if (p3 === "force3D") {
              cache[p3] = endValue;
              continue;
            } else if (p3 === "transform") {
              _addRawTransformPTs(this, endValue, target);
              continue;
            }
          } else if (!(p3 in style)) {
            p3 = _checkPropPrefix(p3) || p3;
          }
          if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p3 in style) {
            startUnit = (startValue + "").substr((startNum + "").length);
            endNum || (endNum = 0);
            endUnit = getUnit(endValue) || (p3 in _config.units ? _config.units[p3] : startUnit);
            startUnit !== endUnit && (startNum = _convertToUnit(target, p3, startValue, endUnit));
            this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p3, startNum, relative ? relative * endNum : endNum - startNum, !isTransformRelated && (endUnit === "px" || p3 === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
            this._pt.u = endUnit || 0;
            if (startUnit !== endUnit && endUnit !== "%") {
              this._pt.b = startValue;
              this._pt.r = _renderCSSPropWithBeginning;
            }
          } else if (!(p3 in style)) {
            if (p3 in target) {
              this.add(target, p3, startValue || target[p3], endValue, index, targets);
            } else {
              _missingPlugin(p3, endValue);
              continue;
            }
          } else {
            _tweenComplexCSSString.call(this, target, p3, startValue, endValue);
          }
          props.push(p3);
        }
      }
      hasPriority && _sortPropTweensByPriority(this);
    },
    get: _get,
    aliases: _propertyAliases,
    getSetter: function getSetter(target, property, plugin) {
      var p3 = _propertyAliases[property];
      p3 && p3.indexOf(",") < 0 && (property = p3);
      return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
    },
    core: {
      _removeProperty,
      _getMatrix
    }
  };
  gsap.utils.checkPrefix = _checkPropPrefix;
  (function(positionAndScale, rotation, others, aliases) {
    var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
      _transformProps[name] = 1;
    });
    _forEachName(rotation, function(name) {
      _config.units[name] = "deg";
      _rotationalProperties[name] = 1;
    });
    _propertyAliases[all[13]] = positionAndScale + "," + rotation;
    _forEachName(aliases, function(name) {
      var split = name.split(":");
      _propertyAliases[split[1]] = all[split[0]];
    });
  })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
  _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
    _config.units[name] = "px";
  });
  gsap.registerPlugin(CSSPlugin);
  var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
  var TweenMaxWithCSS = gsapWithCSS.core.Tween;
  var dasherize3 = (string) => {
    return string.replace(/[A-Z]/g, function(char, index) {
      return (index !== 0 ? "-" : "") + char.toLowerCase();
    });
  };
  var _default = /* @__PURE__ */ function(_Controller) {
    _inherits(_default2, _Controller);
    var _super = _createSuper(_default2);
    function _default2(...args) {
      var _this;
      _classCallCheck(this, _default2);
      _this = _super.call(this, ...args);
      _defineProperty(_assertThisInitialized(_this), "intercept", ({
        detail,
        target,
        type
      }) => {
        if (target !== document) {
          const body = target === document.body;
          const style = getComputedStyle(target);
          const border = style.getPropertyValue("border");
          const title = document.createElement("div");
          const overlay = document.createElement("div");
          const eventType = type.split("after-")[1];
          const color = eventType === "morph" ? "#FF9800" : "#0F0";
          const d3 = detail.stimulusReflex;
          const titleTarget = d3 && d3.target || "";
          const reflexId = d3 && d3.reflexId || "";
          setTimeout(() => {
            const t_rect = target.getBoundingClientRect();
            const rect = body ? {
              top: 56,
              left: 0
            } : t_rect;
            const titleTop = rect.top - 56 + Math.round(scrollY);
            const oTop = body ? 0 : t_rect.top + Math.round(scrollY);
            title.style.cssText = `position:absolute;z-index:5001;top:${titleTop}px;left:${rect.left}px;background-color:#fff;padding: 3px 8px 3px 8px;border: 1px solid #000;pointer-events: none;`;
            title.innerHTML = `${eventType} <b>${titleTarget}</b> \u2192 ${detail.selector}<br><small>${reflexId}</small>`;
            overlay.style.cssText = `position:absolute;z-index:5000;top:${oTop}px;left:${t_rect.left}px;width:${t_rect.width}px;height:${t_rect.height}px;background-color: ${color};pointer-events: none;`;
            overlay.style.border = border;
            document.body.appendChild(title);
            document.body.appendChild(overlay);
            gsapWithCSS.fromTo(overlay, {
              opacity: 1
            }, {
              opacity: 0,
              duration: _this.duration,
              ease: "expo",
              onComplete: () => {
                title.remove();
                overlay.remove();
              }
            });
          });
        }
      });
      return _this;
    }
    _createClass(_default2, [{
      key: "initialize",
      value: function initialize() {
        this.operations = Object.keys(CableReady.DOMOperations).map((key) => dasherize3(key));
        this.duration = 7;
      }
    }, {
      key: "connect",
      value: function connect() {
        this.operations.forEach((operation) => document.addEventListener(`cable-ready:after-${operation}`, this.intercept));
      }
    }, {
      key: "disconnect",
      value: function disconnect() {
        this.operations.forEach((operation) => document.removeEventListener(`cable-ready:after-${operation}`, this.intercept));
      }
    }, {
      key: "durationValueChanged",
      value: function durationValueChanged() {
        this.duration = this.durationValue;
      }
    }]);
    return _default2;
  }(Controller2);
  _defineProperty(_default, "values", {
    duration: Number
  });
  var index_m_default = _default;

  // config/stimulus_reflex.js
  application.consumer = consumer_default;
  application.register("radiolabel", index_m_default);
  B.debug = true;
  window.reflexes = B.reflexes;
  B.initialize(application, { controller: application_controller_default, isolate: true });

  // ../../node_modules/intersection-observer/intersection-observer.js
  (function() {
    "use strict";
    if (typeof window !== "object") {
      return;
    }
    if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
      if (!("isIntersecting" in window.IntersectionObserverEntry.prototype)) {
        Object.defineProperty(
          window.IntersectionObserverEntry.prototype,
          "isIntersecting",
          {
            get: function() {
              return this.intersectionRatio > 0;
            }
          }
        );
      }
      return;
    }
    function getFrameElement(doc3) {
      try {
        return doc3.defaultView && doc3.defaultView.frameElement || null;
      } catch (e) {
        return null;
      }
    }
    var document2 = function(startDoc) {
      var doc3 = startDoc;
      var frame = getFrameElement(doc3);
      while (frame) {
        doc3 = frame.ownerDocument;
        frame = getFrameElement(doc3);
      }
      return doc3;
    }(window.document);
    var registry = [];
    var crossOriginUpdater = null;
    var crossOriginRect = null;
    function IntersectionObserverEntry(entry) {
      this.time = entry.time;
      this.target = entry.target;
      this.rootBounds = ensureDOMRect(entry.rootBounds);
      this.boundingClientRect = ensureDOMRect(entry.boundingClientRect);
      this.intersectionRect = ensureDOMRect(entry.intersectionRect || getEmptyRect());
      this.isIntersecting = !!entry.intersectionRect;
      var targetRect = this.boundingClientRect;
      var targetArea = targetRect.width * targetRect.height;
      var intersectionRect = this.intersectionRect;
      var intersectionArea = intersectionRect.width * intersectionRect.height;
      if (targetArea) {
        this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
      } else {
        this.intersectionRatio = this.isIntersecting ? 1 : 0;
      }
    }
    function IntersectionObserver2(callback, opt_options) {
      var options = opt_options || {};
      if (typeof callback != "function") {
        throw new Error("callback must be a function");
      }
      if (options.root && options.root.nodeType != 1 && options.root.nodeType != 9) {
        throw new Error("root must be a Document or Element");
      }
      this._checkForIntersections = throttle(
        this._checkForIntersections.bind(this),
        this.THROTTLE_TIMEOUT
      );
      this._callback = callback;
      this._observationTargets = [];
      this._queuedEntries = [];
      this._rootMarginValues = this._parseRootMargin(options.rootMargin);
      this.thresholds = this._initThresholds(options.threshold);
      this.root = options.root || null;
      this.rootMargin = this._rootMarginValues.map(function(margin) {
        return margin.value + margin.unit;
      }).join(" ");
      this._monitoringDocuments = [];
      this._monitoringUnsubscribes = [];
    }
    IntersectionObserver2.prototype.THROTTLE_TIMEOUT = 100;
    IntersectionObserver2.prototype.POLL_INTERVAL = null;
    IntersectionObserver2.prototype.USE_MUTATION_OBSERVER = true;
    IntersectionObserver2._setupCrossOriginUpdater = function() {
      if (!crossOriginUpdater) {
        crossOriginUpdater = function(boundingClientRect, intersectionRect) {
          if (!boundingClientRect || !intersectionRect) {
            crossOriginRect = getEmptyRect();
          } else {
            crossOriginRect = convertFromParentRect(boundingClientRect, intersectionRect);
          }
          registry.forEach(function(observer) {
            observer._checkForIntersections();
          });
        };
      }
      return crossOriginUpdater;
    };
    IntersectionObserver2._resetCrossOriginUpdater = function() {
      crossOriginUpdater = null;
      crossOriginRect = null;
    };
    IntersectionObserver2.prototype.observe = function(target) {
      var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
        return item.element == target;
      });
      if (isTargetAlreadyObserved) {
        return;
      }
      if (!(target && target.nodeType == 1)) {
        throw new Error("target must be an Element");
      }
      this._registerInstance();
      this._observationTargets.push({ element: target, entry: null });
      this._monitorIntersections(target.ownerDocument);
      this._checkForIntersections();
    };
    IntersectionObserver2.prototype.unobserve = function(target) {
      this._observationTargets = this._observationTargets.filter(function(item) {
        return item.element != target;
      });
      this._unmonitorIntersections(target.ownerDocument);
      if (this._observationTargets.length == 0) {
        this._unregisterInstance();
      }
    };
    IntersectionObserver2.prototype.disconnect = function() {
      this._observationTargets = [];
      this._unmonitorAllIntersections();
      this._unregisterInstance();
    };
    IntersectionObserver2.prototype.takeRecords = function() {
      var records = this._queuedEntries.slice();
      this._queuedEntries = [];
      return records;
    };
    IntersectionObserver2.prototype._initThresholds = function(opt_threshold) {
      var threshold = opt_threshold || [0];
      if (!Array.isArray(threshold))
        threshold = [threshold];
      return threshold.sort().filter(function(t2, i3, a3) {
        if (typeof t2 != "number" || isNaN(t2) || t2 < 0 || t2 > 1) {
          throw new Error("threshold must be a number between 0 and 1 inclusively");
        }
        return t2 !== a3[i3 - 1];
      });
    };
    IntersectionObserver2.prototype._parseRootMargin = function(opt_rootMargin) {
      var marginString = opt_rootMargin || "0px";
      var margins = marginString.split(/\s+/).map(function(margin) {
        var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
        if (!parts) {
          throw new Error("rootMargin must be specified in pixels or percent");
        }
        return { value: parseFloat(parts[1]), unit: parts[2] };
      });
      margins[1] = margins[1] || margins[0];
      margins[2] = margins[2] || margins[0];
      margins[3] = margins[3] || margins[1];
      return margins;
    };
    IntersectionObserver2.prototype._monitorIntersections = function(doc3) {
      var win = doc3.defaultView;
      if (!win) {
        return;
      }
      if (this._monitoringDocuments.indexOf(doc3) != -1) {
        return;
      }
      var callback = this._checkForIntersections;
      var monitoringInterval = null;
      var domObserver = null;
      if (this.POLL_INTERVAL) {
        monitoringInterval = win.setInterval(callback, this.POLL_INTERVAL);
      } else {
        addEvent2(win, "resize", callback, true);
        addEvent2(doc3, "scroll", callback, true);
        if (this.USE_MUTATION_OBSERVER && "MutationObserver" in win) {
          domObserver = new win.MutationObserver(callback);
          domObserver.observe(doc3, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
      this._monitoringDocuments.push(doc3);
      this._monitoringUnsubscribes.push(function() {
        var win2 = doc3.defaultView;
        if (win2) {
          if (monitoringInterval) {
            win2.clearInterval(monitoringInterval);
          }
          removeEvent(win2, "resize", callback, true);
        }
        removeEvent(doc3, "scroll", callback, true);
        if (domObserver) {
          domObserver.disconnect();
        }
      });
      var rootDoc = this.root && (this.root.ownerDocument || this.root) || document2;
      if (doc3 != rootDoc) {
        var frame = getFrameElement(doc3);
        if (frame) {
          this._monitorIntersections(frame.ownerDocument);
        }
      }
    };
    IntersectionObserver2.prototype._unmonitorIntersections = function(doc3) {
      var index = this._monitoringDocuments.indexOf(doc3);
      if (index == -1) {
        return;
      }
      var rootDoc = this.root && (this.root.ownerDocument || this.root) || document2;
      var hasDependentTargets = this._observationTargets.some(function(item) {
        var itemDoc = item.element.ownerDocument;
        if (itemDoc == doc3) {
          return true;
        }
        while (itemDoc && itemDoc != rootDoc) {
          var frame2 = getFrameElement(itemDoc);
          itemDoc = frame2 && frame2.ownerDocument;
          if (itemDoc == doc3) {
            return true;
          }
        }
        return false;
      });
      if (hasDependentTargets) {
        return;
      }
      var unsubscribe = this._monitoringUnsubscribes[index];
      this._monitoringDocuments.splice(index, 1);
      this._monitoringUnsubscribes.splice(index, 1);
      unsubscribe();
      if (doc3 != rootDoc) {
        var frame = getFrameElement(doc3);
        if (frame) {
          this._unmonitorIntersections(frame.ownerDocument);
        }
      }
    };
    IntersectionObserver2.prototype._unmonitorAllIntersections = function() {
      var unsubscribes = this._monitoringUnsubscribes.slice(0);
      this._monitoringDocuments.length = 0;
      this._monitoringUnsubscribes.length = 0;
      for (var i3 = 0; i3 < unsubscribes.length; i3++) {
        unsubscribes[i3]();
      }
    };
    IntersectionObserver2.prototype._checkForIntersections = function() {
      if (!this.root && crossOriginUpdater && !crossOriginRect) {
        return;
      }
      var rootIsInDom = this._rootIsInDom();
      var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();
      this._observationTargets.forEach(function(item) {
        var target = item.element;
        var targetRect = getBoundingClientRect2(target);
        var rootContainsTarget = this._rootContainsTarget(target);
        var oldEntry = item.entry;
        var intersectionRect = rootIsInDom && rootContainsTarget && this._computeTargetAndRootIntersection(target, targetRect, rootRect);
        var rootBounds = null;
        if (!this._rootContainsTarget(target)) {
          rootBounds = getEmptyRect();
        } else if (!crossOriginUpdater || this.root) {
          rootBounds = rootRect;
        }
        var newEntry = item.entry = new IntersectionObserverEntry({
          time: now2(),
          target,
          boundingClientRect: targetRect,
          rootBounds,
          intersectionRect
        });
        if (!oldEntry) {
          this._queuedEntries.push(newEntry);
        } else if (rootIsInDom && rootContainsTarget) {
          if (this._hasCrossedThreshold(oldEntry, newEntry)) {
            this._queuedEntries.push(newEntry);
          }
        } else {
          if (oldEntry && oldEntry.isIntersecting) {
            this._queuedEntries.push(newEntry);
          }
        }
      }, this);
      if (this._queuedEntries.length) {
        this._callback(this.takeRecords(), this);
      }
    };
    IntersectionObserver2.prototype._computeTargetAndRootIntersection = function(target, targetRect, rootRect) {
      if (window.getComputedStyle(target).display == "none")
        return;
      var intersectionRect = targetRect;
      var parent = getParentNode2(target);
      var atRoot = false;
      while (!atRoot && parent) {
        var parentRect = null;
        var parentComputedStyle = parent.nodeType == 1 ? window.getComputedStyle(parent) : {};
        if (parentComputedStyle.display == "none")
          return null;
        if (parent == this.root || parent.nodeType == /* DOCUMENT */
        9) {
          atRoot = true;
          if (parent == this.root || parent == document2) {
            if (crossOriginUpdater && !this.root) {
              if (!crossOriginRect || crossOriginRect.width == 0 && crossOriginRect.height == 0) {
                parent = null;
                parentRect = null;
                intersectionRect = null;
              } else {
                parentRect = crossOriginRect;
              }
            } else {
              parentRect = rootRect;
            }
          } else {
            var frame = getParentNode2(parent);
            var frameRect = frame && getBoundingClientRect2(frame);
            var frameIntersect = frame && this._computeTargetAndRootIntersection(frame, frameRect, rootRect);
            if (frameRect && frameIntersect) {
              parent = frame;
              parentRect = convertFromParentRect(frameRect, frameIntersect);
            } else {
              parent = null;
              intersectionRect = null;
            }
          }
        } else {
          var doc3 = parent.ownerDocument;
          if (parent != doc3.body && parent != doc3.documentElement && parentComputedStyle.overflow != "visible") {
            parentRect = getBoundingClientRect2(parent);
          }
        }
        if (parentRect) {
          intersectionRect = computeRectIntersection(parentRect, intersectionRect);
        }
        if (!intersectionRect)
          break;
        parent = parent && getParentNode2(parent);
      }
      return intersectionRect;
    };
    IntersectionObserver2.prototype._getRootRect = function() {
      var rootRect;
      if (this.root && !isDoc(this.root)) {
        rootRect = getBoundingClientRect2(this.root);
      } else {
        var doc3 = isDoc(this.root) ? this.root : document2;
        var html = doc3.documentElement;
        var body = doc3.body;
        rootRect = {
          top: 0,
          left: 0,
          right: html.clientWidth || body.clientWidth,
          width: html.clientWidth || body.clientWidth,
          bottom: html.clientHeight || body.clientHeight,
          height: html.clientHeight || body.clientHeight
        };
      }
      return this._expandRectByRootMargin(rootRect);
    };
    IntersectionObserver2.prototype._expandRectByRootMargin = function(rect) {
      var margins = this._rootMarginValues.map(function(margin, i3) {
        return margin.unit == "px" ? margin.value : margin.value * (i3 % 2 ? rect.width : rect.height) / 100;
      });
      var newRect = {
        top: rect.top - margins[0],
        right: rect.right + margins[1],
        bottom: rect.bottom + margins[2],
        left: rect.left - margins[3]
      };
      newRect.width = newRect.right - newRect.left;
      newRect.height = newRect.bottom - newRect.top;
      return newRect;
    };
    IntersectionObserver2.prototype._hasCrossedThreshold = function(oldEntry, newEntry) {
      var oldRatio = oldEntry && oldEntry.isIntersecting ? oldEntry.intersectionRatio || 0 : -1;
      var newRatio = newEntry.isIntersecting ? newEntry.intersectionRatio || 0 : -1;
      if (oldRatio === newRatio)
        return;
      for (var i3 = 0; i3 < this.thresholds.length; i3++) {
        var threshold = this.thresholds[i3];
        if (threshold == oldRatio || threshold == newRatio || threshold < oldRatio !== threshold < newRatio) {
          return true;
        }
      }
    };
    IntersectionObserver2.prototype._rootIsInDom = function() {
      return !this.root || containsDeep(document2, this.root);
    };
    IntersectionObserver2.prototype._rootContainsTarget = function(target) {
      var rootDoc = this.root && (this.root.ownerDocument || this.root) || document2;
      return containsDeep(rootDoc, target) && (!this.root || rootDoc == target.ownerDocument);
    };
    IntersectionObserver2.prototype._registerInstance = function() {
      if (registry.indexOf(this) < 0) {
        registry.push(this);
      }
    };
    IntersectionObserver2.prototype._unregisterInstance = function() {
      var index = registry.indexOf(this);
      if (index != -1)
        registry.splice(index, 1);
    };
    function now2() {
      return window.performance && performance.now && performance.now();
    }
    function throttle(fn2, timeout) {
      var timer = null;
      return function() {
        if (!timer) {
          timer = setTimeout(function() {
            fn2();
            timer = null;
          }, timeout);
        }
      };
    }
    function addEvent2(node, event, fn2, opt_useCapture) {
      if (typeof node.addEventListener == "function") {
        node.addEventListener(event, fn2, opt_useCapture || false);
      } else if (typeof node.attachEvent == "function") {
        node.attachEvent("on" + event, fn2);
      }
    }
    function removeEvent(node, event, fn2, opt_useCapture) {
      if (typeof node.removeEventListener == "function") {
        node.removeEventListener(event, fn2, opt_useCapture || false);
      } else if (typeof node.detachEvent == "function") {
        node.detachEvent("on" + event, fn2);
      }
    }
    function computeRectIntersection(rect1, rect2) {
      var top2 = Math.max(rect1.top, rect2.top);
      var bottom2 = Math.min(rect1.bottom, rect2.bottom);
      var left2 = Math.max(rect1.left, rect2.left);
      var right2 = Math.min(rect1.right, rect2.right);
      var width = right2 - left2;
      var height = bottom2 - top2;
      return width >= 0 && height >= 0 && {
        top: top2,
        bottom: bottom2,
        left: left2,
        right: right2,
        width,
        height
      } || null;
    }
    function getBoundingClientRect2(el) {
      var rect;
      try {
        rect = el.getBoundingClientRect();
      } catch (err) {
      }
      if (!rect)
        return getEmptyRect();
      if (!(rect.width && rect.height)) {
        rect = {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top
        };
      }
      return rect;
    }
    function getEmptyRect() {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0
      };
    }
    function ensureDOMRect(rect) {
      if (!rect || "x" in rect) {
        return rect;
      }
      return {
        top: rect.top,
        y: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        x: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      };
    }
    function convertFromParentRect(parentBoundingRect, parentIntersectionRect) {
      var top2 = parentIntersectionRect.top - parentBoundingRect.top;
      var left2 = parentIntersectionRect.left - parentBoundingRect.left;
      return {
        top: top2,
        left: left2,
        height: parentIntersectionRect.height,
        width: parentIntersectionRect.width,
        bottom: top2 + parentIntersectionRect.height,
        right: left2 + parentIntersectionRect.width
      };
    }
    function containsDeep(parent, child) {
      var node = child;
      while (node) {
        if (node == parent)
          return true;
        node = getParentNode2(node);
      }
      return false;
    }
    function getParentNode2(node) {
      var parent = node.parentNode;
      if (node.nodeType == /* DOCUMENT */
      9 && node != document2) {
        return getFrameElement(node);
      }
      if (parent && parent.assignedSlot) {
        parent = parent.assignedSlot.parentNode;
      }
      if (parent && parent.nodeType == 11 && parent.host) {
        return parent.host;
      }
      return parent;
    }
    function isDoc(node) {
      return node && node.nodeType === 9;
    }
    window.IntersectionObserver = IntersectionObserver2;
    window.IntersectionObserverEntry = IntersectionObserverEntry;
  })();

  // ../../node_modules/flowbite/lib/esm/dom/events.js
  var Events = function() {
    function Events2(eventType, eventFunctions) {
      if (eventFunctions === void 0) {
        eventFunctions = [];
      }
      this._eventType = eventType;
      this._eventFunctions = eventFunctions;
    }
    Events2.prototype.init = function() {
      var _this = this;
      this._eventFunctions.forEach(function(eventFunction) {
        if (typeof window !== "undefined") {
          window.addEventListener(_this._eventType, eventFunction);
        }
      });
    };
    return Events2;
  }();
  var events_default = Events;

  // ../../node_modules/flowbite/lib/esm/components/accordion/index.js
  var __assign = function() {
    __assign = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign.apply(this, arguments);
  };
  var Default = {
    alwaysOpen: false,
    activeClasses: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
    inactiveClasses: "text-gray-500 dark:text-gray-400",
    onOpen: function() {
    },
    onClose: function() {
    },
    onToggle: function() {
    }
  };
  var Accordion = function() {
    function Accordion2(items, options) {
      if (items === void 0) {
        items = [];
      }
      if (options === void 0) {
        options = Default;
      }
      this._items = items;
      this._options = __assign(__assign({}, Default), options);
      this._init();
    }
    Accordion2.prototype._init = function() {
      var _this = this;
      if (this._items.length) {
        this._items.map(function(item) {
          if (item.active) {
            _this.open(item.id);
          }
          item.triggerEl.addEventListener("click", function() {
            _this.toggle(item.id);
          });
        });
      }
    };
    Accordion2.prototype.getItem = function(id) {
      return this._items.filter(function(item) {
        return item.id === id;
      })[0];
    };
    Accordion2.prototype.open = function(id) {
      var _a, _b;
      var _this = this;
      var item = this.getItem(id);
      if (!this._options.alwaysOpen) {
        this._items.map(function(i3) {
          var _a2, _b2;
          if (i3 !== item) {
            (_a2 = i3.triggerEl.classList).remove.apply(_a2, _this._options.activeClasses.split(" "));
            (_b2 = i3.triggerEl.classList).add.apply(_b2, _this._options.inactiveClasses.split(" "));
            i3.targetEl.classList.add("hidden");
            i3.triggerEl.setAttribute("aria-expanded", "false");
            i3.active = false;
            if (i3.iconEl) {
              i3.iconEl.classList.remove("rotate-180");
            }
          }
        });
      }
      (_a = item.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(" "));
      (_b = item.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(" "));
      item.triggerEl.setAttribute("aria-expanded", "true");
      item.targetEl.classList.remove("hidden");
      item.active = true;
      if (item.iconEl) {
        item.iconEl.classList.add("rotate-180");
      }
      this._options.onOpen(this, item);
    };
    Accordion2.prototype.toggle = function(id) {
      var item = this.getItem(id);
      if (item.active) {
        this.close(id);
      } else {
        this.open(id);
      }
      this._options.onToggle(this, item);
    };
    Accordion2.prototype.close = function(id) {
      var _a, _b;
      var item = this.getItem(id);
      (_a = item.triggerEl.classList).remove.apply(_a, this._options.activeClasses.split(" "));
      (_b = item.triggerEl.classList).add.apply(_b, this._options.inactiveClasses.split(" "));
      item.targetEl.classList.add("hidden");
      item.triggerEl.setAttribute("aria-expanded", "false");
      item.active = false;
      if (item.iconEl) {
        item.iconEl.classList.remove("rotate-180");
      }
      this._options.onClose(this, item);
    };
    return Accordion2;
  }();
  if (typeof window !== "undefined") {
    window.Accordion = Accordion;
  }
  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function($accordionEl) {
      var alwaysOpen = $accordionEl.getAttribute("data-accordion");
      var activeClasses = $accordionEl.getAttribute("data-active-classes");
      var inactiveClasses = $accordionEl.getAttribute("data-inactive-classes");
      var items = [];
      $accordionEl.querySelectorAll("[data-accordion-target]").forEach(function($triggerEl) {
        var item = {
          id: $triggerEl.getAttribute("data-accordion-target"),
          triggerEl: $triggerEl,
          targetEl: document.querySelector($triggerEl.getAttribute("data-accordion-target")),
          iconEl: $triggerEl.querySelector("[data-accordion-icon]"),
          active: $triggerEl.getAttribute("aria-expanded") === "true" ? true : false
        };
        items.push(item);
      });
      new Accordion(items, {
        alwaysOpen: alwaysOpen === "open" ? true : false,
        activeClasses: activeClasses ? activeClasses : Default.activeClasses,
        inactiveClasses: inactiveClasses ? inactiveClasses : Default.inactiveClasses
      });
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/collapse/index.js
  var __assign2 = function() {
    __assign2 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign2.apply(this, arguments);
  };
  var Default2 = {
    onCollapse: function() {
    },
    onExpand: function() {
    },
    onToggle: function() {
    }
  };
  var Collapse = function() {
    function Collapse2(targetEl, triggerEl, options) {
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (triggerEl === void 0) {
        triggerEl = null;
      }
      if (options === void 0) {
        options = Default2;
      }
      this._targetEl = targetEl;
      this._triggerEl = triggerEl;
      this._options = __assign2(__assign2({}, Default2), options);
      this._visible = false;
      this._init();
    }
    Collapse2.prototype._init = function() {
      var _this = this;
      if (this._triggerEl) {
        if (this._triggerEl.hasAttribute("aria-expanded")) {
          this._visible = this._triggerEl.getAttribute("aria-expanded") === "true";
        } else {
          this._visible = !this._targetEl.classList.contains("hidden");
        }
        this._triggerEl.addEventListener("click", function() {
          _this.toggle();
        });
      }
    };
    Collapse2.prototype.collapse = function() {
      this._targetEl.classList.add("hidden");
      if (this._triggerEl) {
        this._triggerEl.setAttribute("aria-expanded", "false");
      }
      this._visible = false;
      this._options.onCollapse(this);
    };
    Collapse2.prototype.expand = function() {
      this._targetEl.classList.remove("hidden");
      if (this._triggerEl) {
        this._triggerEl.setAttribute("aria-expanded", "true");
      }
      this._visible = true;
      this._options.onExpand(this);
    };
    Collapse2.prototype.toggle = function() {
      if (this._visible) {
        this.collapse();
      } else {
        this.expand();
      }
      this._options.onToggle(this);
    };
    return Collapse2;
  }();
  if (typeof window !== "undefined") {
    window.Collapse = Collapse;
  }
  function initCollapses() {
    document.querySelectorAll("[data-collapse-toggle]").forEach(function($triggerEl) {
      var targetId = $triggerEl.getAttribute("data-collapse-toggle");
      var $targetEl = document.getElementById(targetId);
      if ($targetEl) {
        new Collapse($targetEl, $triggerEl);
      } else {
        console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-collapse-toggle attribute.'));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/carousel/index.js
  var __assign3 = function() {
    __assign3 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign3.apply(this, arguments);
  };
  var Default3 = {
    defaultPosition: 0,
    indicators: {
      items: [],
      activeClasses: "bg-white dark:bg-gray-800",
      inactiveClasses: "bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
    },
    interval: 3e3,
    onNext: function() {
    },
    onPrev: function() {
    },
    onChange: function() {
    }
  };
  var Carousel = function() {
    function Carousel2(items, options) {
      if (items === void 0) {
        items = [];
      }
      if (options === void 0) {
        options = Default3;
      }
      this._items = items;
      this._options = __assign3(__assign3(__assign3({}, Default3), options), { indicators: __assign3(__assign3({}, Default3.indicators), options.indicators) });
      this._activeItem = this.getItem(this._options.defaultPosition);
      this._indicators = this._options.indicators.items;
      this._intervalDuration = this._options.interval;
      this._intervalInstance = null;
      this._init();
    }
    Carousel2.prototype._init = function() {
      var _this = this;
      this._items.map(function(item) {
        item.el.classList.add("absolute", "inset-0", "transition-transform", "transform");
      });
      if (this._getActiveItem()) {
        this.slideTo(this._getActiveItem().position);
      } else {
        this.slideTo(0);
      }
      this._indicators.map(function(indicator, position) {
        indicator.el.addEventListener("click", function() {
          _this.slideTo(position);
        });
      });
    };
    Carousel2.prototype.getItem = function(position) {
      return this._items[position];
    };
    Carousel2.prototype.slideTo = function(position) {
      var nextItem = this._items[position];
      var rotationItems = {
        left: nextItem.position === 0 ? this._items[this._items.length - 1] : this._items[nextItem.position - 1],
        middle: nextItem,
        right: nextItem.position === this._items.length - 1 ? this._items[0] : this._items[nextItem.position + 1]
      };
      this._rotate(rotationItems);
      this._setActiveItem(nextItem);
      if (this._intervalInstance) {
        this.pause();
        this.cycle();
      }
      this._options.onChange(this);
    };
    Carousel2.prototype.next = function() {
      var activeItem = this._getActiveItem();
      var nextItem = null;
      if (activeItem.position === this._items.length - 1) {
        nextItem = this._items[0];
      } else {
        nextItem = this._items[activeItem.position + 1];
      }
      this.slideTo(nextItem.position);
      this._options.onNext(this);
    };
    Carousel2.prototype.prev = function() {
      var activeItem = this._getActiveItem();
      var prevItem = null;
      if (activeItem.position === 0) {
        prevItem = this._items[this._items.length - 1];
      } else {
        prevItem = this._items[activeItem.position - 1];
      }
      this.slideTo(prevItem.position);
      this._options.onPrev(this);
    };
    Carousel2.prototype._rotate = function(rotationItems) {
      this._items.map(function(item) {
        item.el.classList.add("hidden");
      });
      rotationItems.left.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-20");
      rotationItems.left.el.classList.add("-translate-x-full", "z-10");
      rotationItems.middle.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-10");
      rotationItems.middle.el.classList.add("translate-x-0", "z-20");
      rotationItems.right.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-20");
      rotationItems.right.el.classList.add("translate-x-full", "z-10");
    };
    Carousel2.prototype.cycle = function() {
      var _this = this;
      if (typeof window !== "undefined") {
        this._intervalInstance = window.setInterval(function() {
          _this.next();
        }, this._intervalDuration);
      }
    };
    Carousel2.prototype.pause = function() {
      clearInterval(this._intervalInstance);
    };
    Carousel2.prototype._getActiveItem = function() {
      return this._activeItem;
    };
    Carousel2.prototype._setActiveItem = function(item) {
      var _a, _b;
      var _this = this;
      this._activeItem = item;
      var position = item.position;
      if (this._indicators.length) {
        this._indicators.map(function(indicator) {
          var _a2, _b2;
          indicator.el.setAttribute("aria-current", "false");
          (_a2 = indicator.el.classList).remove.apply(_a2, _this._options.indicators.activeClasses.split(" "));
          (_b2 = indicator.el.classList).add.apply(_b2, _this._options.indicators.inactiveClasses.split(" "));
        });
        (_a = this._indicators[position].el.classList).add.apply(_a, this._options.indicators.activeClasses.split(" "));
        (_b = this._indicators[position].el.classList).remove.apply(_b, this._options.indicators.inactiveClasses.split(" "));
        this._indicators[position].el.setAttribute("aria-current", "true");
      }
    };
    return Carousel2;
  }();
  if (typeof window !== "undefined") {
    window.Carousel = Carousel;
  }
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function($carouselEl) {
      var interval = $carouselEl.getAttribute("data-carousel-interval");
      var slide = $carouselEl.getAttribute("data-carousel") === "slide" ? true : false;
      var items = [];
      var defaultPosition = 0;
      if ($carouselEl.querySelectorAll("[data-carousel-item]").length) {
        Array.from($carouselEl.querySelectorAll("[data-carousel-item]")).map(function($carouselItemEl, position) {
          items.push({
            position,
            el: $carouselItemEl
          });
          if ($carouselItemEl.getAttribute("data-carousel-item") === "active") {
            defaultPosition = position;
          }
        });
      }
      var indicators = [];
      if ($carouselEl.querySelectorAll("[data-carousel-slide-to]").length) {
        Array.from($carouselEl.querySelectorAll("[data-carousel-slide-to]")).map(function($indicatorEl) {
          indicators.push({
            position: parseInt($indicatorEl.getAttribute("data-carousel-slide-to")),
            el: $indicatorEl
          });
        });
      }
      var carousel = new Carousel(items, {
        defaultPosition,
        indicators: {
          items: indicators
        },
        interval: interval ? interval : Default3.interval
      });
      if (slide) {
        carousel.cycle();
      }
      var carouselNextEl = $carouselEl.querySelector("[data-carousel-next]");
      var carouselPrevEl = $carouselEl.querySelector("[data-carousel-prev]");
      if (carouselNextEl) {
        carouselNextEl.addEventListener("click", function() {
          carousel.next();
        });
      }
      if (carouselPrevEl) {
        carouselPrevEl.addEventListener("click", function() {
          carousel.prev();
        });
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/dismiss/index.js
  var __assign4 = function() {
    __assign4 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign4.apply(this, arguments);
  };
  var Default4 = {
    transition: "transition-opacity",
    duration: 300,
    timing: "ease-out",
    onHide: function() {
    }
  };
  var Dismiss = function() {
    function Dismiss2(targetEl, triggerEl, options) {
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (triggerEl === void 0) {
        triggerEl = null;
      }
      if (options === void 0) {
        options = Default4;
      }
      this._targetEl = targetEl;
      this._triggerEl = triggerEl;
      this._options = __assign4(__assign4({}, Default4), options);
      this._init();
    }
    Dismiss2.prototype._init = function() {
      var _this = this;
      if (this._triggerEl) {
        this._triggerEl.addEventListener("click", function() {
          _this.hide();
        });
      }
    };
    Dismiss2.prototype.hide = function() {
      var _this = this;
      this._targetEl.classList.add(this._options.transition, "duration-".concat(this._options.duration), this._options.timing, "opacity-0");
      setTimeout(function() {
        _this._targetEl.classList.add("hidden");
      }, this._options.duration);
      this._options.onHide(this, this._targetEl);
    };
    return Dismiss2;
  }();
  if (typeof window !== "undefined") {
    window.Dismiss = Dismiss;
  }
  function initDismisses() {
    document.querySelectorAll("[data-dismiss-target]").forEach(function($triggerEl) {
      var targetId = $triggerEl.getAttribute("data-dismiss-target");
      var $dismissEl = document.querySelector(targetId);
      if ($dismissEl) {
        new Dismiss($dismissEl, $triggerEl);
      } else {
        console.error('The dismiss element with id "'.concat(targetId, '" does not exist. Please check the data-dismiss-target attribute.'));
      }
    });
  }

  // ../../node_modules/@popperjs/core/lib/enums.js
  var top = "top";
  var bottom = "bottom";
  var right = "right";
  var left = "left";
  var auto = "auto";
  var basePlacements = [top, bottom, right, left];
  var start = "start";
  var end = "end";
  var clippingParents = "clippingParents";
  var viewport = "viewport";
  var popper = "popper";
  var reference = "reference";
  var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []);
  var beforeRead = "beforeRead";
  var read = "read";
  var afterRead = "afterRead";
  var beforeMain = "beforeMain";
  var main = "main";
  var afterMain = "afterMain";
  var beforeWrite = "beforeWrite";
  var write = "write";
  var afterWrite = "afterWrite";
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  // ../../node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
  function getNodeName(element) {
    return element ? (element.nodeName || "").toLowerCase() : null;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getWindow.js
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== "[object Window]") {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // ../../node_modules/@popperjs/core/lib/modifiers/applyStyles.js
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function(name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? "" : value);
        }
      });
    });
  }
  function effect(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function() {
      Object.keys(state.elements).forEach(function(name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function(style2, property) {
          style2[property] = "";
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function(attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  var applyStyles_default = {
    name: "applyStyles",
    enabled: true,
    phase: "write",
    fn: applyStyles,
    effect,
    requires: ["computeStyles"]
  };

  // ../../node_modules/@popperjs/core/lib/utils/getBasePlacement.js
  function getBasePlacement(placement) {
    return placement.split("-")[0];
  }

  // ../../node_modules/@popperjs/core/lib/utils/math.js
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  // ../../node_modules/@popperjs/core/lib/utils/userAgent.js
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands) {
      return uaData.brands.map(function(item) {
        return item.brand + "/" + item.version;
      }).join(" ");
    }
    return navigator.userAgent;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x3 = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y3 = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y3,
      right: x3 + width,
      bottom: y3 + height,
      left: x3,
      x: x3,
      y: y3
    };
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height
    };
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/contains.js
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
  function isTableElement(element) {
    return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
  function getDocumentElement(element) {
    return ((isElement(element) ? element.ownerDocument : (
      // $FlowFixMe[prop-missing]
      element.document
    )) || window.document).documentElement;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
  function getParentNode(element) {
    if (getNodeName(element) === "html") {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || // DOM Element detected
      (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element)
    );
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle2(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle2(element);
      if (elementCss.position === "fixed") {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle2(currentNode);
      if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }

  // ../../node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
  }

  // ../../node_modules/@popperjs/core/lib/utils/within.js
  function within(min2, value, max2) {
    return max(min2, min(value, max2));
  }
  function withinMaxClamp(min2, value, max2) {
    var v3 = within(min2, value, max2);
    return v3 > max2 ? max2 : v3;
  }

  // ../../node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  // ../../node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  // ../../node_modules/@popperjs/core/lib/utils/expandToHashMap.js
  function expandToHashMap(value, keys) {
    return keys.reduce(function(hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  // ../../node_modules/@popperjs/core/lib/modifiers/arrow.js
  var toPaddingObject = function toPaddingObject2(padding, state) {
    padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state, name = _ref.name, options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? "height" : "width";
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === "y" ? top : left;
    var maxProp = axis === "y" ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
  }
  function effect2(_ref2) {
    var state = _ref2.state, options = _ref2.options;
    var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === "string") {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (true) {
      if (!isHTMLElement(arrowElement)) {
        console.error(['Popper: "arrow" element must be an HTMLElement (not an SVGElement).', "To use an SVG arrow, wrap it in an HTMLElement that will be used as", "the arrow."].join(" "));
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      if (true) {
        console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', "element."].join(" "));
      }
      return;
    }
    state.elements.arrow = arrowElement;
  }
  var arrow_default = {
    name: "arrow",
    enabled: true,
    phase: "main",
    fn: arrow,
    effect: effect2,
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"]
  };

  // ../../node_modules/@popperjs/core/lib/utils/getVariation.js
  function getVariation(placement) {
    return placement.split("-")[1];
  }

  // ../../node_modules/@popperjs/core/lib/modifiers/computeStyles.js
  var unsetSides = {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto"
  };
  function roundOffsetsByDPR(_ref) {
    var x3 = _ref.x, y3 = _ref.y;
    var win = window;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x3 * dpr) / dpr || 0,
      y: round(y3 * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x, x3 = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y3 = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
      x: x3,
      y: y3
    }) : {
      x: x3,
      y: y3
    };
    x3 = _ref3.x;
    y3 = _ref3.y;
    var hasX = offsets.hasOwnProperty("x");
    var hasY = offsets.hasOwnProperty("y");
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = "clientHeight";
      var widthProp = "clientWidth";
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
          heightProp = "scrollHeight";
          widthProp = "scrollWidth";
        }
      }
      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
          // $FlowFixMe[prop-missing]
          offsetParent[heightProp]
        );
        y3 -= offsetY - popperRect.height;
        y3 *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
          // $FlowFixMe[prop-missing]
          offsetParent[widthProp]
        );
        x3 -= offsetX - popperRect.width;
        x3 *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x: x3,
      y: y3
    }) : {
      x: x3,
      y: y3
    };
    x3 = _ref4.x;
    y3 = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x3 + "px, " + y3 + "px)" : "translate3d(" + x3 + "px, " + y3 + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y3 + "px" : "", _Object$assign2[sideX] = hasX ? x3 + "px" : "", _Object$assign2.transform = "", _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state, options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    if (true) {
      var transitionProperty = getComputedStyle2(state.elements.popper).transitionProperty || "";
      if (adaptive && ["transform", "top", "right", "bottom", "left"].some(function(property) {
        return transitionProperty.indexOf(property) >= 0;
      })) {
        console.warn(["Popper: Detected CSS transitions on at least one of the following", 'CSS properties: "transform", "top", "right", "bottom", "left".', "\n\n", 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', "for smooth transitions, or remove these properties from the CSS", "transition declaration on the popper element if only transitioning", "opacity or background-color for example.", "\n\n", "We recommend using the popper element as a wrapper around an inner", "element that can have any CSS property transitioned for animations."].join(" "));
      }
    }
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === "fixed"
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: "absolute",
        adaptive: false,
        roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-placement": state.placement
    });
  }
  var computeStyles_default = {
    name: "computeStyles",
    enabled: true,
    phase: "beforeWrite",
    fn: computeStyles,
    data: {}
  };

  // ../../node_modules/@popperjs/core/lib/modifiers/eventListeners.js
  var passive = {
    passive: true
  };
  function effect3(_ref) {
    var state = _ref.state, instance = _ref.instance, options = _ref.options;
    var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.addEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener("resize", instance.update, passive);
    }
    return function() {
      if (scroll) {
        scrollParents.forEach(function(scrollParent) {
          scrollParent.removeEventListener("scroll", instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener("resize", instance.update, passive);
      }
    };
  }
  var eventListeners_default = {
    name: "eventListeners",
    enabled: true,
    phase: "write",
    fn: function fn() {
    },
    effect: effect3,
    data: {}
  };

  // ../../node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
  var hash = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function(matched) {
      return hash[matched];
    });
  }

  // ../../node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
  var hash2 = {
    start: "end",
    end: "start"
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function(matched) {
      return hash2[matched];
    });
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop
    };
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x3 = 0;
    var y3 = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x3 = visualViewport.offsetLeft;
        y3 = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x3 + getWindowScrollBarX(element),
      y: y3
    };
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x3 = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y3 = -winScroll.scrollTop;
    if (getComputedStyle2(body || html).direction === "rtl") {
      x3 += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x: x3,
      y: y3
    };
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
  function getScrollParent(node) {
    if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : (
      // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)))
    );
  }

  // ../../node_modules/@popperjs/core/lib/utils/rectToClientRect.js
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === "fixed");
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function(clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  // ../../node_modules/@popperjs/core/lib/utils/computeOffsets.js
  function computeOffsets(_ref) {
    var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === "y" ? "height" : "width";
      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
        default:
      }
    }
    return offsets;
  }

  // ../../node_modules/@popperjs/core/lib/utils/detectOverflow.js
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: "absolute",
      placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function(key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }

  // ../../node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
      return getVariation(placement2) === variation;
    }) : basePlacements;
    var allowedPlacements = placements2.filter(function(placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements2;
      if (true) {
        console.error(["Popper: The `allowedAutoPlacements` option did not allow any", "placements. Ensure the `placement` option matches the variation", "of the allowed placements.", 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(" "));
      }
    }
    var overflows = allowedPlacements.reduce(function(acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function(a3, b3) {
      return overflows[a3] - overflows[b3];
    });
  }

  // ../../node_modules/@popperjs/core/lib/modifiers/flip.js
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
      return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
        flipVariations,
        allowedAutoPlacements
      }) : placement2);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i3 = 0; i3 < placements2.length; i3++) {
      var placement = placements2[i3];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? "width" : "height";
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function(check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function(placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function(check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break")
          break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  var flip_default = {
    name: "flip",
    enabled: true,
    phase: "main",
    fn: flip,
    requiresIfExists: ["offset"],
    data: {
      _skip: false
    }
  };

  // ../../node_modules/@popperjs/core/lib/modifiers/hide.js
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function(side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state, name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: "reference"
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-reference-hidden": isReferenceHidden,
      "data-popper-escaped": hasPopperEscaped
    });
  }
  var hide_default = {
    name: "hide",
    enabled: true,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: hide
  };

  // ../../node_modules/@popperjs/core/lib/modifiers/offset.js
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
      placement
    })) : offset2, skidding = _ref[0], distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state, options = _ref2.options, name = _ref2.name;
    var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function(acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement], x3 = _data$state$placement.x, y3 = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x3;
      state.modifiersData.popperOffsets.y += y3;
    }
    state.modifiersData[name] = data;
  }
  var offset_default = {
    name: "offset",
    enabled: true,
    phase: "main",
    requires: ["popperOffsets"],
    fn: offset
  };

  // ../../node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
  function popperOffsets(_ref) {
    var state = _ref.state, name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: "absolute",
      placement: state.placement
    });
  }
  var popperOffsets_default = {
    name: "popperOffsets",
    enabled: true,
    phase: "read",
    fn: popperOffsets,
    data: {}
  };

  // ../../node_modules/@popperjs/core/lib/utils/getAltAxis.js
  function getAltAxis(axis) {
    return axis === "x" ? "y" : "x";
  }

  // ../../node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
  function preventOverflow(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === "y" ? top : left;
      var altSide = mainAxis === "y" ? bottom : right;
      var len = mainAxis === "y" ? "height" : "width";
      var offset2 = popperOffsets2[mainAxis];
      var min2 = offset2 + overflow[mainSide];
      var max2 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
      popperOffsets2[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === "y" ? "height" : "width";
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data;
  }
  var preventOverflow_default = {
    name: "preventOverflow",
    enabled: true,
    phase: "main",
    fn: preventOverflow,
    requiresIfExists: ["offset"]
  };

  // ../../node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  // ../../node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  // ../../node_modules/@popperjs/core/lib/utils/orderModifiers.js
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function(modifier) {
      map.set(modifier.name, modifier);
    });
    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function(dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function(modifier) {
      if (!visited.has(modifier.name)) {
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function(acc, phase) {
      return acc.concat(orderedModifiers.filter(function(modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  // ../../node_modules/@popperjs/core/lib/utils/debounce.js
  function debounce2(fn2) {
    var pending;
    return function() {
      if (!pending) {
        pending = new Promise(function(resolve) {
          Promise.resolve().then(function() {
            pending = void 0;
            resolve(fn2());
          });
        });
      }
      return pending;
    };
  }

  // ../../node_modules/@popperjs/core/lib/utils/format.js
  function format(str) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return [].concat(args).reduce(function(p3, c3) {
      return p3.replace(/%s/, c3);
    }, str);
  }

  // ../../node_modules/@popperjs/core/lib/utils/validateModifiers.js
  var INVALID_MODIFIER_ERROR = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s';
  var MISSING_DEPENDENCY_ERROR = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available';
  var VALID_PROPERTIES = ["name", "enabled", "phase", "fn", "effect", "requires", "options"];
  function validateModifiers(modifiers) {
    modifiers.forEach(function(modifier) {
      [].concat(Object.keys(modifier), VALID_PROPERTIES).filter(function(value, index, self2) {
        return self2.indexOf(value) === index;
      }).forEach(function(key) {
        switch (key) {
          case "name":
            if (typeof modifier.name !== "string") {
              console.error(format(INVALID_MODIFIER_ERROR, String(modifier.name), '"name"', '"string"', '"' + String(modifier.name) + '"'));
            }
            break;
          case "enabled":
            if (typeof modifier.enabled !== "boolean") {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"enabled"', '"boolean"', '"' + String(modifier.enabled) + '"'));
            }
            break;
          case "phase":
            if (modifierPhases.indexOf(modifier.phase) < 0) {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"phase"', "either " + modifierPhases.join(", "), '"' + String(modifier.phase) + '"'));
            }
            break;
          case "fn":
            if (typeof modifier.fn !== "function") {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"fn"', '"function"', '"' + String(modifier.fn) + '"'));
            }
            break;
          case "effect":
            if (modifier.effect != null && typeof modifier.effect !== "function") {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"effect"', '"function"', '"' + String(modifier.fn) + '"'));
            }
            break;
          case "requires":
            if (modifier.requires != null && !Array.isArray(modifier.requires)) {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requires"', '"array"', '"' + String(modifier.requires) + '"'));
            }
            break;
          case "requiresIfExists":
            if (!Array.isArray(modifier.requiresIfExists)) {
              console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requiresIfExists"', '"array"', '"' + String(modifier.requiresIfExists) + '"'));
            }
            break;
          case "options":
          case "data":
            break;
          default:
            console.error('PopperJS: an invalid property has been provided to the "' + modifier.name + '" modifier, valid properties are ' + VALID_PROPERTIES.map(function(s3) {
              return '"' + s3 + '"';
            }).join(", ") + '; but "' + key + '" was provided.');
        }
        modifier.requires && modifier.requires.forEach(function(requirement) {
          if (modifiers.find(function(mod) {
            return mod.name === requirement;
          }) == null) {
            console.error(format(MISSING_DEPENDENCY_ERROR, String(modifier.name), requirement, requirement));
          }
        });
      });
    });
  }

  // ../../node_modules/@popperjs/core/lib/utils/uniqueBy.js
  function uniqueBy(arr, fn2) {
    var identifiers = /* @__PURE__ */ new Set();
    return arr.filter(function(item) {
      var identifier = fn2(item);
      if (!identifiers.has(identifier)) {
        identifiers.add(identifier);
        return true;
      }
    });
  }

  // ../../node_modules/@popperjs/core/lib/utils/mergeByName.js
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function(merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function(key) {
      return merged[key];
    });
  }

  // ../../node_modules/@popperjs/core/lib/createPopper.js
  var INVALID_ELEMENT_ERROR = "Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.";
  var INFINITE_LOOP_ERROR = "Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.";
  var DEFAULT_OPTIONS = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute"
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function(element) {
      return !(element && typeof element.getBoundingClientRect === "function");
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions2 = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper2(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions2;
      }
      var state = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions2),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions2, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
            popper: listScrollParents(popper2)
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function(m3) {
            return m3.enabled;
          });
          if (true) {
            var modifiers = uniqueBy([].concat(orderedModifiers, state.options.modifiers), function(_ref) {
              var name = _ref.name;
              return name;
            });
            validateModifiers(modifiers);
            if (getBasePlacement(state.options.placement) === auto) {
              var flipModifier = state.orderedModifiers.find(function(_ref2) {
                var name = _ref2.name;
                return name === "flip";
              });
              if (!flipModifier) {
                console.error(['Popper: "auto" placements require the "flip" modifier be', "present and enabled to work."].join(" "));
              }
            }
            var _getComputedStyle = getComputedStyle2(popper2), marginTop = _getComputedStyle.marginTop, marginRight = _getComputedStyle.marginRight, marginBottom = _getComputedStyle.marginBottom, marginLeft = _getComputedStyle.marginLeft;
            if ([marginTop, marginRight, marginBottom, marginLeft].some(function(margin) {
              return parseFloat(margin);
            })) {
              console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', "between the popper and its reference element or boundary.", "To replicate margin, use the `offset` modifier, as well as", "the `padding` option in the `preventOverflow` and `flip`", "modifiers."].join(" "));
            }
          }
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            if (true) {
              console.error(INVALID_ELEMENT_ERROR);
            }
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
            popper: getLayoutRect(popper3)
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function(modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          var __debug_loops__ = 0;
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (true) {
              __debug_loops__ += 1;
              if (__debug_loops__ > 100) {
                console.error(INFINITE_LOOP_ERROR);
                break;
              }
            }
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
            if (typeof fn2 === "function") {
              state = fn2({
                state,
                options: _options,
                name,
                instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce2(function() {
          return new Promise(function(resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference2, popper2)) {
        if (true) {
          console.error(INVALID_ELEMENT_ERROR);
        }
        return instance;
      }
      instance.setOptions(options).then(function(state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function(_ref3) {
          var name = _ref3.name, _ref3$options = _ref3.options, options2 = _ref3$options === void 0 ? {} : _ref3$options, effect4 = _ref3.effect;
          if (typeof effect4 === "function") {
            var cleanupFn = effect4({
              state,
              name,
              instance,
              options: options2
            });
            var noopFn = function noopFn2() {
            };
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function(fn2) {
          return fn2();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }

  // ../../node_modules/@popperjs/core/lib/popper.js
  var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default, offset_default, flip_default, preventOverflow_default, arrow_default, hide_default];
  var createPopper = /* @__PURE__ */ popperGenerator({
    defaultModifiers
  });

  // ../../node_modules/flowbite/lib/esm/components/dropdown/index.js
  var __assign5 = function() {
    __assign5 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign5.apply(this, arguments);
  };
  var __spreadArray = function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i3 = 0, l3 = from.length, ar; i3 < l3; i3++) {
        if (ar || !(i3 in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i3);
          ar[i3] = from[i3];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var Default5 = {
    placement: "bottom",
    triggerType: "click",
    offsetSkidding: 0,
    offsetDistance: 10,
    delay: 300,
    onShow: function() {
    },
    onHide: function() {
    },
    onToggle: function() {
    }
  };
  var Dropdown = function() {
    function Dropdown2(targetElement, triggerElement, options) {
      if (targetElement === void 0) {
        targetElement = null;
      }
      if (triggerElement === void 0) {
        triggerElement = null;
      }
      if (options === void 0) {
        options = Default5;
      }
      this._targetEl = targetElement;
      this._triggerEl = triggerElement;
      this._options = __assign5(__assign5({}, Default5), options);
      this._popperInstance = this._createPopperInstance();
      this._visible = false;
      this._init();
    }
    Dropdown2.prototype._init = function() {
      if (this._triggerEl) {
        this._setupEventListeners();
      }
    };
    Dropdown2.prototype._setupEventListeners = function() {
      var _this = this;
      var triggerEvents = this._getTriggerEvents();
      if (this._options.triggerType === "click") {
        triggerEvents.showEvents.forEach(function(ev) {
          _this._triggerEl.addEventListener(ev, function() {
            _this.toggle();
          });
        });
      }
      if (this._options.triggerType === "hover") {
        triggerEvents.showEvents.forEach(function(ev) {
          _this._triggerEl.addEventListener(ev, function() {
            if (ev === "click") {
              _this.toggle();
            } else {
              setTimeout(function() {
                _this.show();
              }, _this._options.delay);
            }
          });
          _this._targetEl.addEventListener(ev, function() {
            _this.show();
          });
        });
        triggerEvents.hideEvents.forEach(function(ev) {
          _this._triggerEl.addEventListener(ev, function() {
            setTimeout(function() {
              if (!_this._targetEl.matches(":hover")) {
                _this.hide();
              }
            }, _this._options.delay);
          });
          _this._targetEl.addEventListener(ev, function() {
            setTimeout(function() {
              if (!_this._triggerEl.matches(":hover")) {
                _this.hide();
              }
            }, _this._options.delay);
          });
        });
      }
    };
    Dropdown2.prototype._createPopperInstance = function() {
      return createPopper(this._triggerEl, this._targetEl, {
        placement: this._options.placement,
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [
                this._options.offsetSkidding,
                this._options.offsetDistance
              ]
            }
          }
        ]
      });
    };
    Dropdown2.prototype._setupClickOutsideListener = function() {
      var _this = this;
      this._clickOutsideEventListener = function(ev) {
        _this._handleClickOutside(ev, _this._targetEl);
      };
      document.body.addEventListener("click", this._clickOutsideEventListener, true);
    };
    Dropdown2.prototype._removeClickOutsideListener = function() {
      document.body.removeEventListener("click", this._clickOutsideEventListener, true);
    };
    Dropdown2.prototype._handleClickOutside = function(ev, targetEl) {
      var clickedEl = ev.target;
      if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
        this.hide();
      }
    };
    Dropdown2.prototype._getTriggerEvents = function() {
      switch (this._options.triggerType) {
        case "hover":
          return {
            showEvents: ["mouseenter", "click"],
            hideEvents: ["mouseleave"]
          };
        case "click":
          return {
            showEvents: ["click"],
            hideEvents: []
          };
        case "none":
          return {
            showEvents: [],
            hideEvents: []
          };
        default:
          return {
            showEvents: ["click"],
            hideEvents: []
          };
      }
    };
    Dropdown2.prototype.toggle = function() {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
      this._options.onToggle(this);
    };
    Dropdown2.prototype.isVisible = function() {
      return this._visible;
    };
    Dropdown2.prototype.show = function() {
      this._targetEl.classList.remove("hidden");
      this._targetEl.classList.add("block");
      this._popperInstance.setOptions(function(options) {
        return __assign5(__assign5({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
          { name: "eventListeners", enabled: true }
        ], false) });
      });
      this._setupClickOutsideListener();
      this._popperInstance.update();
      this._visible = true;
      this._options.onShow(this);
    };
    Dropdown2.prototype.hide = function() {
      this._targetEl.classList.remove("block");
      this._targetEl.classList.add("hidden");
      this._popperInstance.setOptions(function(options) {
        return __assign5(__assign5({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
          { name: "eventListeners", enabled: false }
        ], false) });
      });
      this._visible = false;
      this._removeClickOutsideListener();
      this._options.onHide(this);
    };
    return Dropdown2;
  }();
  if (typeof window !== "undefined") {
    window.Dropdown = Dropdown;
  }
  function initDropdowns() {
    document.querySelectorAll("[data-dropdown-toggle]").forEach(function($triggerEl) {
      var dropdownId = $triggerEl.getAttribute("data-dropdown-toggle");
      var $dropdownEl = document.getElementById(dropdownId);
      if ($dropdownEl) {
        var placement = $triggerEl.getAttribute("data-dropdown-placement");
        var offsetSkidding = $triggerEl.getAttribute("data-dropdown-offset-skidding");
        var offsetDistance = $triggerEl.getAttribute("data-dropdown-offset-distance");
        var triggerType = $triggerEl.getAttribute("data-dropdown-trigger");
        var delay = $triggerEl.getAttribute("data-dropdown-delay");
        new Dropdown($dropdownEl, $triggerEl, {
          placement: placement ? placement : Default5.placement,
          triggerType: triggerType ? triggerType : Default5.triggerType,
          offsetSkidding: offsetSkidding ? parseInt(offsetSkidding) : Default5.offsetSkidding,
          offsetDistance: offsetDistance ? parseInt(offsetDistance) : Default5.offsetDistance,
          delay: delay ? parseInt(delay) : Default5.delay
        });
      } else {
        console.error('The dropdown element with id "'.concat(dropdownId, '" does not exist. Please check the data-dropdown-toggle attribute.'));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/modal/index.js
  var __assign6 = function() {
    __assign6 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign6.apply(this, arguments);
  };
  var Default6 = {
    placement: "center",
    backdropClasses: "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
    backdrop: "dynamic",
    closable: true,
    onHide: function() {
    },
    onShow: function() {
    },
    onToggle: function() {
    }
  };
  var Modal = function() {
    function Modal2(targetEl, options) {
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (options === void 0) {
        options = Default6;
      }
      this._targetEl = targetEl;
      this._options = __assign6(__assign6({}, Default6), options);
      this._isHidden = true;
      this._backdropEl = null;
      this._init();
    }
    Modal2.prototype._init = function() {
      var _this = this;
      if (this._targetEl) {
        this._getPlacementClasses().map(function(c3) {
          _this._targetEl.classList.add(c3);
        });
      }
    };
    Modal2.prototype._createBackdrop = function() {
      var _a;
      if (this._isHidden) {
        var backdropEl = document.createElement("div");
        backdropEl.setAttribute("modal-backdrop", "");
        (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(" "));
        document.querySelector("body").append(backdropEl);
        this._backdropEl = backdropEl;
      }
    };
    Modal2.prototype._destroyBackdropEl = function() {
      if (!this._isHidden) {
        document.querySelector("[modal-backdrop]").remove();
      }
    };
    Modal2.prototype._setupModalCloseEventListeners = function() {
      var _this = this;
      if (this._options.backdrop === "dynamic") {
        this._clickOutsideEventListener = function(ev) {
          _this._handleOutsideClick(ev.target);
        };
        this._targetEl.addEventListener("click", this._clickOutsideEventListener, true);
      }
      this._keydownEventListener = function(ev) {
        if (ev.key === "Escape") {
          _this.hide();
        }
      };
      document.body.addEventListener("keydown", this._keydownEventListener, true);
    };
    Modal2.prototype._removeModalCloseEventListeners = function() {
      if (this._options.backdrop === "dynamic") {
        this._targetEl.removeEventListener("click", this._clickOutsideEventListener, true);
      }
      document.body.removeEventListener("keydown", this._keydownEventListener, true);
    };
    Modal2.prototype._handleOutsideClick = function(target) {
      if (target === this._targetEl || target === this._backdropEl && this.isVisible()) {
        this.hide();
      }
    };
    Modal2.prototype._getPlacementClasses = function() {
      switch (this._options.placement) {
        case "top-left":
          return ["justify-start", "items-start"];
        case "top-center":
          return ["justify-center", "items-start"];
        case "top-right":
          return ["justify-end", "items-start"];
        case "center-left":
          return ["justify-start", "items-center"];
        case "center":
          return ["justify-center", "items-center"];
        case "center-right":
          return ["justify-end", "items-center"];
        case "bottom-left":
          return ["justify-start", "items-end"];
        case "bottom-center":
          return ["justify-center", "items-end"];
        case "bottom-right":
          return ["justify-end", "items-end"];
        default:
          return ["justify-center", "items-center"];
      }
    };
    Modal2.prototype.toggle = function() {
      if (this._isHidden) {
        this.show();
      } else {
        this.hide();
      }
      this._options.onToggle(this);
    };
    Modal2.prototype.show = function() {
      if (this.isHidden) {
        this._targetEl.classList.add("flex");
        this._targetEl.classList.remove("hidden");
        this._targetEl.setAttribute("aria-modal", "true");
        this._targetEl.setAttribute("role", "dialog");
        this._targetEl.removeAttribute("aria-hidden");
        this._createBackdrop();
        this._isHidden = false;
        document.body.classList.add("overflow-hidden");
        if (this._options.closable) {
          this._setupModalCloseEventListeners();
        }
        this._options.onShow(this);
      }
    };
    Modal2.prototype.hide = function() {
      if (this.isVisible) {
        this._targetEl.classList.add("hidden");
        this._targetEl.classList.remove("flex");
        this._targetEl.setAttribute("aria-hidden", "true");
        this._targetEl.removeAttribute("aria-modal");
        this._targetEl.removeAttribute("role");
        this._destroyBackdropEl();
        this._isHidden = true;
        document.body.classList.remove("overflow-hidden");
        if (this._options.closable) {
          this._removeModalCloseEventListeners();
        }
        this._options.onHide(this);
      }
    };
    Modal2.prototype.isVisible = function() {
      return !this._isHidden;
    };
    Modal2.prototype.isHidden = function() {
      return this._isHidden;
    };
    return Modal2;
  }();
  if (typeof window !== "undefined") {
    window.Modal = Modal;
  }
  var getModalInstance = function(id, instances) {
    if (instances.some(function(modalInstance) {
      return modalInstance.id === id;
    })) {
      return instances.find(function(modalInstance) {
        return modalInstance.id === id;
      });
    }
    return null;
  };
  function initModals() {
    var modalInstances = [];
    document.querySelectorAll("[data-modal-target]").forEach(function($triggerEl) {
      var modalId = $triggerEl.getAttribute("data-modal-target");
      var $modalEl = document.getElementById(modalId);
      if ($modalEl) {
        var placement = $modalEl.getAttribute("data-modal-placement");
        var backdrop = $modalEl.getAttribute("data-modal-backdrop");
        if (!getModalInstance(modalId, modalInstances)) {
          modalInstances.push({
            id: modalId,
            object: new Modal($modalEl, {
              placement: placement ? placement : Default6.placement,
              backdrop: backdrop ? backdrop : Default6.backdrop
            })
          });
        }
      } else {
        console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-target attribute points to the correct modal id?."));
      }
    });
    document.querySelectorAll("[data-modal-toggle]").forEach(function($triggerEl) {
      var modalId = $triggerEl.getAttribute("data-modal-toggle");
      var $modalEl = document.getElementById(modalId);
      if ($modalEl) {
        var placement = $modalEl.getAttribute("data-modal-placement");
        var backdrop = $modalEl.getAttribute("data-modal-backdrop");
        var modal_1 = getModalInstance(modalId, modalInstances);
        if (!modal_1) {
          modal_1 = {
            id: modalId,
            object: new Modal($modalEl, {
              placement: placement ? placement : Default6.placement,
              backdrop: backdrop ? backdrop : Default6.backdrop
            })
          };
          modalInstances.push(modal_1);
        }
        $triggerEl.addEventListener("click", function() {
          modal_1.object.toggle();
        });
      } else {
        console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-toggle attribute points to the correct modal id?"));
      }
    });
    document.querySelectorAll("[data-modal-show]").forEach(function($triggerEl) {
      var modalId = $triggerEl.getAttribute("data-modal-show");
      var $modalEl = document.getElementById(modalId);
      if ($modalEl) {
        var modal_2 = getModalInstance(modalId, modalInstances);
        if (modal_2) {
          $triggerEl.addEventListener("click", function() {
            if (modal_2.object.isHidden) {
              modal_2.object.show();
            }
          });
        } else {
          console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
        }
      } else {
        console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-show attribute points to the correct modal id?"));
      }
    });
    document.querySelectorAll("[data-modal-hide]").forEach(function($triggerEl) {
      var modalId = $triggerEl.getAttribute("data-modal-hide");
      var $modalEl = document.getElementById(modalId);
      if ($modalEl) {
        var modal_3 = getModalInstance(modalId, modalInstances);
        if (modal_3) {
          $triggerEl.addEventListener("click", function() {
            if (modal_3.object.isVisible) {
              modal_3.object.hide();
            }
          });
        } else {
          console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
        }
      } else {
        console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-hide attribute points to the correct modal id?"));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/drawer/index.js
  var __assign7 = function() {
    __assign7 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign7.apply(this, arguments);
  };
  var Default7 = {
    placement: "left",
    bodyScrolling: false,
    backdrop: true,
    edge: false,
    edgeOffset: "bottom-[60px]",
    backdropClasses: "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-30",
    onShow: function() {
    },
    onHide: function() {
    },
    onToggle: function() {
    }
  };
  var Drawer = function() {
    function Drawer2(targetEl, options) {
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (options === void 0) {
        options = Default7;
      }
      this._targetEl = targetEl;
      this._options = __assign7(__assign7({}, Default7), options);
      this._visible = false;
      this._init();
    }
    Drawer2.prototype._init = function() {
      var _this = this;
      if (this._targetEl) {
        this._targetEl.setAttribute("aria-hidden", "true");
        this._targetEl.classList.add("transition-transform");
      }
      this._getPlacementClasses(this._options.placement).base.map(function(c3) {
        _this._targetEl.classList.add(c3);
      });
      document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
          if (_this.isVisible()) {
            _this.hide();
          }
        }
      });
    };
    Drawer2.prototype.hide = function() {
      var _this = this;
      if (this._options.edge) {
        this._getPlacementClasses(this._options.placement + "-edge").active.map(function(c3) {
          _this._targetEl.classList.remove(c3);
        });
        this._getPlacementClasses(this._options.placement + "-edge").inactive.map(function(c3) {
          _this._targetEl.classList.add(c3);
        });
      } else {
        this._getPlacementClasses(this._options.placement).active.map(function(c3) {
          _this._targetEl.classList.remove(c3);
        });
        this._getPlacementClasses(this._options.placement).inactive.map(function(c3) {
          _this._targetEl.classList.add(c3);
        });
      }
      this._targetEl.setAttribute("aria-hidden", "true");
      this._targetEl.removeAttribute("aria-modal");
      this._targetEl.removeAttribute("role");
      if (!this._options.bodyScrolling) {
        document.body.classList.remove("overflow-hidden");
      }
      if (this._options.backdrop) {
        this._destroyBackdropEl();
      }
      this._visible = false;
      this._options.onHide(this);
    };
    Drawer2.prototype.show = function() {
      var _this = this;
      if (this._options.edge) {
        this._getPlacementClasses(this._options.placement + "-edge").active.map(function(c3) {
          _this._targetEl.classList.add(c3);
        });
        this._getPlacementClasses(this._options.placement + "-edge").inactive.map(function(c3) {
          _this._targetEl.classList.remove(c3);
        });
      } else {
        this._getPlacementClasses(this._options.placement).active.map(function(c3) {
          _this._targetEl.classList.add(c3);
        });
        this._getPlacementClasses(this._options.placement).inactive.map(function(c3) {
          _this._targetEl.classList.remove(c3);
        });
      }
      this._targetEl.setAttribute("aria-modal", "true");
      this._targetEl.setAttribute("role", "dialog");
      this._targetEl.removeAttribute("aria-hidden");
      if (!this._options.bodyScrolling) {
        document.body.classList.add("overflow-hidden");
      }
      if (this._options.backdrop) {
        this._createBackdrop();
      }
      this._visible = true;
      this._options.onShow(this);
    };
    Drawer2.prototype.toggle = function() {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
    };
    Drawer2.prototype._createBackdrop = function() {
      var _a;
      var _this = this;
      if (!this._visible) {
        var backdropEl = document.createElement("div");
        backdropEl.setAttribute("drawer-backdrop", "");
        (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(" "));
        document.querySelector("body").append(backdropEl);
        backdropEl.addEventListener("click", function() {
          _this.hide();
        });
      }
    };
    Drawer2.prototype._destroyBackdropEl = function() {
      if (this._visible) {
        document.querySelector("[drawer-backdrop]").remove();
      }
    };
    Drawer2.prototype._getPlacementClasses = function(placement) {
      switch (placement) {
        case "top":
          return {
            base: ["top-0", "left-0", "right-0"],
            active: ["transform-none"],
            inactive: ["-translate-y-full"]
          };
        case "right":
          return {
            base: ["right-0", "top-0"],
            active: ["transform-none"],
            inactive: ["translate-x-full"]
          };
        case "bottom":
          return {
            base: ["bottom-0", "left-0", "right-0"],
            active: ["transform-none"],
            inactive: ["translate-y-full"]
          };
        case "left":
          return {
            base: ["left-0", "top-0"],
            active: ["transform-none"],
            inactive: ["-translate-x-full"]
          };
        case "bottom-edge":
          return {
            base: ["left-0", "top-0"],
            active: ["transform-none"],
            inactive: ["translate-y-full", this._options.edgeOffset]
          };
        default:
          return {
            base: ["left-0", "top-0"],
            active: ["transform-none"],
            inactive: ["-translate-x-full"]
          };
      }
    };
    Drawer2.prototype.isHidden = function() {
      return !this._visible;
    };
    Drawer2.prototype.isVisible = function() {
      return this._visible;
    };
    return Drawer2;
  }();
  if (typeof window !== "undefined") {
    window.Drawer = Drawer;
  }
  var getDrawerInstance = function(id, instances) {
    if (instances.some(function(drawerInstance) {
      return drawerInstance.id === id;
    })) {
      return instances.find(function(drawerInstance) {
        return drawerInstance.id === id;
      });
    }
  };
  function initDrawers() {
    var drawerInstances = [];
    document.querySelectorAll("[data-drawer-target]").forEach(function($triggerEl) {
      var drawerId = $triggerEl.getAttribute("data-drawer-target");
      var $drawerEl = document.getElementById(drawerId);
      if ($drawerEl) {
        var placement = $triggerEl.getAttribute("data-drawer-placement");
        var bodyScrolling = $triggerEl.getAttribute("data-drawer-body-scrolling");
        var backdrop = $triggerEl.getAttribute("data-drawer-backdrop");
        var edge = $triggerEl.getAttribute("data-drawer-edge");
        var edgeOffset = $triggerEl.getAttribute("data-drawer-edge-offset");
        if (!getDrawerInstance(drawerId, drawerInstances)) {
          drawerInstances.push({
            id: drawerId,
            object: new Drawer($drawerEl, {
              placement: placement ? placement : Default7.placement,
              bodyScrolling: bodyScrolling ? bodyScrolling === "true" ? true : false : Default7.bodyScrolling,
              backdrop: backdrop ? backdrop === "true" ? true : false : Default7.backdrop,
              edge: edge ? edge === "true" ? true : false : Default7.edge,
              edgeOffset: edgeOffset ? edgeOffset : Default7.edgeOffset
            })
          });
        }
      } else {
        console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
      }
    });
    document.querySelectorAll("[data-drawer-toggle]").forEach(function($triggerEl) {
      var drawerId = $triggerEl.getAttribute("data-drawer-toggle");
      var $drawerEl = document.getElementById(drawerId);
      if ($drawerEl) {
        var drawer_1 = getDrawerInstance(drawerId, drawerInstances);
        if (drawer_1) {
          $triggerEl.addEventListener("click", function() {
            drawer_1.object.toggle();
          });
        } else {
          console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
        }
      } else {
        console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
      }
    });
    document.querySelectorAll("[data-drawer-dismiss], [data-drawer-hide]").forEach(function($triggerEl) {
      var drawerId = $triggerEl.getAttribute("data-drawer-dismiss") ? $triggerEl.getAttribute("data-drawer-dismiss") : $triggerEl.getAttribute("data-drawer-hide");
      var $drawerEl = document.getElementById(drawerId);
      if ($drawerEl) {
        var drawer_2 = getDrawerInstance(drawerId, drawerInstances);
        if (drawer_2) {
          $triggerEl.addEventListener("click", function() {
            drawer_2.object.hide();
          });
        } else {
          console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
        }
      } else {
        console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id"));
      }
    });
    document.querySelectorAll("[data-drawer-show]").forEach(function($triggerEl) {
      var drawerId = $triggerEl.getAttribute("data-drawer-show");
      var $drawerEl = document.getElementById(drawerId);
      if ($drawerEl) {
        var drawer_3 = getDrawerInstance(drawerId, drawerInstances);
        if (drawer_3) {
          $triggerEl.addEventListener("click", function() {
            drawer_3.object.show();
          });
        } else {
          console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
        }
      } else {
        console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/tabs/index.js
  var __assign8 = function() {
    __assign8 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign8.apply(this, arguments);
  };
  var Default8 = {
    defaultTabId: null,
    activeClasses: "text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 border-blue-600 dark:border-blue-500",
    inactiveClasses: "dark:border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300",
    onShow: function() {
    }
  };
  var Tabs = function() {
    function Tabs2(items, options) {
      if (items === void 0) {
        items = [];
      }
      if (options === void 0) {
        options = Default8;
      }
      this._items = items;
      this._activeTab = options ? this.getTab(options.defaultTabId) : null;
      this._options = __assign8(__assign8({}, Default8), options);
      this._init();
    }
    Tabs2.prototype._init = function() {
      var _this = this;
      if (this._items.length) {
        if (!this._activeTab) {
          this._setActiveTab(this._items[0]);
        }
        this.show(this._activeTab.id, true);
        this._items.map(function(tab) {
          tab.triggerEl.addEventListener("click", function() {
            _this.show(tab.id);
          });
        });
      }
    };
    Tabs2.prototype.getActiveTab = function() {
      return this._activeTab;
    };
    Tabs2.prototype._setActiveTab = function(tab) {
      this._activeTab = tab;
    };
    Tabs2.prototype.getTab = function(id) {
      return this._items.filter(function(t2) {
        return t2.id === id;
      })[0];
    };
    Tabs2.prototype.show = function(id, forceShow) {
      var _a, _b;
      var _this = this;
      if (forceShow === void 0) {
        forceShow = false;
      }
      var tab = this.getTab(id);
      if (tab === this._activeTab && !forceShow) {
        return;
      }
      this._items.map(function(t2) {
        var _a2, _b2;
        if (t2 !== tab) {
          (_a2 = t2.triggerEl.classList).remove.apply(_a2, _this._options.activeClasses.split(" "));
          (_b2 = t2.triggerEl.classList).add.apply(_b2, _this._options.inactiveClasses.split(" "));
          t2.targetEl.classList.add("hidden");
          t2.triggerEl.setAttribute("aria-selected", "false");
        }
      });
      (_a = tab.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(" "));
      (_b = tab.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(" "));
      tab.triggerEl.setAttribute("aria-selected", "true");
      tab.targetEl.classList.remove("hidden");
      this._setActiveTab(tab);
      this._options.onShow(this, tab);
    };
    return Tabs2;
  }();
  if (typeof window !== "undefined") {
    window.Tabs = Tabs;
  }
  function initTabs() {
    document.querySelectorAll("[data-tabs-toggle]").forEach(function($triggerEl) {
      var tabItems = [];
      var defaultTabId = null;
      $triggerEl.querySelectorAll('[role="tab"]').forEach(function($triggerEl2) {
        var isActive = $triggerEl2.getAttribute("aria-selected") === "true";
        var tab = {
          id: $triggerEl2.getAttribute("data-tabs-target"),
          triggerEl: $triggerEl2,
          targetEl: document.querySelector($triggerEl2.getAttribute("data-tabs-target"))
        };
        tabItems.push(tab);
        if (isActive) {
          defaultTabId = tab.id;
        }
      });
      new Tabs(tabItems, {
        defaultTabId
      });
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/tooltip/index.js
  var __assign9 = function() {
    __assign9 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign9.apply(this, arguments);
  };
  var __spreadArray2 = function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i3 = 0, l3 = from.length, ar; i3 < l3; i3++) {
        if (ar || !(i3 in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i3);
          ar[i3] = from[i3];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var Default9 = {
    placement: "top",
    triggerType: "hover",
    onShow: function() {
    },
    onHide: function() {
    },
    onToggle: function() {
    }
  };
  var Tooltip = function() {
    function Tooltip2(targetEl, triggerEl, options) {
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (triggerEl === void 0) {
        triggerEl = null;
      }
      if (options === void 0) {
        options = Default9;
      }
      this._targetEl = targetEl;
      this._triggerEl = triggerEl;
      this._options = __assign9(__assign9({}, Default9), options);
      this._popperInstance = this._createPopperInstance();
      this._visible = false;
      this._init();
    }
    Tooltip2.prototype._init = function() {
      if (this._triggerEl) {
        this._setupEventListeners();
      }
    };
    Tooltip2.prototype._setupEventListeners = function() {
      var _this = this;
      var triggerEvents = this._getTriggerEvents();
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, function() {
          _this.show();
        });
      });
      triggerEvents.hideEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, function() {
          _this.hide();
        });
      });
    };
    Tooltip2.prototype._createPopperInstance = function() {
      return createPopper(this._triggerEl, this._targetEl, {
        placement: this._options.placement,
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8]
            }
          }
        ]
      });
    };
    Tooltip2.prototype._getTriggerEvents = function() {
      switch (this._options.triggerType) {
        case "hover":
          return {
            showEvents: ["mouseenter", "focus"],
            hideEvents: ["mouseleave", "blur"]
          };
        case "click":
          return {
            showEvents: ["click", "focus"],
            hideEvents: ["focusout", "blur"]
          };
        case "none":
          return {
            showEvents: [],
            hideEvents: []
          };
        default:
          return {
            showEvents: ["mouseenter", "focus"],
            hideEvents: ["mouseleave", "blur"]
          };
      }
    };
    Tooltip2.prototype._setupClickOutsideListener = function() {
      var _this = this;
      this._clickOutsideEventListener = function(ev) {
        _this._handleClickOutside(ev, _this._targetEl);
      };
      document.body.addEventListener("click", this._clickOutsideEventListener, true);
    };
    Tooltip2.prototype._removeClickOutsideListener = function() {
      document.body.removeEventListener("click", this._clickOutsideEventListener, true);
    };
    Tooltip2.prototype._handleClickOutside = function(ev, targetEl) {
      var clickedEl = ev.target;
      if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
        this.hide();
      }
    };
    Tooltip2.prototype.isVisible = function() {
      return this._visible;
    };
    Tooltip2.prototype.toggle = function() {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
    };
    Tooltip2.prototype.show = function() {
      this._targetEl.classList.remove("opacity-0", "invisible");
      this._targetEl.classList.add("opacity-100", "visible");
      this._popperInstance.setOptions(function(options) {
        return __assign9(__assign9({}, options), { modifiers: __spreadArray2(__spreadArray2([], options.modifiers, true), [
          { name: "eventListeners", enabled: true }
        ], false) });
      });
      this._setupClickOutsideListener();
      this._popperInstance.update();
      this._visible = true;
      this._options.onShow(this);
    };
    Tooltip2.prototype.hide = function() {
      this._targetEl.classList.remove("opacity-100", "visible");
      this._targetEl.classList.add("opacity-0", "invisible");
      this._popperInstance.setOptions(function(options) {
        return __assign9(__assign9({}, options), { modifiers: __spreadArray2(__spreadArray2([], options.modifiers, true), [
          { name: "eventListeners", enabled: false }
        ], false) });
      });
      this._removeClickOutsideListener();
      this._visible = false;
      this._options.onHide(this);
    };
    return Tooltip2;
  }();
  if (typeof window !== "undefined") {
    window.Tooltip = Tooltip;
  }
  function initTooltips() {
    document.querySelectorAll("[data-tooltip-target]").forEach(function($triggerEl) {
      var tooltipId = $triggerEl.getAttribute("data-tooltip-target");
      var $tooltipEl = document.getElementById(tooltipId);
      if ($tooltipEl) {
        var triggerType = $triggerEl.getAttribute("data-tooltip-trigger");
        var placement = $triggerEl.getAttribute("data-tooltip-placement");
        new Tooltip($tooltipEl, $triggerEl, {
          placement: placement ? placement : Default9.placement,
          triggerType: triggerType ? triggerType : Default9.triggerType
        });
      } else {
        console.error('The tooltip element with id "'.concat(tooltipId, '" does not exist. Please check the data-tooltip-target attribute.'));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/popover/index.js
  var __assign10 = function() {
    __assign10 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign10.apply(this, arguments);
  };
  var __spreadArray3 = function(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i3 = 0, l3 = from.length, ar; i3 < l3; i3++) {
        if (ar || !(i3 in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i3);
          ar[i3] = from[i3];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var Default10 = {
    placement: "top",
    offset: 10,
    triggerType: "hover",
    onShow: function() {
    },
    onHide: function() {
    },
    onToggle: function() {
    }
  };
  var Popover = function() {
    function Popover2(targetEl, triggerEl, options) {
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (triggerEl === void 0) {
        triggerEl = null;
      }
      if (options === void 0) {
        options = Default10;
      }
      this._targetEl = targetEl;
      this._triggerEl = triggerEl;
      this._options = __assign10(__assign10({}, Default10), options);
      this._popperInstance = this._createPopperInstance();
      this._visible = false;
      this._init();
    }
    Popover2.prototype._init = function() {
      if (this._triggerEl) {
        this._setupEventListeners();
      }
    };
    Popover2.prototype._setupEventListeners = function() {
      var _this = this;
      var triggerEvents = this._getTriggerEvents();
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, function() {
          _this.show();
        });
        _this._targetEl.addEventListener(ev, function() {
          _this.show();
        });
      });
      triggerEvents.hideEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, function() {
          setTimeout(function() {
            if (!_this._targetEl.matches(":hover")) {
              _this.hide();
            }
          }, 100);
        });
        _this._targetEl.addEventListener(ev, function() {
          setTimeout(function() {
            if (!_this._triggerEl.matches(":hover")) {
              _this.hide();
            }
          }, 100);
        });
      });
    };
    Popover2.prototype._createPopperInstance = function() {
      return createPopper(this._triggerEl, this._targetEl, {
        placement: this._options.placement,
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, this._options.offset]
            }
          }
        ]
      });
    };
    Popover2.prototype._getTriggerEvents = function() {
      switch (this._options.triggerType) {
        case "hover":
          return {
            showEvents: ["mouseenter", "focus"],
            hideEvents: ["mouseleave", "blur"]
          };
        case "click":
          return {
            showEvents: ["click", "focus"],
            hideEvents: ["focusout", "blur"]
          };
        case "none":
          return {
            showEvents: [],
            hideEvents: []
          };
        default:
          return {
            showEvents: ["mouseenter", "focus"],
            hideEvents: ["mouseleave", "blur"]
          };
      }
    };
    Popover2.prototype._setupClickOutsideListener = function() {
      var _this = this;
      this._clickOutsideEventListener = function(ev) {
        _this._handleClickOutside(ev, _this._targetEl);
      };
      document.body.addEventListener("click", this._clickOutsideEventListener, true);
    };
    Popover2.prototype._removeClickOutsideListener = function() {
      document.body.removeEventListener("click", this._clickOutsideEventListener, true);
    };
    Popover2.prototype._handleClickOutside = function(ev, targetEl) {
      var clickedEl = ev.target;
      if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
        this.hide();
      }
    };
    Popover2.prototype.isVisible = function() {
      return this._visible;
    };
    Popover2.prototype.toggle = function() {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
      this._options.onToggle(this);
    };
    Popover2.prototype.show = function() {
      this._targetEl.classList.remove("opacity-0", "invisible");
      this._targetEl.classList.add("opacity-100", "visible");
      this._popperInstance.setOptions(function(options) {
        return __assign10(__assign10({}, options), { modifiers: __spreadArray3(__spreadArray3([], options.modifiers, true), [
          { name: "eventListeners", enabled: true }
        ], false) });
      });
      this._setupClickOutsideListener();
      this._popperInstance.update();
      this._visible = true;
      this._options.onShow(this);
    };
    Popover2.prototype.hide = function() {
      this._targetEl.classList.remove("opacity-100", "visible");
      this._targetEl.classList.add("opacity-0", "invisible");
      this._popperInstance.setOptions(function(options) {
        return __assign10(__assign10({}, options), { modifiers: __spreadArray3(__spreadArray3([], options.modifiers, true), [
          { name: "eventListeners", enabled: false }
        ], false) });
      });
      this._removeClickOutsideListener();
      this._visible = false;
      this._options.onHide(this);
    };
    return Popover2;
  }();
  if (typeof window !== "undefined") {
    window.Popover = Popover;
  }
  function initPopovers() {
    document.querySelectorAll("[data-popover-target]").forEach(function($triggerEl) {
      var popoverID = $triggerEl.getAttribute("data-popover-target");
      var $popoverEl = document.getElementById(popoverID);
      if ($popoverEl) {
        var triggerType = $triggerEl.getAttribute("data-popover-trigger");
        var placement = $triggerEl.getAttribute("data-popover-placement");
        var offset2 = $triggerEl.getAttribute("data-popover-offset");
        new Popover($popoverEl, $triggerEl, {
          placement: placement ? placement : Default10.placement,
          offset: offset2 ? parseInt(offset2) : Default10.offset,
          triggerType: triggerType ? triggerType : Default10.triggerType
        });
      } else {
        console.error('The popover element with id "'.concat(popoverID, '" does not exist. Please check the data-popover-target attribute.'));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/components/dial/index.js
  var __assign11 = function() {
    __assign11 = Object.assign || function(t2) {
      for (var s3, i3 = 1, n3 = arguments.length; i3 < n3; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t2[p3] = s3[p3];
      }
      return t2;
    };
    return __assign11.apply(this, arguments);
  };
  var Default11 = {
    triggerType: "hover",
    onShow: function() {
    },
    onHide: function() {
    },
    onToggle: function() {
    }
  };
  var Dial = function() {
    function Dial2(parentEl, triggerEl, targetEl, options) {
      if (parentEl === void 0) {
        parentEl = null;
      }
      if (triggerEl === void 0) {
        triggerEl = null;
      }
      if (targetEl === void 0) {
        targetEl = null;
      }
      if (options === void 0) {
        options = Default11;
      }
      this._parentEl = parentEl;
      this._triggerEl = triggerEl;
      this._targetEl = targetEl;
      this._options = __assign11(__assign11({}, Default11), options);
      this._visible = false;
      this._init();
    }
    Dial2.prototype._init = function() {
      var _this = this;
      if (this._triggerEl) {
        var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
        triggerEventTypes.showEvents.forEach(function(ev) {
          _this._triggerEl.addEventListener(ev, function() {
            _this.show();
          });
          _this._targetEl.addEventListener(ev, function() {
            _this.show();
          });
        });
        triggerEventTypes.hideEvents.forEach(function(ev) {
          _this._parentEl.addEventListener(ev, function() {
            if (!_this._parentEl.matches(":hover")) {
              _this.hide();
            }
          });
        });
      }
    };
    Dial2.prototype.hide = function() {
      this._targetEl.classList.add("hidden");
      if (this._triggerEl) {
        this._triggerEl.setAttribute("aria-expanded", "false");
      }
      this._visible = false;
      this._options.onHide(this);
    };
    Dial2.prototype.show = function() {
      this._targetEl.classList.remove("hidden");
      if (this._triggerEl) {
        this._triggerEl.setAttribute("aria-expanded", "true");
      }
      this._visible = true;
      this._options.onShow(this);
    };
    Dial2.prototype.toggle = function() {
      if (this._visible) {
        this.hide();
      } else {
        this.show();
      }
    };
    Dial2.prototype.isHidden = function() {
      return !this._visible;
    };
    Dial2.prototype.isVisible = function() {
      return this._visible;
    };
    Dial2.prototype._getTriggerEventTypes = function(triggerType) {
      switch (triggerType) {
        case "hover":
          return {
            showEvents: ["mouseenter", "focus"],
            hideEvents: ["mouseleave", "blur"]
          };
        case "click":
          return {
            showEvents: ["click", "focus"],
            hideEvents: ["focusout", "blur"]
          };
        case "none":
          return {
            showEvents: [],
            hideEvents: []
          };
        default:
          return {
            showEvents: ["mouseenter", "focus"],
            hideEvents: ["mouseleave", "blur"]
          };
      }
    };
    return Dial2;
  }();
  if (typeof window !== "undefined") {
    window.Dial = Dial;
  }
  function initDials() {
    document.querySelectorAll("[data-dial-init]").forEach(function($parentEl) {
      var $triggerEl = $parentEl.querySelector("[data-dial-toggle]");
      if ($triggerEl) {
        var dialId = $triggerEl.getAttribute("data-dial-toggle");
        var $dialEl = document.getElementById(dialId);
        if ($dialEl) {
          var triggerType = $triggerEl.getAttribute("data-dial-trigger");
          new Dial($parentEl, $triggerEl, $dialEl, {
            triggerType: triggerType ? triggerType : Default11.triggerType
          });
        } else {
          console.error("Dial with id ".concat(dialId, " does not exist. Are you sure that the data-dial-toggle attribute points to the correct modal id?"));
        }
      } else {
        console.error("Dial with id ".concat($parentEl.id, " does not have a trigger element. Are you sure that the data-dial-toggle attribute exists?"));
      }
    });
  }

  // ../../node_modules/flowbite/lib/esm/index.js
  var events = new events_default("load", [
    initAccordions,
    initCollapses,
    initCarousels,
    initDismisses,
    initDropdowns,
    initModals,
    initDrawers,
    initTabs,
    initTooltips,
    initPopovers,
    initDials
  ]);
  events.init();

  // ../../node_modules/flowbite-datepicker/js/lib/utils.js
  function createTagRepeat(tagName, repeat, attributes = {}, index = 0, html = "") {
    const openTagSrc = Object.keys(attributes).reduce((src, attr) => {
      let val = attributes[attr];
      if (typeof val === "function") {
        val = val(index);
      }
      return `${src} ${attr}="${val}"`;
    }, tagName);
    html += `<${openTagSrc}></${tagName}>`;
    const next = index + 1;
    return next < repeat ? createTagRepeat(tagName, repeat, attributes, next, html) : html;
  }
  function optimizeTemplateHTML(html) {
    return html.replace(/>\s+/g, ">").replace(/\s+</, "<");
  }

  // ../../node_modules/flowbite-datepicker/js/lib/event.js
  var { addEventListener: addEventListener2, removeEventListener: removeEventListener2 } = EventTarget.prototype;
  if (!Event.prototype.composedPath) {
    const getComposedPath = (node, path = []) => {
      path.push(node);
      let parent;
      if (node.parentNode) {
        parent = node.parentNode;
      } else if (node.host) {
        parent = node.host;
      } else if (node.defaultView) {
        parent = node.defaultView;
      }
      return parent ? getComposedPath(parent, path) : path;
    };
    Event.prototype.composedPath = function() {
      return getComposedPath(this.target);
    };
  }

  // ../../node_modules/flowbite-datepicker/js/options/defaultOptions.js
  var defaultOptions = {
    autohide: false,
    beforeShowDay: null,
    beforeShowDecade: null,
    beforeShowMonth: null,
    beforeShowYear: null,
    calendarWeeks: false,
    clearBtn: false,
    dateDelimiter: ",",
    datesDisabled: [],
    daysOfWeekDisabled: [],
    daysOfWeekHighlighted: [],
    defaultViewDate: void 0,
    // placeholder, defaults to today() by the program
    disableTouchKeyboard: false,
    format: "mm/dd/yyyy",
    language: "en",
    maxDate: null,
    maxNumberOfDates: 1,
    maxView: 3,
    minDate: null,
    nextArrow: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>',
    orientation: "auto",
    pickLevel: 0,
    prevArrow: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>',
    showDaysOfWeek: true,
    showOnClick: true,
    showOnFocus: true,
    startView: 0,
    title: "",
    todayBtn: false,
    todayBtnMode: 0,
    todayHighlight: false,
    updateOnBlur: true,
    weekStart: 0
  };
  var defaultOptions_default = defaultOptions;

  // ../../node_modules/flowbite-datepicker/js/lib/dom.js
  var range3 = document.createRange();

  // ../../node_modules/flowbite-datepicker/js/options/processOptions.js
  var {
    language: defaultLang,
    format: defaultFormat,
    weekStart: defaultWeekStart
  } = defaultOptions_default;

  // ../../node_modules/flowbite-datepicker/js/picker/templates/pickerTemplate.js
  var pickerTemplate = optimizeTemplateHTML(`<div class="datepicker hidden">
  <div class="datepicker-picker inline-block rounded-lg bg-white dark:bg-gray-700 shadow-lg p-4">
    <div class="datepicker-header">
      <div class="datepicker-title bg-white dark:bg-gray-700 dark:text-white px-2 py-3 text-center font-semibold"></div>
      <div class="datepicker-controls flex justify-between mb-2">
        <button type="button" class="bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 prev-btn"></button>
        <button type="button" class="text-sm rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 font-semibold py-2.5 px-5 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 view-switch"></button>
        <button type="button" class="bg-white dark:bg-gray-700 rounded-lg text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 next-btn"></button>
      </div>
    </div>
    <div class="datepicker-main p-1"></div>
    <div class="datepicker-footer">
      <div class="datepicker-controls flex space-x-2 mt-2">
        <button type="button" class="%buttonClass% today-btn text-white bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center w-1/2"></button>
        <button type="button" class="%buttonClass% clear-btn text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center w-1/2"></button>
      </div>
    </div>
  </div>
</div>`);

  // ../../node_modules/flowbite-datepicker/js/picker/templates/daysTemplate.js
  var daysTemplate = optimizeTemplateHTML(`<div class="days">
  <div class="days-of-week grid grid-cols-7 mb-1">${createTagRepeat("span", 7, { class: "dow block flex-1 leading-9 border-0 rounded-lg cursor-default text-center text-gray-900 font-semibold text-sm" })}</div>
  <div class="datepicker-grid w-64 grid grid-cols-7">${createTagRepeat("span", 42, { class: "block flex-1 leading-9 border-0 rounded-lg cursor-default text-center text-gray-900 font-semibold text-sm h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400" })}</div>
</div>`);

  // ../../node_modules/flowbite-datepicker/js/picker/templates/calendarWeeksTemplate.js
  var calendarWeeksTemplate = optimizeTemplateHTML(`<div class="calendar-weeks">
  <div class="days-of-week flex"><span class="dow h-6 leading-6 text-sm font-medium text-gray-500 dark:text-gray-400"></span></div>
  <div class="weeks">${createTagRepeat("span", 6, { class: "week block flex-1 leading-9 border-0 rounded-lg cursor-default text-center text-gray-900 font-semibold text-sm" })}</div>
</div>`);
})();
/*! Bundled license information:

stimulus-use/dist/index.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)

radiolabel/dist/index.m.js:
  (*!
   * GSAP 3.8.0
   * https://greensock.com
   *
   * @license Copyright 2008-2021, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  *)
  (*!
   * CSSPlugin 3.8.0
   * https://greensock.com
   *
   * Copyright 2008-2021, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  *)
*/
//# sourceMappingURL=application.js.map
