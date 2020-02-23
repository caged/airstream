import TestComponent from './components/TestComponent'

const app = new TestComponent({
  target: document.body,
  props: { name: 'test' }
});

export default app;

// declare function require(path: string): any

// ReactDOM.render(<Plugin />, document.getElementById('app'))