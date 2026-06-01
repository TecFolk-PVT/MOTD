/**
 * Inline script for root layout <head>. Must run before extensions mutate the DOM.
 * Blocks known extension attrs (e.g. fdprocessedid) and strips any that slip through.
 */
export const EXTENSION_HYDRATION_GUARD_SCRIPT = `
(function () {
  var BLOCKED = ["fdprocessedid"];

  function isBlocked(name) {
    return name && BLOCKED.indexOf(String(name).toLowerCase()) !== -1;
  }

  function stripAll() {
    BLOCKED.forEach(function (name) {
      try {
        document.querySelectorAll("[" + name + "]").forEach(function (el) {
          el.removeAttribute(name);
        });
      } catch (e) {}
    });
  }

  var setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (isBlocked(name)) return;
    return setAttribute.call(this, name, value);
  };

  if (Element.prototype.setAttributeNS) {
    var setAttributeNS = Element.prototype.setAttributeNS;
    Element.prototype.setAttributeNS = function (ns, name, value) {
      if (isBlocked(name)) return;
      return setAttributeNS.call(this, ns, name, value);
    };
  }

  if (Element.prototype.setAttributeNode) {
    var setAttributeNode = Element.prototype.setAttributeNode;
    Element.prototype.setAttributeNode = function (attr) {
      if (attr && isBlocked(attr.name)) return attr;
      return setAttributeNode.call(this, attr);
    };
  }

  if (Element.prototype.setAttributeNodeNS) {
    var setAttributeNodeNS = Element.prototype.setAttributeNodeNS;
    Element.prototype.setAttributeNodeNS = function (attr) {
      if (attr && isBlocked(attr.name)) return attr;
      return setAttributeNodeNS.call(this, attr);
    };
  }

  if (typeof NamedNodeMap !== "undefined" && NamedNodeMap.prototype.setNamedItem) {
    var setNamedItem = NamedNodeMap.prototype.setNamedItem;
    NamedNodeMap.prototype.setNamedItem = function (attr) {
      if (attr && isBlocked(attr.name)) return attr;
      return setNamedItem.call(this, attr);
    };
  }

  stripAll();

  if (typeof MutationObserver !== "undefined") {
    var observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (
          records[i].type === "attributes" &&
          isBlocked(records[i].attributeName)
        ) {
          stripAll();
          return;
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: BLOCKED,
    });
    setTimeout(function () {
      observer.disconnect();
      stripAll();
    }, 8000);
  }

  var interval = setInterval(stripAll, 16);
  setTimeout(function () {
    clearInterval(interval);
    stripAll();
  }, 8000);

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      stripAll();
    },
    { once: true }
  );
})();
`;
