defmodule PartyGame.Games.BuildYourOwnPrebuilt do
  @geography ~s({
    "name": "United States Geography",
    "questions": [
        {
            "question": "What is the northernmost state?",
            "type": "multi",
            "correct": "Alaska",
            "answers": [
                "Alaska",
                "Minnesota",
                "Washington",
                "Main"
            ]
        },
        {
            "question": "What is the southernmost state?",
            "type": "multi",
            "correct": "Hawaii",
            "answers": [
                "Hawaii",
                "Florida",
                "Texas",
                "California"
            ]
        },
        {
            "question": "What is the tallest mountain?",
            "type": "multi",
            "correct": "Mount McKinley",
            "answers": [
                "Mount McKinley",
                "Mount Saint Elias",
                "Mount Elbert",
                "Mount Rainier"
            ]
        },
        {
            "question": "What is the lowest point?",
            "type": "multi",
            "correct": "Badwater Basin ",
            "answers": [
                "Badwater Basin ",
                "Colorado River",
                "New Orleans ",
                "Long Island Sound"
            ]
        },
        {
            "question": "What state is known for Nascar?",
            "type": "multi",
            "correct": "Delaware",
            "answers": [
                "Delaware",
                "Tennessee",
                "Kentucky",
                "Rhode Island"
            ]
        },
        {
            "question": "What state is best known  for peaches?",
            "type": "multi",
            "correct": "Georgia",
            "answers": [
                "Georgia",
                "California",
                "Florida",
                "Louisiana"
            ]
        },
        {
            "question": "What state is best known for potatoes?",
            "type": "multi",
            "correct": "Idaho",
            "answers": [
                "Idaho",
                "Oregon",
                "Ireland",
                "Montana"
            ]
        },
        {
            "question": "What state is best known  for deep dish pizza?",
            "type": "multi",
            "correct": "Illinois",
            "answers": [
                "Illinois",
                "Chicago",
                "New York",
                "Texas"
            ]
        },
        {
            "question": "What state is best known for corn fields?",
            "type": "multi",
            "correct": "Iowa",
            "answers": [
                "Iowa",
                "Minnesota",
                "North Dakota",
                "South Dakota"
            ]
        },
        {
            "question": "What state is best known for the Wizard Of Oz?",
            "type": "multi",
            "correct": "Kansas",
            "answers": [
                "Ohio",
                "Kansas",
                "Oz",
                "Montana"
            ]
        },
        {
            "question": "What state is best known for lobster?",
            "type": "multi",
            "correct": "Maine",
            "answers": [
                "Maine",
                "Maryland",
                "Red Lobster",
                "Massachussetts"
            ]
        },
        {
            "question": "What state is best known for the  auto industry?",
            "type": "multi",
            "correct": "Michigan",
            "answers": [
                "Michigan",
                "Minnesota",
                "Ford",
                "Mississippi"
            ]
        },
        {
            "question": "What state is best  known for broadway?",
            "type": "multi",
            "correct": "New York",
            "answers": [
                "New York",
                "New Jersey",
                "California",
                "Florida"
            ]
        },
        {
            "question": "What state is best known for tornados?",
            "type": "multi",
            "correct": "Oklahoma",
            "answers": [
                "Oklahoma",
                "Nebraska",
                "Rhode Island",
                "Nevada"
            ]
        },
        {
            "question": "What state is best known for the Liberty Bell?",
            "type": "multi",
            "correct": "Pennsylvania",
            "answers": [
                "Pennsylvania",
                "Delaware",
                "Massachussetts",
                "Maine"
            ]
        },
        {
            "question": "What state is best known for Mount Rushmore?",
            "type": "multi",
            "correct": "South Dakota",
            "answers": [
                "South Dakota",
                "North Dakota",
                "Colorado",
                "Alaska"
            ]
        },
        {
            "question": "What state is best known for country music?",
            "type": "multi",
            "correct": "Tennessee",
            "answers": [
                "Tennessee",
                "Alabama",
                "Oklahoma",
                "Ohio"
            ]
        },
        {
            "question": "What state is best known for barbecue?",
            "type": "multi",
            "correct": "Texas",
            "answers": [
                "Texas",
                "New York",
                "Montana",
                "Vermont"
            ]
        },
        {
            "question": "What state is best known for cheese?",
            "type": "multi",
            "correct": "Wisconsin",
            "answers": [
                "Wisconsin",
                "West Virginia",
                "Minnesota",
                "Ohio"
            ]
        },
        {
            "question": "What is the largest state by land mass?",
            "type": "multi",
            "correct": "Alaska",
            "answers": [
                "Alaska",
                "Texas",
                "California",
                "Washington"
            ]
        },
        {
            "question": "What is the largest lake?",
            "type": "multi",
            "correct": "Lake Superior",
            "answers": [
                "Lake Superior",
                "Lake Michigan",
                "Lake Huron",
                "Lake Erie"
            ]
        },
        {
            "question": "What state is Crater Lake in?",
            "type": "multi",
            "correct": "Oregon",
            "answers": [
                "Oregon",
                "Colorado",
                "Nevada",
                "California"
            ]
        },
        {
            "question": "What state is known as the Garden State?",
            "type": "multi",
            "correct": "New Jersey",
            "answers": [
                "New Jersey",
                "New York",
                "West Virginia",
                "California"
            ]
        },
        {
            "question": "What state has the worlds largest flat top mountain Grand Mesa?",
            "type": "multi",
            "correct": "Colorado",
            "answers": [
                "Colorado",
                "Arizona",
                "Montana",
                "Alaska"
            ]
        },
        {
            "question": "What state is least populated?",
            "type": "multi",
            "correct": "Wyoming",
            "answers": [
                "Wyoming",
                "Montana",
                "South Dakota",
                "North Dakota"
            ]
        },
        {
            "question": "What state is the land of 10,000 lakes?",
            "type": "multi",
            "correct": "Minnesota",
            "answers": [
                "Minnesota",
                "Wisconsin",
                "California",
                "Washington"
            ]
        },
        {
            "question": "What is the longest river?",
            "type": "multi",
            "correct": "Missouri River",
            "answers": [
                "Missouri River",
                "Mississippi River",
                "Colorado River",
                "Long River"
            ]
        },
        {
            "question": "Where is Death Valley?",
            "type": "multi",
            "correct": "California",
            "answers": [
                "California",
                "Nevada",
                "New Mexico",
                "Arizona"
            ]
        },
        {
            "question": "What desert is Las Vegas located in?",
            "type": "multi",
            "correct": "Mojave Desert",
            "answers": [
                "Mojave Desert",
                "Great Basin Desert",
                "Chihuahuan Desert",
                "Sonoran Desert"
            ]
        },
        {
            "question": "Which US state was bought from Russia in 1867?",
            "type": "multi",
            "correct": "Alaska",
            "answers": [
                "Alaska",
                "Hawaii",
                "Puerto Rico",
                "Maine"
            ]
        },
        {
            "question": "Which state is called the \\"The First State\\"?",
            "type": "multi",
            "correct": "Deleware",
            "answers": [
                "Deleware",
                "Massachussetts",
                "Rhode Island",
                "Atlanta"
            ]
        }
    ]
})

  def new(_, _) do
    game = PartyGame.Game.Game.create_game(PartyGame.Game.Game.new(), Jason.decode!(@geography))
    game.questions
  end
end
