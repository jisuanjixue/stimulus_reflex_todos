class Book < ApplicationRecord
    has_many :users, through: :book_authors, dependent: :destroy
    has_many :book_users
end
