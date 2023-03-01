class DeliveryMethods::System < Noticed::DeliveryMethods::Base
  include CableReady::Broadcaster
  def deliver
    # Logic for sending the notification
    cable_ready[channel].notification(
             title: "My App",
             options: {
               body: notification.message
             }
           ).broadcast_to(recipient)
  end

  # You may override this method to validate options for the delivery method
  # Invalid options should raise a ValidationError
  #
  # def self.validate!(options)
  #   raise ValidationError, "required_option missing" unless options[:required_option]
  # end

  def channel
     @channel ||= begin
       value = options[:channel]
       case value
       when String
         value.constantize
       else
         Noticed::NotificationChannel
       end
     end
  end
end
