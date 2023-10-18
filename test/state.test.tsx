import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { $memo } from '../src'
import { $state, useActions } from '../src/state'
import { $tick } from '../src/utils'

describe('test state', () => {
  it('$state()', async () => {
    const callback = vi.fn()
    const deepCallback = vi.fn()
    const cacheCount = vi.fn()
    const useState = createRoot(() => $state('test-utils', {
      $init: { deep: { test: 1 }, foo: 'bar' },
      $getters: state => ({
        doubleValue() {
          return state.deep.test * 2
        },
        getLarger(num: number) {
          cacheCount()

          let value = 1
          for (let i = 2; i <= num; i++) {
            value = i
          }
          return state.deep.test + value
        },
      }),
      $actions: state => ({
        double() {
          state.$set('deep', 'test', test => test * 2)
        },
        plus(num: number) {
          state.$set('deep', 'test', test => test + num)
        },
      }),
    }))

    const state = useState()
    const actions = useActions(state)

    await $tick()
    createRoot(() => state.$subscribe(callback, { defer: true }))
    createRoot(() => state.$subscribe(deepCallback, { path: 'deep.test' }))
    expect(state().deep.test).toBe(1)
    expect(state.doubleValue()).toBe(2)
    expect(deepCallback).toHaveBeenCalledWith(1)

    const value = createRoot(() => $memo(state.getLarger(1e8)))

    for (let i = 0; i < 10; i++) {
      console.time(`$memo-${i}`)
      value()
      console.timeEnd(`$memo-${i}`)
    }
    expect(cacheCount).toBeCalledTimes(1)
    expect(state.getLarger(4)).toBe(5)

    actions.double()
    expect(state().deep.test).toBe(2)
    expect(state.doubleValue()).toBe(4)
    expect(deepCallback).toHaveBeenCalledWith(2)

    actions.plus(200)
    expect(state().deep.test).toBe(202)
    expect(state.doubleValue()).toBe(404)
    expect(deepCallback).toHaveBeenCalledWith(202)

    state.$patch({ foo: 'baz' })
    expect(state().foo).toBe('baz')

    state.$reset()
    expect(state().deep.test).toBe(1)
    expect(state().foo).toBe('bar')
    expect(state.doubleValue()).toBe(2)

    await $tick()
    expect(callback).toHaveBeenCalledTimes(4)
  })
  it('should successfully use nest $state()', async () => {
    const initialState = { count: 0 }
    const useState = $state('test-nest', {
      $init: initialState,
      $getters: state => ({
        fresh: () => {
          return state.count * 2 + 20
        },
      }),
      $actions: state => ({
        increment: () => state.$set('count', n => n + 1),
        decrement: () => state.$set('count', n => n - 1),
      }),
    })
    const state = useState()
    const useTempState = $state('test-nest-temp', {
      $init: initialState,
      $actions: tmp => ({
        generate: () => {
          state.increment()
          tmp.$set('count', state.fresh())
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

  it('should persist state to storage', async () => {
    const initialState = { count: 0 }
    const kv = new Map()
    const useState = $state('test-persist', {
      $init: initialState,
      $actions: state => ({
        increment: () => state.$set('count', n => n + 1),
        decrement: () => state.$set('count', n => n - 1),
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
    }, true)
    const test = useState()
    const { unmount, getByTestId } = render(() => (
      <div>
        <p data-testid="value">{test().count}</p>
        <button data-testid="increment" onClick={test.increment}>Increment</button>
        <button data-testid="decrement" onClick={test.decrement}>Decrement</button>
      </div>
    ))

    const key = '$state-test-persist'
    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')

    await $tick()
    expect(p.innerHTML).toBe('0')
    expect(kv.get(key)).toBe('{"count":0}')

    fireEvent.click(incrementBtn)
    expect(p.innerHTML).toBe('1')
    expect(kv.get(key)).toBe('{"count":1}')

    fireEvent.click(decrementBtn)
    expect(p.innerHTML).toBe('0')
    expect(kv.get(key)).toBe('{"count":0}')

    fireEvent.click(incrementBtn)
    fireEvent.click(incrementBtn)
    unmount()
    const { container: newContainer } = render(() => (
      <p>{test().count}</p>
    ))
    const newP = newContainer.querySelector('p')!
    expect(kv.get(key)).toBe('{"count":2}')
    expect(newP.innerHTML).toBe('2')
  })
  it('should persist state to storage by paths', async () => {
    const initialState = {
      persist: { count: 0 },
      nonePersist: ['test', 'test1'],
    }
    const kv = new Map()
    const useState = $state('test-persist-optional', {
      $init: initialState,
      $actions: state => ({
        increment: () => {
          state.$set('persist', 'count', n => n + 1)
          state.$set('nonePersist', ['increment', `${state().persist.count}`])
        },
        decrement: () => {
          state.$set('persist', 'count', n => n - 1)
          state.$set('nonePersist', ['decrement', `${state().persist.count}`])
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
    console.log(state())
    const { getByTestId } = render(() => (
      <div>
        <p data-testid="value">{state().persist.count}</p>
        <button data-testid="increment" onClick={state.increment}>Increment</button>
        <button data-testid="decrement" onClick={state.decrement}>Decrement</button>
      </div>
    ))

    const key = '$state-test-persist-optional'
    const p = getByTestId('value')
    const incrementBtn = getByTestId('increment')
    const decrementBtn = getByTestId('decrement')

    await $tick()
    expect(p.innerHTML).toBe('0')
    expect(kv.get(key)).toBe('{"persist":{"count":0},"nonePersist":["test"]}')

    fireEvent.click(incrementBtn)
    await $tick()
    expect(p.innerHTML).toBe('1')
    expect(kv.get(key)).toBe('{"persist":{"count":1},"nonePersist":["increment"]}')

    fireEvent.click(decrementBtn)
    await $tick()
    expect(p.innerHTML).toBe('0')
    expect(kv.get(key)).toBe('{"persist":{"count":0},"nonePersist":["decrement"]}')
  })
})
