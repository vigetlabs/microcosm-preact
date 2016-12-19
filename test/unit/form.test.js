import {h, render, Component} from 'preact'
import Form from '../../src/form'
import Presenter from '../../src/presenter'
import {Action} from 'microcosm'

test('executes onDone when that action completes', function () {
  let onDone = jest.fn()
  let test = n => true

  let form = render(<Presenter><Form intent={test} onDone={onDone} /></Presenter>)

  form.dispatchEvent(new Event('submit'))

  expect(onDone).toHaveBeenCalledWith(true)
})

test('executes onError when that action completes', function () {
  let onError = jest.fn()
  let test = n => action => action.reject('bad')

  let form = render(<Presenter><Form intent={test} onError={onError} /></Presenter>)

  form.dispatchEvent(new Event('submit'))

  expect(onError).toHaveBeenCalledWith('bad')
})

test('executes onUpdate when that action sends an update', function (done) {
  let onUpdate = jest.fn()
  let test = () => action => setTimeout(() => action.send('loading'), 0)

  let form = render(<Presenter><Form intent={test} onUpdate={onUpdate} /></Presenter>)

  form.dispatchEvent(new Event('submit'))

  setTimeout(function() {
    expect(onUpdate).toHaveBeenCalledWith('loading')
    done()
  }, 0)
})

test('does not execute onDone if not given an action', function () {
  let onDone = jest.fn()

  let form = render(<Form intent="test" onDone={onDone} send={n => n} />)

  form.dispatchEvent(new Event('submit'))

  expect(onDone).not.toHaveBeenCalled()
})

describe('prepare', function() {

  test('can prepare serialized data', function () {
    let send = jest.fn()

    let prepare = function (params) {
      params.name = "BILLY"
      return params
    }

    let form = render((
      <Form intent="test" prepare={prepare} send={send}>
        <input name="name" defaultValue="Billy"/>
      </Form>
    ))

    form.dispatchEvent(new Event('submit'))

    expect(send).toHaveBeenCalledWith("test", { name: "BILLY" })
  })

})
