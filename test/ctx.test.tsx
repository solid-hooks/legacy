import { describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'
import { useContextProvider } from '../src/hooks/context-provider'

const context = { message: 'Hello, Context!' }

describe('defineContext with props and fallback', () => {
  const fallback = { message: 'FALLBACK' }
  const { TestProvider, useTestContext } = useContextProvider(
    'test',
    (params: { text?: string }) => {
      return {
        message: params.text ?? context.message,
      }
    },
    fallback,
  )
  const TestChild = () => <div>{useTestContext().message}</div>
  it('renders the context message', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const unmount = render(
      () => (
        <TestProvider>
          <TestChild />
        </TestProvider>
      ),
      container,
    )

    expect(container.innerHTML, 'Not correctly rendered').toBe(`<div>${context.message}</div>`)

    unmount()
    document.body.removeChild(container)
  })

  it('returns fallback if context is not provided', () => {
    expect(useTestContext().message).toBe(fallback.message)
  })
})

describe('defineContext without props', () => {
  const { TestProvider, useTestContext } = useContextProvider(
    'test',
    () => {
      return {
        message: context.message,
      }
    },
  )
  it('throw error when call outside provider (DEV)', () => {
    expect(() => useTestContext().message).toThrowError()
  })
  const TestChild = () => <div>{useTestContext().message}</div>
  it('renders the context message', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const unmount = render(
      () => (
        <TestProvider>
          <TestChild />
        </TestProvider>
      ),
      container,
    )

    expect(container.innerHTML, 'Not correctly rendered').toBe(`<div>${context.message}</div>`)

    unmount()
    document.body.removeChild(container)
  })
})
