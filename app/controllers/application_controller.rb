class ApplicationController < ActionController::Base
  layout -> { @stimulus_reflex ? false : "application" }
  before_action :authenticate_user!
  
  before_action do
    @token = user_signed_in? ? Warden::JWTAuth::UserEncoder.new.call(current_user, :user, nil).first : nil
  end

  include Dry::Effects::Handler.Reader(:current_user)

  around_action :set_current_user

  private

  def set_current_user
    with_current_user(current_user) { yield }
  end

end
