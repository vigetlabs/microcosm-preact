import preact, { h, Component, render, rerender } from 'preact'
import Microcosm from 'microcosm'
import Presenter from 'src/presenter'
import withIntent from 'src/with-intent'

const View = withIntent(function ({ send }) {
  let onClick = () => send('test', true)
  return <button id="button" onClick={onClick}>Click</button>
})

describe('::model', function() {

  test('model is an alias for model ', function () {
    class Hello extends Presenter {
      model ({ place }) {
        return {
          greeting: "Hello, " + place + "!"
        }
      }

      view ({ greeting }) {
        return <p>{ greeting }</p>
      }
    }

    let el = render(<Hello place="world" />)

    expect(el.textContent).toEqual('Hello, world!')
  })

  test('builds the view model into state', function () {
    class MyPresenter extends Presenter {
      model () {
        return {
          color: state => state.color
        }
      }
      view ({ color }) {
        return <div>{color}</div>
      }
    }

    const repo = new Microcosm()

    repo.patch({ color: 'red' })

    const el = render(<MyPresenter repo={repo} />)

    expect(el.textContent).toEqual('red')
  })

  test('handles non-function view model bindings', function () {
    class MyPresenter extends Presenter {
      model ({ name }) {
        return {
          upper: name.toUpperCase()
        }
      }
      view ({ upper }) {
        return <p>{upper}</p>
      }
    }

    var presenter = render(<MyPresenter name="phil" />)

    expect(presenter.textContent).toEqual('PHIL')
  })

  test('allows functions to return from model', function () {
    class MyPresenter extends Presenter {
      model () {
        return state => state
      }

      view ({ color }) {
        return <p>{color}</p>
      }
    }

    const repo = new Microcosm()

    repo.patch({ color: 'red' })

    const el = render(<MyPresenter repo={repo} />)

    expect(el.textContent).toEqual('red')
  })

  test('does not update state if no key changes', function (done) {
    let spy = jest.fn(() => <p>Test</p>)

    class MyPresenter extends Presenter {
      model () {
        return { active: true }
      }

      view = spy
    }

    const repo = new Microcosm()
    const el = render(<MyPresenter repo={repo} />)

    repo.patch({ test: true })
    repo.patch({ test: false })

    setTimeout(function() {
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    }, 0)
  })

  describe('when updating props', function () {

    test('recalculates the view model if the props are different', function (done) {
      let model = jest.fn()

      class Text extends Presenter {
        model = model
      }

      class Wrapper extends Component {
        state = {
          active: false
        }
        render (_, { active }) {
          return (
            <button onClick={() => this.setState({ active: true })}>
              <Text active={active} />
            </button>
          )
        }
      }

      render(<Wrapper />).click()

      setTimeout(function() {
        expect(model).toHaveBeenCalledTimes(2)
        done()
      }, 0)
    })

    test('does not recalculate the view model if the props are the same', function () {
      let model = jest.fn()

      class Text extends Presenter {
        model = model
      }

      class Wrapper extends Component {
        state = {
          active: false
        }
        render (_, { active }) {
          return (
            <button onClick={() => this.setState({ active: true })}>
              <Text active />
            </button>
          )
        }
      }

      render(<Wrapper />).click()

      setTimeout(function() {
        expect(model).toHaveBeenCalledTimes(1)
        done()
      }, 0)
    })
  })

  describe('when updating state', function () {
    class Namer extends Presenter {
      state = {
        greeting: 'Hello'
      }

      model (props, state) {
        return {
          text: state.greeting + ', ' + props.name
        }
      }

      view ({ text }) {
        let onClick = () => this.setState({ greeting: 'Goodbye'})
        return <button onClick={onClick}>{text}</button>
      }
    }

    test('calculates the model with state', function () {
      let el = render(<Namer name="Colonel" />)

      expect(el.textContent).toEqual('Hello, Colonel')
    })

    test('recalculates the model when state changes', function (done) {
      let el = render(<Namer name="Colonel" />)

      el.click()

      setTimeout(function() {
        expect(el.textContent).toEqual('Goodbye, Colonel')
        done()
      }, 0)
    })

    test('does not recalculate the model when state is the same', function () {
      let model = jest.fn()

      class Test extends Presenter {
        model = model

        state = { message: 'Goodbye' }

        view () {
          return <button onClick={() => this.setState(this.state)} />
        }
      }

      render(<Test name="Colonel" />).click()

      expect(model).toHaveBeenCalledTimes(1)
    })
  })

})

describe('::setup', function() {

  test('runs a setup function when created', function () {
    let setup = jest.fn()

    class MyPresenter extends Presenter {
      setup = setup
    }

    render(<MyPresenter />)

    expect(setup).toHaveBeenCalled()
  })

  test('domains added in setup show up in the view model', function () {
    class MyPresenter extends Presenter {
      setup (repo) {
        repo.addDomain('prop', {
          getInitialState: () => 'test'
        })
      }

      model () {
        return state => state
      }

      view ({ prop }) {
        return <p>{prop}</p>
      }
    }

    let el = render(<MyPresenter />)

    expect(el.textContent).toEqual('test')
  })

  test('calling setState in setup does not raise a warning', function () {
    class MyPresenter extends Presenter {
      setup() {
        this.setState({ foo: 'bar' })
      }
    }

    render(<MyPresenter />)
  })

  test('setup is called before the initial model', function () {
    const spy = jest.fn()

    class Test extends Presenter {
      setup () {
        spy('setup')
      }

      model () {
        spy('model')
        return {}
      }
    }

    render(<Test />)

    let sequence = spy.mock.calls.map(args => args[0])

    expect(sequence).toEqual(['setup', 'model'])
  })

})

describe('::update', function() {

  test('runs an update function when it gets new props', function (done) {
    let test = jest.fn()

    class MyPresenter extends Presenter {
      update (repo, { active }) {
        test(active)
      }
    }

    class Wrapper extends Component {
      state = { active: false }
      render () {
        return (
          <button onClick={() => this.setState({ active: true })}>
            <MyPresenter active={this.state.active} />
          </button>
        )
      }
    }

    render(<Wrapper />).click()

    setTimeout(function() {
      expect(test).toHaveBeenCalledWith(true)
      done()
    }, 0)
  })

  test('does not run an update function when no props change', function () {
    let test = jest.fn()

    class MyPresenter extends Presenter {
      update (repo, { active }) {
        test(active)
      }
    }

    class Wrapper extends Component {
      state = { active: false }
      render () {
        return (
          <button onClick={() => this.setState({ active: true })}>
            <MyPresenter active />
          </button>
        )
      }
    }

    render(<Wrapper />).click()

    setTimeout(function() {
      expect(test).toHaveBeenCalledTimes(1)
      done()
    }, 0)
  })

  test('it has access to the old props when update is called', function (done) {
    let test = jest.fn()

    class MyPresenter extends Presenter {
      update () {
        test(this.props.active)
      }
    }

    class Wrapper extends Component {
      state = { active: false }
      render () {
        return (
          <button onClick={() => this.setState({ active: true })}>
            <MyPresenter active={this.state.active} />
          </button>
        )
      }
    }

    render(<Wrapper />).click()

    setTimeout(function() {
      expect(test).toHaveBeenCalledWith(false)
      done()
    }, 0)
  })

})

describe('::teardown', function() {

  test('teardown gets the last props', function (done) {
    let teardown = jest.fn()

    class Test extends Presenter {
      teardown = teardown
    }

    class Wrapper extends Component {
      state = { open: true }
      render (_, { open }) {
        return open ? (
          <button onClick={() => this.setState({ open : false})}>
            <Test />
          </button>
        ) : null
      }
    }

    render(<Wrapper />).click()

    setTimeout(function() {
      expect(teardown).toHaveBeenCalled()
      done()
    }, 0)
  })

})

describe('::view', function() {

  test('views can be react components', function () {
    class MyView extends Component {
      render() {
        return <p>{this.props.message}</p>
      }
    }

    class MyPresenter extends Presenter {
      view = MyView

      model() {
        return { message: 'hello' }
      }
    }

    let el = render(<MyPresenter />)

    expect(el.textContent).toEqual('hello')
  })

  test('throws if a view is undefined', function () {
    class MissingView extends Presenter {
      view = undefined
    }

    expect(() => render(<MissingView />)).toThrow(/MissingView\::view\(\) is undefined\./)
  })

})

describe('purity', function() {

  test('does not cause a re-render when shallowly equal', function (done) {
    const repo = new Microcosm()
    const view = jest.fn()

    repo.patch({ name: 'Kurtz' })

    class Namer extends Presenter {
      model = state => state
      view  = view
    }

    render(<Namer repo={ repo } />)

    repo.patch({ name: 'Kurtz', unrelated: true })

    setTimeout(function() {
      expect(view).toHaveBeenCalledTimes(1)
      done()
    }, 0)
  })

})

describe('unmounting', function () {

  test('ignores an repo when it unmounts', function (done) {
    const spy = jest.fn()

    class Test extends Presenter {
      setup (repo) {
        repo.teardown = spy
      }
    }

    class Wrapper extends Component {
      state = { active: true }
      render (_, { active }) {
        return (
          <button onClick={() => this.setState({ active: false })}>
            {active ? <Test /> : null }
          </button>
        )
      }
    }

    render(<Wrapper />).click()

    setTimeout(function() {
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    }, 0)
  })

  test('does not update the view model when umounted', function (done) {
    const spy = jest.fn(n => {})
    let repo = new Microcosm()

    class Test extends Presenter {
      model = spy
    }

    class Wrapper extends Component {
      state = { active: true }
      render (_, { active }) {
        return (
          <button onClick={() => this.setState({ active: false })}>
            {active ? <Test repo={repo} /> : null }
          </button>
        )
      }
    }

    render(<Wrapper />).click()

    repo.patch({ foo: 'bar' })

    setTimeout(function() {
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    }, 0)
  })

})

describe('rendering efficiency', function() {

  test('child view model is not recalculated when parents cause them to re-render', function () {
    const repo = new Microcosm()

    repo.patch({ name: 'Sally Fields' })

    const model = jest.fn(function() {
      return { name: state => state.name }
    })

    class Child extends Presenter {
      model = model

      view ({ name }) {
        return <p>{ name }</p>
      }
    }

    class Parent extends Presenter {
      view = Child
    }

    let div = document.createElement('div')
    let el  = render(<Parent repo={repo} />, div)

    repo.patch({ name: 'Billy Booster' })

    expect(model).toHaveBeenCalledTimes(1)
  })

})

describe('::render', function () {

  test('the default render implementation passes children', function () {
    let el = render(<Presenter><p>Test</p></Presenter>)

    expect(el.textContent).toEqual('Test')
  })

  test('can render empty', function () {
    let el = render(<Presenter />)

    expect(el.innerHTML).toEqual(undefined)
  })

})

describe('intents', function() {

  test('receives intent events', function () {
    const test = jest.fn()

    class MyPresenter extends Presenter {
      view = View
      register() {
        return { test }
      }
    }

    let el = render(<MyPresenter />).click()

    expect(test).toHaveBeenCalled()
  })

  test('forwards intents to the repo as actions', function () {
    class MyPresenter extends Presenter {
      view() {
        return <View />
      }
    }

    const repo = new Microcosm({ maxHistory: 1 })

    render(<MyPresenter repo={repo} />).click()

    expect(repo.history.head.type).toEqual('test')
  })

  test('send bubbles up to parent presenters', function () {
    const test = jest.fn()

    class Child extends Presenter {
      view() {
        return <View />
      }
    }

    class Parent extends Presenter {
      register() {
        return { test: (repo, props) => test(props) }
      }
      view () {
        return <Child />
      }
    }

    render(<Parent repo={ new Microcosm() } />).click()

    expect(test).toHaveBeenCalledWith(true)
  })

  test('intents are tagged', function () {
    const spy = jest.fn()

    const a = function a () {}
    const b = function a () {}

    class Test extends Presenter {
      register() {
        return { [a]: spy }
      }
      view () {
        return (
          <button id="button" onClick={() => this.send(b, true)} />
        )
      }
    }

    render(<Test />).click()

    expect(spy).not.toHaveBeenCalled()
  })

})

describe('forks', function () {

  test('nested presenters fork in the correct order', function () {
    class Top extends Presenter {
      setup(repo) {
        repo.name = 'top'
      }
    }

    class Middle extends Presenter {
      setup(repo) {
        repo.name = 'middle'
      }
    }

    class Bottom extends Presenter {
      setup(repo) {
        repo.name = 'bottom'
      }

      view () {
        let names = []
        let repo = this.repo

        while (repo) {
          names.push(repo.name)
          repo = repo.parent
        }

        return <p>{names.join(', ')}</p>
      }
    }

    const el = render(<Top><Middle><Bottom /></Middle></Top>)

    expect(el.textContent).toEqual('bottom, middle, top')
  })

})
