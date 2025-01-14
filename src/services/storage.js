const isStorageAvailable = (type) => {
  try {
    const storage = window[type]
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return false
  }
}

const getStorage = () => {
  if (isStorageAvailable('sessionStorage')) {
    return window.sessionStorage
  }
  // 如果 sessionStorage 不可用，使用內存存儲
  return new Map()
}

const memoryStorage = new Map()

const storage = {
  get(key) {
    try {
      const store = getStorage()
      if (store instanceof Map) {
        const value = store.get(key)
        return value ? JSON.parse(value) : null
      }
      const value = store.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Error getting data from storage:', error)
      return null
    }
  },

  set(key, value) {
    try {
      const store = getStorage()
      const stringValue = JSON.stringify(value)
      if (store instanceof Map) {
        store.set(key, stringValue)
      } else {
        store.setItem(key, stringValue)
      }
    } catch (error) {
      console.error('Error setting data to storage:', error)
    }
  },

  remove(key) {
    try {
      const store = getStorage()
      if (store instanceof Map) {
        store.delete(key)
      } else {
        store.removeItem(key)
      }
    } catch (error) {
      console.error('Error removing data from storage:', error)
    }
  },

  clear() {
    try {
      const store = getStorage()
      if (store instanceof Map) {
        store.clear()
      } else {
        store.clear()
      }
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }
}

export default storage 