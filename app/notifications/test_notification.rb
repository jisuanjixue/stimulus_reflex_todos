# To deliver this notification:
#
# TestNotification.with(post: @post).deliver_later(current_user)
# TestNotification.with(post: @post).deliver(current_user)

class TestNotification < Noticed::Base
  # Add your delivery methods
  #
  deliver_by :database
  deliver_by :system, class: "DeliveryMethods::System", channel: "NotificationChannel"
  # deliver_by :email, mailer: "UserMailer"
  # deliver_by :slack
  # deliver_by :custom, class: "MyDeliveryMethod"

  # Add required params
  #
  # param :post

  # Define helper methods to make rendering easier.
  #
  def message
    "A system notification"
  end
  #
  # def url
  #   post_path(params[:post])
  # end
end
