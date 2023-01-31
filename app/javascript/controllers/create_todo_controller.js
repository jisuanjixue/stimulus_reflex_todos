import ApplicationController from './application_controller';

export default class extends ApplicationController {
  add(e) {
    console.log(
      '🚀 ~ file: create_todo_controller.js:8 ~ extends ~ add ~ e.target',
      e.target,
    );
    e.preventDefault();
    Array.from(e.target.elements).forEach((e) => (e.value = ''));
    this.stimulate('CreateTodo::Component#add', e.target);
  }
}
