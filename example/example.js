/**
 * Taken from pixelpaint
 * https://github.com/dtinth/pixelpaint
 */
 
import { h, render } from 'preact'
import Microcosm from 'microcosm'
import Presenter from '../src/presenter'
import withIntent from '../src/with-intent'

const repo = new Microcosm()
const toggle = (a, j) => a + ',' + j

repo.addDomain('pixels', {
  getInitialState() {
    return {}
  },
  toggle (state, key) {
    return { ...state, [key]: !state[key] }
  },
  register() {
    return {
      [toggle]: this.toggle
    }
  }
})

const Pixel = withIntent(function Pixel ({ i, j, active, send }) {
  let style = { top: i * 3, left: j * 3 }
  let onToggle = () => send(toggle, i, j)

  return (
    <div className="pixel" style={style} onMouseOver={onToggle} data-active={active ? '1' : '0'} />
  )
})

let size = 128
function MicrocosmCanvas () {
  const items = []

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      items.push(<PixelContainer repo={repo} i={i} j={j} key={i + ',' + j} />)
    }
  }

  return <div>{items}</div>
}

class PixelContainer extends Presenter {
  view ({ i, j, active }) {
    return (<Pixel i={i} j={j} onToggle={this.toggle} active={active} />)
  }

  model ({ i, j }) {
    let key = i + ',' + j

    return {
      active : state => state.pixels[key]
    }
  }
}

render(<MicrocosmCanvas />, document.getElementById('app'))
