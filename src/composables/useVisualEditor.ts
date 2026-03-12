import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface SelectedElement {
  tagName: string
  id: string
  className: string
  innerText: string
  outerHTML: string
  selector: string
}

// 在 iframe 中注入的高亮 CSS
const HIGHLIGHT_STYLE_ID = '__no_code_highlight__'
const HIGHLIGHT_CSS = `
  .__nc_hover__ {
    outline: 2px dashed #1890ff !important;
    outline-offset: 1px !important;
    cursor: crosshair !important;
    transition: outline 0.15s ease;
  }
  .__nc_selected__ {
    outline: 2px solid #52c41a !important;
    outline-offset: 1px !important;
    background: rgba(82, 196, 26, 0.08) !important;
    cursor: crosshair !important;
  }
`

// 在 iframe 中注入的事件脚本（序列化为字符串后运行）
function buildClientScript(): string {
  return `
(function() {
  if (window.__ncEditorActive) return;
  window.__ncEditorActive = true;

  var hovered = null;
  var selected = null;

  function getSelector(el) {
    if (!el || el === document.body) return 'body';
    if (el.id) return '#' + el.id;
    var parts = [];
    var current = el;
    while (current && current !== document.body && current.nodeType === 1) {
      var tag = current.tagName.toLowerCase();
      var cls = Array.from(current.classList)
        .filter(function(c) { return c !== '__nc_hover__' && c !== '__nc_selected__'; })
        .slice(0, 2)
        .join('.');
      parts.unshift(cls ? tag + '.' + cls : tag);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function onOver(e) {
    e.stopPropagation();
    if (hovered && hovered !== selected) hovered.classList.remove('__nc_hover__');
    hovered = e.target;
    if (hovered !== selected) hovered.classList.add('__nc_hover__');
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      selected.classList.remove('__nc_selected__');
      selected.classList.remove('__nc_hover__');
    }
    selected = e.target;
    selected.classList.add('__nc_selected__');
    if (hovered === selected) hovered = null;

    // 临时移除高亮 class，获取干净的 outerHTML，再还原
    selected.classList.remove('__nc_hover__');
    selected.classList.remove('__nc_selected__');
    var cleanOuterHTML = selected.outerHTML;
    selected.classList.add('__nc_selected__');

    window.parent.postMessage({
      __nc: true,
      type: 'ELEMENT_SELECTED',
      data: {
        tagName: selected.tagName,
        id: selected.id || '',
        className: Array.from(selected.classList)
          .filter(function(c) { return c !== '__nc_hover__' && c !== '__nc_selected__'; })
          .join(' '),
        innerText: (selected.innerText || '').trim().slice(0, 500),
        outerHTML: cleanOuterHTML.slice(0, 2000),
        selector: getSelector(selected)
      }
    }, '*');
  }

  function clear() {
    if (hovered) { hovered.classList.remove('__nc_hover__'); hovered = null; }
    if (selected) { selected.classList.remove('__nc_selected__'); selected = null; }
  }

  function stop() {
    clear();
    document.removeEventListener('mouseover', onOver, true);
    document.removeEventListener('click', onClick, true);
    window.__ncEditorActive = false;
  }

  document.addEventListener('mouseover', onOver, true);
  document.addEventListener('click', onClick, true);

  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.__nc) return;
    if (e.data.type === 'STOP_EDIT') stop();
    if (e.data.type === 'CLEAR_SELECTION') clear();
  });
})();
`
}

export function useVisualEditor(iframeRef: Ref<HTMLIFrameElement | null>) {
  const isEditMode = ref(false)
  const selectedElement = ref<SelectedElement | null>(null)

  const postToIframe = (data: Record<string, unknown>) => {
    const win = iframeRef.value?.contentWindow
    if (win) win.postMessage({ __nc: true, ...data }, '*')
  }

  const injectIntoIframe = () => {
    const iframeDoc = iframeRef.value?.contentDocument
    if (!iframeDoc) return

    // 注入样式
    if (!iframeDoc.getElementById(HIGHLIGHT_STYLE_ID)) {
      const style = iframeDoc.createElement('style')
      style.id = HIGHLIGHT_STYLE_ID
      style.textContent = HIGHLIGHT_CSS
      ;(iframeDoc.head || iframeDoc.documentElement).appendChild(style)
    }

    // 注入事件脚本
    const script = iframeDoc.createElement('script')
    script.textContent = buildClientScript()
    ;(iframeDoc.head || iframeDoc.documentElement).appendChild(script)
    script.remove() // 脚本执行后即可移除标签
  }

  const ejectFromIframe = () => {
    const iframeDoc = iframeRef.value?.contentDocument
    if (!iframeDoc) return
    const style = iframeDoc.getElementById(HIGHLIGHT_STYLE_ID)
    if (style) style.remove()
    // 发消息通知 iframe 内脚本清理
    postToIframe({ type: 'STOP_EDIT' })
  }

  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value
    if (isEditMode.value) {
      injectIntoIframe()
    } else {
      clearSelection()
      ejectFromIframe()
    }
  }

  const clearSelection = () => {
    selectedElement.value = null
    postToIframe({ type: 'CLEAR_SELECTION' })
  }

  // iframe 重新加载后重新注入
  const onIframeLoad = () => {
    if (isEditMode.value) {
      injectIntoIframe()
    }
  }

  const handleMessage = (event: MessageEvent) => {
    const payload = event.data
    if (!payload || !payload.__nc) return
    if (payload.type === 'ELEMENT_SELECTED') {
      selectedElement.value = payload.data as SelectedElement
    }
  }

  onMounted(() => {
    window.addEventListener('message', handleMessage)
  })

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
    if (isEditMode.value) ejectFromIframe()
  })

  return {
    isEditMode,
    selectedElement,
    toggleEditMode,
    clearSelection,
    onIframeLoad,
  }
}
