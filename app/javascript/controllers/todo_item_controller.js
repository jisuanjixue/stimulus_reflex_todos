import { Controller } from '@hotwired/stimulus';
import { useDebounce } from 'stimulus-use';

export default class extends Controller {
  static debounces = ['add'];

  connect() {
    useDebounce(this, { wait: 100 });
  }

  add() {}
}
