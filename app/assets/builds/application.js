 (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
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
    return Array.from({ length }, (_3, index) => [left[index], right[index]]);
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
    registerActionOption(name, filter) {
      this.actionDescriptorFilters[name] = filter;
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

  // stimulus_ns:/Users/xiaobo/Desktop/stimulus_reflex_todos/app/javascript/controllers/controllers
  var definitions = [];

  // controllers/application.js
  var application = Application.start();
  application.warnings = true;
  application.debug = false;
  window.Stimulus = application;
  application.load(definitions);

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
  function morphdomFactory(morphAttrs2) {
    return function morphdom2(fromNode, toNode, options) {
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
          morphAttrs2(fromEl, toEl);
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
    beforeReflex(element, reflex, noop2, reflexId) {
    }
    reflexSuccess(element, reflex, noop2, reflexId) {
    }
    reflexError(element, reflex, error2, reflexId) {
    }
    reflexHalted(element, reflex, error2, reflexId) {
    }
    afterReflex(element, reflex, noop2, reflexId) {
    }
    finalizeReflex(element, reflex, noop2, reflexId) {
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

  // rails:/Users/xiaobo/Desktop/stimulus_reflex_todos/app/javascript/controllers/**/*_controller.js
  var modules = [{ name: "application", module: application_controller_exports, filename: "./application_controller.js" }, { name: "create-todo", module: create_todo_controller_exports, filename: "./create_todo_controller.js" }];
  var controller_default = modules;

  // controllers/index.js
  controller_default.forEach((controller) => {
    application.register(controller.name, controller.module.default);
  });

  // channels/consumer.js
  var consumer_default = createConsumer();

  // config/setupStimulus.js
  application.consumer = consumer_default;
  B.initialize(application, { controller: application_controller_default, isolate: true });
})();
//# sourceMappingURL=application.js.map
