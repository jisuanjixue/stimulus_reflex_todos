class TableComponent < ApplicationViewComponent
    option :collection
    option :columns
    

    def initialize
        @model_name = @collection.name.underscore
        @page_size = 10
        @page = 0
        @filter = {}
    end

    def omitted_from_state
        [:@columns]
    end

    def permit_parameter?(initial_param, new_param)
        if initial_param.is_a? Hash
          false
        else
          super
        end
    end
end