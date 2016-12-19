/**
 * Connect a component to the presenter tree
 */

import { h } from 'preact'
import { merge } from 'microcosm'

const TYPES = {
  send: true
}

export default function withIntent (Component, intent) {

  function WithIntent (props, context) {
    let send = props.send || context.send

    return h(Component, merge({ send }, props))
  }

  WithIntent.contextTypes = WithIntent.propTypes = TYPES

  return WithIntent
}
