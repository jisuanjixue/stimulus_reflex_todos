class Navigation::Component < ApplicationViewComponent
    renders_many :links, "LinkComponent"

    class LinkComponent < ApplicationViewComponent
        option :name, default: proc {""}
        option :link
    end
end