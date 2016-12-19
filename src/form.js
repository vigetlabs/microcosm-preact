import { h, Component } from 'preact'
import { Action, merge, inherit } from 'microcosm'
import serialize from 'form-serialize'

export default function Form () {
  Component.apply(this, arguments)
}

Form.contextTypes = {
  send : true
}

Form.defaultProps = {
  intent     : null,
  serializer : form => serialize(form, { hash: true, empty: true }),
  prepare  : n => n,
  onSubmit   : () => {}
}

inherit(Form, Component, {
  render() {
    let props = merge(this.props, { ref: 'form', onSubmit: this.onSubmit.bind(this) })

    delete props.intent
    delete props.prepare
    delete props.serializer
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError

    return h('form', props)
  },

  onSubmit(event) {
    event.preventDefault()
    this.submit(event)
  },

  submit(event) {
    let send = this.props.send || this.context.send

    const form   = event.target
    const params = this.props.prepare(this.props.serializer(form))
    const action = send(this.props.intent, params)

    if (action && action instanceof Action) {
      action.onDone(this.props.onDone)
            .onUpdate(this.props.onUpdate)
            .onCancel(this.props.onCancel)
            .onError(this.props.onError)
    }

    this.props.onSubmit(event, action)
  }

})
