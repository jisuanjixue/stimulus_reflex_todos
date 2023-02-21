# frozen_string_literal: true

class Todos::Component < ApplicationViewComponent

  option :filter, type: Dry::Types['strict.string'], default: proc { "All" }

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
    if @filter == filter
      "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
    else
      "text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
    end
  end

  def tags
    buttons = %w[All Active Completed]
    tag.div class: "" do
      buttons.each do |button|
        opts = {
          id: "#{button}-tag",
          class: "text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-blue-200 
                  text-blue-700 rounded-full #{filter_class(button)}",
          data: {
            reflex: "click->TodosComponentReflex#filter", filter: button, key:,
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
