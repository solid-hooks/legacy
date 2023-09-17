import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { $memo } from '../src'
import { $state } from '../src/state'
import { $tick } from '../src/utils'

describe('test state', () => {
  test('$state()', async () => {
    const callback = vi.fn()
    const cacheCount = vi.fn()
    const useState = $state('test', {
      $init: { test: 1, foo: 'bar' },
      $action: (state, setState) => ({
        doubleValue() {
          return state.test * 2
        },
        getLarger(num: number) {
          cacheCount()

          let value = 1
          for (let i = 2; i <= num; i++) {
            value = i
          }
          return state.test + value
        },
        double() {
          setState('test', test => test * 2)
        },
        plus(num: number) {
          setState('test', test => test + num)
        },
      }),
    })

    const state = useState()

    await $tick()
    state.$subscribe(callback)
    expect(state().test).toBe(1)
    expect(state.doubleValue()).toBe(2)

    const value = createRoot(() => $memo(state.getLarger(1e8)))

    for (let i = 0; i < 10; i++) {
      console.time(`$memo-${i}`)
      console.log(value())
      console.timeEnd(`$memo-${i}`)
    }
    expect(cacheCount).toBeCalledTimes(1)
    expect(state.getLarger(4)).toBe(5)

    state.double()
    expect(state().test).toBe(2)
    expect(state.doubleValue()).toBe(4)

    state.plus(200)
    expect(state().test).toBe(202)
    expect(state.doubleValue()).toBe(404)

    state.$patch({ foo: 'baz' })
    expect(state().foo).toBe('baz')

    state.$reset()
    expect(state().test).toBe(1)
    expect(state().foo).toBe('bar')
    expect(state.doubleValue()).toBe(2)

    await $tick()
    expect(callback).toHaveBeenCalledTimes(4)
  })
  test('should successfully use nest $state()', async () => {
    const initialState = { count: 0 }
    const useState = $state('test', {
      $init: initialState,
      $action: (state, setState) => ({
        fresh: () => {
          return state.count * 2 + 20
        },
        increment: () => setState('count', n => n + 1),
        decrement: () => setState('count', n => n - 1),
      }),
    })
    const state = useState()
    const useTempState = $state('temp', {
      $init: initialState,
      $action: (_, set) => ({
        generate: () => {
          state.increment()
          set('count', state.fresh())
        },
      }),
    })
    const tempState = useTempState()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{state().count}</p>
        <button data-testid="increment" onClick={state.increment}>Increment</button>
        <button data-testid="decrement" onClick={state.decrement}>Decrement</button>
      </div>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')
    expect(p.innerHTML).toBe('0')

    fireEvent.click(incrementBtn)
    await $tick()
    expect(p.innerHTML).toBe('1')

    fireEvent.click(decrementBtn)
    await $tick()
    expect(p.innerHTML).toBe('0')

    tempState.generate()
    expect(tempState().count).toBe(22)
    unmount()
  })

  test('should persist state to storage', async () => {
    const initialState = { count: 0 }
    const kv = new Map()
    const useState = $state('test', {
      $init: initialState,
      $action: (_, set) => ({
        increment: () => set('count', n => n + 1),
        decrement: () => set('count', n => n - 1),
      }),
      $persist: {
        enable: true,
        storage: {
          getItem(key) {
            return kv.get(key)
          },
          setItem(key, value) {
            kv.set(key, value)
          },
          removeItem(key) {
            kv.delete(key)
          },
        },
      },
    })
    const test = useState()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{test().count}</p>
        <button data-testid="increment" onClick={test.increment}>Increment</button>
        <button data-testid="decrement" onClick={test.decrement}>Decrement</button>
      </div>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')

    await $tick()
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
      <p>{test().count}</p>
    ))
    const newP = newContainer.querySelector('p')!
    expect(kv.get('test')).toBe('{"count":2}')
    expect(newP.innerHTML).toBe('2')
  })
  test('should persist state to storage by paths', async () => {
    const initialState = { persist: { count: 0 }, nonePersist: ['test', 'test1'] }
    const kv = new Map()
    const useState = $state('test', {
      $init: initialState,
      $action: (s, set) => ({
        increment: () => {
          set('persist', 'count', n => n + 1)
          set('nonePersist', ['increment', `${s.persist.count}`])
        },
        decrement: () => {
          set('persist', 'count', n => n - 1)
          set('nonePersist', ['decrement', `${s.persist.count}`])
        },
      }),
      $persist: {
        enable: true,
        storage: {
          getItem(key) {
            return kv.get(key)
          },
          setItem(key, value) {
            kv.set(key, value)
          },
          removeItem(key) {
            kv.delete(key)
          },
        },
        paths: ['persist.count', 'nonePersist[0]'],
      },
    })
    const state = useState()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{state().persist.count}</p>
        <button data-testid="increment" onClick={state.increment}>Increment</button>
        <button data-testid="decrement" onClick={state.decrement}>Decrement</button>
      </div>
    ))

    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')

    await $tick()
    expect(p.innerHTML).toBe('0')
    expect(kv.get('test')).toBe('{"persist":{"count":0},"nonePersist":["test"]}')

    fireEvent.click(incrementBtn)
    await $tick()
    expect(p.innerHTML).toBe('1')
    expect(kv.get('test')).toBe('{"persist":{"count":1},"nonePersist":["increment"]}')

    fireEvent.click(decrementBtn)
    await $tick()
    expect(p.innerHTML).toBe('0')
    expect(kv.get('test')).toBe('{"persist":{"count":0},"nonePersist":["decrement"]}')

    unmount()
  })
})
