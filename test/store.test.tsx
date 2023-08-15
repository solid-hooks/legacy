import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'
import { $state, normalizePersistOption } from '../src/store'

describe('test normalizePersistOption()', () => {
  test('returns undefined with undefined option', () => {
    expect(normalizePersistOption('testUndefined', undefined)).toBeUndefined()
  })
  test('returns normalized options with enable option set to true', () => {
    expect(normalizePersistOption('testEnable', { enable: true })).toEqual({
      debug: false,
      key: 'testEnable',
      serializer: {
        serialize: expect.any(Function),
        deserialize: expect.any(Function),
      },
      storage: localStorage,
    })
  })
  test('returns undefined with enable option set to false', () => {
    expect(normalizePersistOption('testDisable', { enable: false })).toBeUndefined()
  })
  test('returns normalized options with custom options', () => {
    const kv = new Map()
    const testObj = normalizePersistOption<{ test: string }, []>('testObj', {
      enable: true,
      debug: true,
      key: 'test',
      serializer: {
        deserialize(v) {
          return { test: v.substring(1, v.length - 2) }
        },
        serialize(v) {
          return `'${v}'`
        },
      },
      storage: {
        getItem(key) {
          return kv.get(key)
        },
        setItem(key, value) {
          kv.set(key, value)
        },
      },
    })
    expect(testObj).toEqual({
      debug: true,
      key: 'test',
      serializer: {
        serialize: expect.any(Function),
        deserialize: expect.any(Function),
      },
      storage: {
        getItem: expect.any(Function),
        setItem: expect.any(Function),
      },
    })
  })
  test('returns normalized options with custom options', () => {
    const testObj = normalizePersistOption('test', {
      enable: true,
      key: 'testObjMissing',
    })
    expect(testObj).toEqual({
      debug: false,
      key: 'testObjMissing',
      serializer: {
        serialize: expect.any(Function),
        deserialize: expect.any(Function),
      },
      storage: localStorage,
    })
  })
})
describe('test state', () => {
  test('$state()', () => {
    const useTestStore = $state('test', {
      state: { test: 1, foo: 'bar' },
      getter: state => ({
        doubleValue() {
          return state.test * 2
        },
        getByValue(num: number) {
          return state.test + num * num
        },
      }),
      action: set => ({
        double() {
          set('test', test => test * 2)
        },
        plus(num: number) {
          set('test', test => test + num)
        },
      }),
    })

    const callback = vi.fn()
    const store = useTestStore()

    store.$subscribe(callback)
    expect(store().test).toBe(1)
    expect(store.doubleValue()).toBe(2)
    expect(store.getByValue(3)).toBe(10)

    store.double()
    expect(store().test).toBe(2)
    expect(store.doubleValue()).toBe(4)

    store.plus(200)
    expect(store().test).toBe(202)
    expect(store.doubleValue()).toBe(404)

    store.$patch({ foo: 'baz' })
    expect(store().foo).toBe('baz')

    store.$reset()
    expect(store().test).toBe(1)
    expect(store().foo).toBe('bar')
    expect(store.doubleValue()).toBe(2)

    expect(callback).toHaveBeenCalledTimes(4)
  })
  test('should successfully use nest $state()', () => {
    const initialState = { count: 0 }
    const useStore = $state('test', {
      state: initialState,
      getter: store => ({
        fresh: () => {
          return store.count * 2 + 20
        },
      }),
      action: set => ({
        increment: () => set('count', n => n + 1),
        decrement: () => set('count', n => n - 1),
      }),
    })
    const store = useStore()
    const useTempStore = $state('temp', {
      state: initialState,
      action: set => ({
        generate: () => {
          store.increment()
          set('count', store.fresh())
        },
      }),
    })
    const tempStore = useTempStore()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{store().count}</p>
        <button data-testid="increment" onClick={store.increment}>Increment</button>
        <button data-testid="decrement" onClick={store.decrement}>Decrement</button>
      </div>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')
    expect(p.innerHTML).toBe('0')
    fireEvent.click(incrementBtn)
    expect(p.innerHTML).toBe('1')
    fireEvent.click(decrementBtn)
    expect(p.innerHTML).toBe('0')
    tempStore.generate()
    expect(tempStore().count).toBe(22)
    unmount()
  })

  test('should persist state to storage', () => {
    const initialState = { count: 0 }
    const kv = new Map()
    const useState = $state('test', {
      state: initialState,
      action: set => ({
        increment: () => set('count', n => n + 1),
        decrement: () => set('count', n => n - 1),
      }),
      persist: {
        enable: true,
        storage: {
          getItem(key) {
            return kv.get(key)
          },
          setItem(key, value) {
            kv.set(key, value)
          },
        },
        debug: true,
      },
    })
    const store = useState()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{store().count}</p>
        <button data-testid="increment" onClick={store.increment}>Increment</button>
        <button data-testid="decrement" onClick={store.decrement}>Decrement</button>
      </div>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')
    expect(p.innerHTML).toBe('0')
    expect(kv.get('test')).toBe('{"count":0}')
    fireEvent.click(incrementBtn)
    expect(p.innerHTML).toBe('1')
    expect(kv.get('test')).toBe('{"count":1}')
    fireEvent.click(decrementBtn)
    expect(p.innerHTML).toBe('0')
    expect(kv.get('test')).toBe('{"count":0}')
    fireEvent.click(incrementBtn)
    fireEvent.click(incrementBtn)
    unmount()
    const { container: newContainer } = render(() => (
      <p>{useState()().count}</p>
    ))
    const newP = newContainer.querySelector('p')!
    expect(kv.get('test')).toBe('{"count":2}')
    expect(newP.innerHTML).toBe('2')
    cleanup()
  })
  test('should persist state to storage by paths', () => {
    const initialState = { persist: { count: 0 }, nonePersist: 'test' }
    const kv = new Map()
    const useStore = $state('test', {
      state: initialState,
      action: set => ({
        increment: () => {
          set('persist', 'count', n => n + 1)
          set('nonePersist', 'increment')
        },
        decrement: () => {
          set('persist', 'count', n => n - 1)
          set('nonePersist', 'decrement')
        },
      }),
      persist: {
        enable: true,
        storage: {
          getItem(key) {
            return kv.get(key)
          },
          setItem(key, value) {
            kv.set(key, value)
          },
        },
        debug: true,
        paths: ['persist.count'],
      },
    })
    const store = useStore()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{store().persist.count}</p>
        <button data-testid="increment" onClick={store.increment}>Increment</button>
        <button data-testid="decrement" onClick={store.decrement}>Decrement</button>
      </div>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')
    expect(p.innerHTML).toBe('0')
    expect(kv.get('test')).toBe('{"persist":{"count":0}}')
    fireEvent.click(incrementBtn)
    expect(p.innerHTML).toBe('1')
    expect(kv.get('test')).toBe('{"persist":{"count":1}}')
    fireEvent.click(decrementBtn)
    expect(p.innerHTML).toBe('0')
    expect(kv.get('test')).toBe('{"persist":{"count":0}}')
    fireEvent.click(incrementBtn)
    fireEvent.click(incrementBtn)
    unmount()
    cleanup()
  })
})
