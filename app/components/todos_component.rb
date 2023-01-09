# frozen_string_literal: true

class TodosComponent < ViewComponentReflex::Component
  def initialize
    @filter = "All"
  end

  def filter_todos
    case @filter
    when "Active"
      active_todos
    when "Completed"
      completed_todos
    else
      todos
    end
  end

  def active_todos
    todos.where(completed: false)
  end

  def completed_todos
    todos.where(completed: true)
  end

  def todos
    Todo.where(session_id: request.session.id.to_s).order(:created_at)
  end

  def filter_class(filter)
    if @filter = filter
      "btn-primary"
    else
      "btn-secondary"
    end
  end

  def tags
    buttons = %w[All active completed]
    tag.div class: "" do
      buttons.each do |button|
        opts = {
          id: "#{button}-tag",
          class: "text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-blue-200 text-blue-700 rounded-full #{filter_class(button)}",
          data: {
            reflex: "click->TodosComponentReflex#filter", filter: button, key: key,
          },
        }
        concat tag.a(button, **opts)
      end
    end
  end

  def no_todos_text
    case @filter
    when "Completed"
      "You haven't completed any of your todos!"
    when "Active"
      "You've completed all your todos!"
    else
      "You haven't created any todos!"
    end
  end

  # reflexes

  def filter
    @filter = element.dataset[:filter]
  end

  def clear
    completed_todos.destroy_all
  end
end
