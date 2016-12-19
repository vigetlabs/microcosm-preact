import {h, render} from 'preact'
import withIntent from '../../src/with-intent'
import Presenter from '../../src/presenter'

test('allows send to be overridden by a prop', function () {
  const send = jest.fn()

  const Button = withIntent(function ({ send }) {
    return (
      <button onClick={() => send('intent')}>
        Click me
      </button>
    )
  })

  render(<Button send={send}/>).click()

  expect(send).toHaveBeenCalledWith('intent')
})
