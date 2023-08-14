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
    const { state: store, double, plus, doubleValue, $patch, $reset, $subscribe } = useTestStore()
    $subscribe(callback)
    expect(store().test).toBe(1)
    expect(doubleValue()).toBe(2)
    double()
    expect(store().test).toBe(2)
    expect(doubleValue()).toBe(4)
    plus(200)
    expect(store().test).toBe(202)
    expect(doubleValue()).toBe(404)
    $patch({ foo: 'baz' })
    expect(store().foo).toBe('baz')
    $reset()
    expect(store().test).toBe(1)
    expect(store().foo).toBe('bar')
    expect(doubleValue()).toBe(2)
    expect(callback).toHaveBeenCalledTimes(4)
  })
  test('states outside provider should be undefined', () => {
    const initialState = { count: 0 }
    const [Provider, useStore] = $state('test', {
      state: initialState,
      action: set => ({
        increment: () => set('count', n => n + 1),
        decrement: () => set('count', n => n - 1),
      }),
    }, true)
    const storeObject = useStore()
    expect(storeObject).toBeUndefined()
    const Inner = () => {
      const { state: store, decrement, increment } = useStore()!
      return (
        <div>
          <p data-testid="value">{store().count}</p>
          <button data-testid="increment" onClick={increment}>Increment</button>
          <button data-testid="decrement" onClick={decrement}>Decrement</button>
        </div>
      )
    }
    const { unmount, getByTestId } = render(() => (
      <Provider>
        <Inner />
      </Provider>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')
    expect(p.innerHTML).toBe('0')
    fireEvent.click(incrementBtn)
    expect(p.innerHTML).toBe('1')
    fireEvent.click(decrementBtn)
    expect(p.innerHTML).toBe('0')
    unmount()
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
    const { state: store, fresh, decrement, increment } = useStore()
    const useTempStore = $state('temp', {
      state: initialState,
      action: set => ({
        generate: () => {
          increment()
          set('count', fresh())
        },
      }),
    })
    const { state: tempStore, generate } = useTempStore()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{store().count}</p>
        <button data-testid="increment" onClick={increment}>Increment</button>
        <button data-testid="decrement" onClick={decrement}>Decrement</button>
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
    generate()
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
    const { state, decrement, increment } = useState()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{state().count}</p>
        <button data-testid="increment" onClick={increment}>Increment</button>
        <button data-testid="decrement" onClick={decrement}>Decrement</button>
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
      <p>{useState().state().count}</p>
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
    const { state: store, decrement, increment } = useStore()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{store().persist.count}</p>
        <button data-testid="increment" onClick={increment}>Increment</button>
        <button data-testid="decrement" onClick={decrement}>Decrement</button>
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
