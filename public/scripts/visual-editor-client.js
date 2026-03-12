;(function () {
  let isEditMode = false
  let hoveredElement = null
  let selectedElement = null

  function getSelector(el) {
    if (el.id) return '#' + el.id
    let path = []
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase()
      if (el.className) {
        selector += '.' + el.className.trim().split(/\s+/).join('.')
      }
      path.unshift(selector)
      el = el.parentNode
    }
    return path.join(' > ')
  }

  function onMouseOver(e) {
    if (!isEditMode) return
    e.stopPropagation()
    if (hoveredElement) hoveredElement.classList.remove('no-code-hover')
    hoveredElement = e.target
    hoveredElement.classList.add('no-code-hover')
  }

  function onClick(e) {
    if (!isEditMode) return
    e.preventDefault()
    e.stopPropagation()

    if (selectedElement) selectedElement.classList.remove('no-code-selected')
    selectedElement = e.target
    selectedElement.classList.add('no-code-selected')

    window.parent.postMessage(
      {
        type: 'ELEMENT_SELECTED',
        data: {
          tagName: selectedElement.tagName,
          id: selectedElement.id,
          className: selectedElement.className,
          innerText: selectedElement.innerText,
          selector: getSelector(selectedElement),
        },
      },
      '*',
    )
  }

  window.addEventListener('message', function (event) {
    const { type, styles } = event.data
    if (type === 'START_EDIT') {
      isEditMode = true
      let styleEl = document.getElementById('no-code-styles')
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'no-code-styles'
        styleEl.innerHTML = styles
        document.head.appendChild(styleEl)
      }
      document.body.addEventListener('mouseover', onMouseOver)
      document.body.addEventListener('click', onClick, true)
    } else if (type === 'STOP_EDIT' || type === 'CLEAR_SELECTION') {
      if (type === 'STOP_EDIT') isEditMode = false
      if (hoveredElement) hoveredElement.classList.remove('no-code-hover')
      if (selectedElement) selectedElement.classList.remove('no-code-selected')
      if (type === 'STOP_EDIT') {
        document.body.removeEventListener('mouseover', onMouseOver)
        document.body.removeEventListener('click', onClick, true)
      }
    }
  })
})()
