import { Component, h } from 'preact'
import Microcosm, { merge, tag, inherit } from 'microcosm'

const EMPTY = {}

function Presenter () {
  Component.call(this, arguments)
}

inherit(Presenter, Component, {
  constructor: Presenter,

  _setRepo (repo) {
    this.repo = repo

    this.setup(repo, this.props, this.props.state)

    this.repo.on('teardown', () => this.teardown(repo, this.props, this.state))
  },

  _connectSend (send) {
    this.send = send
  },

  setup (repo, props, state) {
    // NOOP
  },

  update (repo, props, state) {
    // NOOP
  },

  componentWillUpdate (next, state) {
    this.update(this.repo, next, state)
  },

  teardown (repo, props, state) {
    // NOOP
  },

  register () {
    // NOOP
  },

  model (props, state) {
    return EMPTY
  },

  view ({ children }) {
    return children.length ? children[0] : null
  },

  render () {
    // If the view is null, then it is probably incorrectly referenced
    console.assert(this.view != null,
                   `${this.constructor.name}::view() is`,
                   `${typeof this.view}. Is it referenced correctly?`)

    return (
      h(PresenterContext, {
        parentProps : this.props,
        parentState : this.state,
        presenter   : this,
        view        : this.view,
        repo        : this.props.repo
      })
    )
  }
})

function PresenterContext (props, context) {
  Component.call(this, props, context)

  this.repo = this.getRepo()

  props.presenter._connectSend(this.send.bind(this))
}

inherit(PresenterContext, Component, {

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  },

  componentWillMount () {
    this.props.presenter._setRepo(this.repo)
    this.recalculate(this.props)
  },

  componentDidMount () {
    this.repo.on('change', this.updateState, this)
  },

  componentWillUnmount () {
    this.repo.teardown()
  },

  componentWillReceiveProps (next) {
    this.recalculate(next)
  },

  render () {
    const { presenter, parentProps } = this.props

    const model = merge(parentProps, this.state)

    if (presenter.hasOwnProperty('view') || presenter.view.prototype.setState) {
      return h(presenter.view, model)
    }

    return presenter.view(model)
  },

  getRepo () {
    const repo = this.props.repo || this.context.repo

    return repo ? repo.fork() : new Microcosm()
  },

  updatePropMap ({ presenter, parentProps, parentState }) {
    this.propMap = presenter.model(parentProps, parentState)
    this.propMapKeys = Object.keys(this.propMap || EMPTY)
  },

  recalculate (props) {
    this.updatePropMap(props)
    this.updateState()
  },

  updateState () {
    let next = this.getState()

    if (next) {
      this.setState(next)
    }
  },

  getState () {
    let repoState = this.repo.state

    if (typeof this.propMap === 'function') {
      return this.propMap(repoState)
    }

    let next = null

    for (var i = this.propMapKeys.length - 1; i >= 0; --i) {
      var key = this.propMapKeys[i]
      var entry = this.propMap[key]
      var value = typeof entry === 'function' ? entry(repoState) : entry

      if (this.state[key] !== value) {
        next = next || {}
        next[key] = value
      }
    }

    return next
  },

  send (intent, ...params) {
    const { presenter } = this.props

    const registry = presenter.register()

    // Tag intents so that they register the same way in the Presenter
    // and Microcosm instance
    intent = tag(intent)

    // Does the presenter register to this intent?
    if (registry && registry.hasOwnProperty(intent)) {
      return registry[intent].call(presenter, this.repo, ...params)
    }

    // No: try the parent presenter
    if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    // If we hit the top, push the intent into the Microcosm instance
    return this.repo.push(intent, ...params)
  }
})

export default Presenter
