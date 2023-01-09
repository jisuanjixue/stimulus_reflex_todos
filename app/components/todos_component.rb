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
        if @filter =filter
            'btn-primary'
        else
            'btn-secondary'
        end
    end

    def tags
        buttons = %w[All active completed]
        tag.div class '' do
            
        end
    end

end
