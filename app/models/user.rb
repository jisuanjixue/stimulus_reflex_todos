class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  validates :email, uniqueness: true
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :name, format: { with: /^[a-zA-Z0-9_.]*$/, multiline: true }
  validates :password, presence: true, on: :create
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
        #  :jwt_authenticatable, jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

  has_many :notifications, as: :recipient, dependent: :destroy
  has_many :book_authors
  has_many :books, through: :book_authors, dependent: :destroy
end
