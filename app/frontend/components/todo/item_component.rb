# frozen_string_literal: true

class Todo::ItemComponent < ApplicationViewComponent
  option :editing, default: false

  def initialize(item:)
    @todo = item
  end

  def collection_key
    @todo.id || SecureRandom.hex(16)
  end

  def toggle_completed
    @todo.completed = !@todo.completed
    @todo.save!
    refresh! ".todo-list"
  end

  def begin_edit
    @editing = true
  end

  def end_edit
    @todo.reload
    @editing = false
  end

  def handle_name_change
    @todo.name = element.value
  end

  def commit_edit
    @todo.save!
    end_edit
  end

  def todo_name(todo)
    classes = %w[w-5]
    classes.push "completed" if todo.completed
    tag.p(class: classes.join(" ")) do
      todo.name
    end
  end

  def delete
    @todo.destroy!
    refresh! ".todo-list"
  end
end
