import { h } from 'preact'
import { mount } from '../helpers'
import ActionButton from '../../src/action-button'
import { Action } from 'microcosm'

describe('actions', function() {
  it('passes the value property as parameters into the action', function() {
    let send = jest.fn()

    let button = mount(<ActionButton action="test" value={true} send={send} />)

    button.click()

    expect(send).toHaveBeenCalledWith('test', true)
  })
})

describe('callbacks', function() {
  it('executes onOpen when that action completes', function() {
    let onOpen = jest.fn()
    let send = () => new Action(n => n).open(true)
    let button = mount(
      <ActionButton action="test" send={send} onOpen={onOpen} />
    )

    button.click()

    expect(onOpen).toHaveBeenCalledWith(true)
  })

  it('executes onDone when that action completes', function() {
    let onDone = jest.fn()
    let send = () => new Action(n => n).resolve(true)
    let button = mount(
      <ActionButton action="test" onDone={onDone} send={send} />
    )

    button.click()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('executes onError when that action completes', function() {
    let onError = jest.fn()
    let send = () => new Action(n => n).reject(true)
    let button = mount(
      <ActionButton action="test" onError={onError} send={send} />
    )

    button.click()

    expect(onError).toHaveBeenCalledWith(true)
  })

  it('executes onUpdate when that action sends an update', function() {
    let onUpdate = jest.fn()
    let action = new Action(n => n)
    let send = () => action
    let button = mount(
      <ActionButton action="test" onUpdate={onUpdate} send={send} />
    )

    button.click()

    action.update('loading')

    expect(onUpdate).toHaveBeenCalledWith('loading')
  })

  it('does not execute onDone if not given an action', function() {
    let onDone = jest.fn()
    let send = () => true
    let button = mount(
      <ActionButton action="test" onDone={onDone} send={true} />
    )

    button.click()

    expect(onDone).not.toHaveBeenCalled()
  })

  it('does not execute onError if not given an action', function() {
    let onError = jest.fn()
    let send = () => true
    let button = mount(<ActionButton action="test" onError={onError} />)

    button.click()

    expect(onError).not.toHaveBeenCalled()
  })

  it('does not execute onUpdate if not given an action', function() {
    let onUpdate = jest.fn()
    let send = () => true
    let button = mount(
      <ActionButton action="test" onUpdate={onUpdate} send={send} />
    )

    button.click()

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('passes along onClick', function() {
    let handler = jest.fn()
    let send = () => {}
    let button = mount(<ActionButton onClick={handler} send={send} />)

    button.click()

    expect(handler).toHaveBeenCalled()
  })
})

describe('manual operation', function() {
  it('click can be called directly on the component instance', function() {
    let onDone = jest.fn()
    let send = () => new Action(n => n).resolve(true)

    let button = mount(
      <ActionButton action="test" onDone={onDone} send={send} />
    )

    button.click()

    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('can pass in send manually', function() {
    const send = jest.fn()
    const button = mount(<ActionButton send={send} />)

    button.click()

    expect(send).toHaveBeenCalled()
  })
})

describe('mounting', function() {
  it('can mount with another tag name', function() {
    let link = mount(<ActionButton tag="a" action="wut" />)

    expect(link.tagName).toBe('A')
  })

  it('uses the button type when set as a button', function() {
    let button = mount(<ActionButton action="wut" />)

    expect(button.type).toBe('button')
  })

  it('does not pass the type attribute for non-buttons', function() {
    let link = mount(<ActionButton tag="a" action="wut" />)

    expect(link.getAttribute('type')).toBe(null)
  })
})
