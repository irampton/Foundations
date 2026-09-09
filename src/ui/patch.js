// Reconcile trusted templates in place so economic ticks do not replace focused controls.
export function patchMarkup(container, markup) {
  const template = document.createElement('template');
  template.innerHTML = markup;
  syncChildren(container, template.content);
}

function syncChildren(current, next) {
  const incoming = Array.from(next.childNodes);
  incoming.forEach((node, index) => {
    const existing = current.childNodes[index];
    if (!existing) current.append(node.cloneNode(true));
    else if (existing.nodeType !== node.nodeType || existing.nodeName !== node.nodeName) {
      existing.replaceWith(node.cloneNode(true));
    } else if (node.nodeType === Node.TEXT_NODE) {
      if (existing.textContent !== node.textContent) existing.textContent = node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const attribute of Array.from(existing.attributes)) {
        if (!node.hasAttribute(attribute.name)) existing.removeAttribute(attribute.name);
      }
      for (const attribute of node.attributes) {
        if (existing.getAttribute(attribute.name) !== attribute.value) {
          existing.setAttribute(attribute.name, attribute.value);
        }
      }
      syncChildren(existing, node);
    }
  });
  while (current.childNodes.length > incoming.length) current.lastChild.remove();
}
