

export const makeMigration = () => chrome.storage.local.get(d => {
  let keyValue = Object.entries(d)
  let distance = keyValue
    .map(([key, value]) => [parseInt(key), value])
    .filter(([key]) => Number.isInteger(key))
    .reduce((acc, [key, value]) => ({
      ...acc,
      distance: {
        ...acc['distance'],
        [key]: value
      }
    }), {})
  let keys = keyValue
    .map(([key]) => parseInt(key))
    .filter(k => Number.isInteger(k))
    .map(k => `${k}`)

  let other = keyValue
    .filter(([key]) => !parseInt(key))

  let g = other
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {})
  
  chrome.storage.local.remove(keys)
  chrome.storage.local.set({
    ...g,
    ...distance
  })
 })