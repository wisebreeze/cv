const Cookie = {
  get(name) {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith(name + '=')) {
        return decodeURIComponent(cookie.substring(name.length + 1))
      }
    }
    return null
  },

  set(name, value, options = {}) {
    let cookie = `${name}=${encodeURIComponent(value)}`
    
    if (options.expires) {
      const date = new Date()
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000))
      cookie += `; expires=${date.toUTCString()}`
    }
    
    if (options.path) {
      cookie += `; path=${options.path}`
    } else {
      cookie += '; path=/'
    }
    
    if (options.domain) {
      cookie += `; domain=${options.domain}`
    }
    
    if (options.secure) {
      cookie += '; secure'
    }
    
    if (options.samesite) {
      cookie += `; samesite=${options.samesite}`
    }
    
    document.cookie = cookie
  },

  remove(name, options = {}) {
    this.set(name, '', {
      ...options,
      expires: -1
    })
  },

  removeAll() {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
      this.remove(name)
    }
  }
}

export default Cookie