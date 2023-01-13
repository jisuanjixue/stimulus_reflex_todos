import ApplicationController from './application_controller';
import { useDebounce } from 'stimulus-use';

export default class extends ApplicationController {
  // static debounces = ['add'];

  static debounces = ['add'];

  add(e) {
    e.preventDefault();
    useDebounce(this);
    Array.from(e.target.elements).forEach((e) => (e.value = ''));
    this.stimulate('CreateTodoComponent#add', e.target);
  }
}
