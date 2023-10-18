import { $ } from '../../src'
import { $draggable } from '../../src/utils'

export default function Drag() {
  const el = $<HTMLElement>()
  const handle = $<HTMLElement>()

  const {
    position,
    resetPosition,
    enable,
    disable,
    isDragging,
    isDraggable,
  } = $draggable(el, {
    initialPosition: { x: 200, y: 80 },
    addStyle: true,
    handleEl: handle,
  })

  return (
    <>
      <div>
        <p>Check the floating boxes</p>
        <button onClick={enable}>enable drag</button>
        <br />
        <button onClick={disable}>disable drag</button>
        <br />
        <button onClick={resetPosition}>reset position</button>
        <br />
        <div>{`is draggable: ${isDraggable()}`}</div>
        <div>{`is dragging: ${isDragging()}`}</div>
        <div
          ref={el.$}
          style={{
            'position': 'fixed',
            'width': '150px',
            'height': '40px',
            'padding': '20px',
            'box-shadow': '2px 2px 10px 2px #aaa',
            'background-color': '#ddd',
            'border-radius': '12px',
            'touch-action': 'none',
          }}
        >
          <div>
            Don't drag me!
            <div>
              I am at {Math.round(position().x)}, {Math.round(position().y)}
            </div>
          </div>
          <div
            ref={handle.$}
            style={{
              'padding': '10px',
              'background-color': '#666',
              'color': '#eee',
            }}
          >
            👋 Drag me!
          </div>
        </div>
      </div>
    </>
  )
}
