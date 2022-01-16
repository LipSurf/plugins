export function setStyles(stylesObject, el) {
  Object.keys(stylesObject).forEach(key => {
    el.style[key] = stylesObject[key]
  })
}
