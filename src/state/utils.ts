export function deepClone<T>(target: T): T {
  const newTarget = (Array.isArray(target) ? [] : {}) as T
  for (const key in target) {
    if (typeof target[key] === 'object' && target[key]) {
      newTarget[key] = deepClone(target[key])
    } else {
      newTarget[key] = target[key]
    }
  }
  return newTarget
}
