
# Person.pluck(:id, :name)
# SELECT people.id, people.name FROM people
# => [[1, 'David'], [2, 'Jeremy'], [3, 'Jose']]
# use pluck as a shortcut to select one and more attributes without a loading  a bunch of records just to grab the attributes you want.

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
