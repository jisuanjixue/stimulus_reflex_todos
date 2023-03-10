class Loaders::Component < ApplicationViewComponent
    option :loading, default: proc { false }
    option :counter, default: proc { 3 }

    def do_stuff
        sleep 1
        @counter -= 1
        refresh!
      end
    
      def loading=(bool)
        @loading = bool
        refresh!
      end
    
      def execute
        return if @loading
    
        @counter = 3
        self.loading = true
        @counter.times { do_stuff }
        self.loading = false
      end
end