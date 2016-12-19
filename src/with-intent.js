/**
 * Connect a component to the presenter tree
 */

import { h } from 'preact'
import { merge } from 'microcosm'

export default function withIntentFactory (Component) {
  return function WithIntent (props, context) {
    let send = props.send || context.send

    return h(Component, merge({ send }, props))
  }
}
