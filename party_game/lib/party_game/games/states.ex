defmodule PartyGame.Games.States do
  alias PartyGame.Question

  def new(number_questions \\ 10) do
    states = Enum.take_random(state_capitals(), number_questions)
    keys = states |> Enum.reduce([], fn {k, _}, acc -> [k | acc] end)
    other_cities = Map.take(state_cities(), keys)

    Enum.reduce(states, [], fn {state, capital}, acc ->
      [
        %Question{
          question: "What is the capital of #{state}?",
          answers: random_answers(state, capital, other_cities),
          correct: capital
        }
        | acc
      ]
    end)
  end

  defp random_answers(state, capital, other_cities) do
    other_state_cities = other_cities[state] || []
    answers = [capital | Enum.take_random(other_state_cities, 3)]
    Enum.shuffle(answers)
  end

  defp state_capitals() do
    %{
      "Arizona" => "Phoenix",
      "Arkansas" => "Little Rock",
      "California" => "Sacramento",
      "Colorado" => "Denver",
      "Connecticut" => "Hartford",
      "Delaware" => "Dover",
      "Hawaii" => "Honolulu",
      "Florida" => "Tallahassee",
      "Georgia" => "Atlanta",
      "Idaho" => "Boise",
      "Illinois" => "Springfield",
      "Indiana" => "Indianapolis",
      "Iowa" => "Des Moines",
      "Kansas" => "Topeka",
      "Kentucky" => "Frankfort",
      "Louisiana" => "Baton Rouge",
      "Maine" => "Augusta",
      "Maryland" => "Annapolis",
      "Massachusetts" => "Boston",
      "Michigan" => "Lansing",
      "Minnesota" => "St. Paul",
      "Mississippi" => "Jackson",
      "Missouri" => "Jefferson City",
      "Montana" => "Helena",
      "Nebraska" => "Lincoln",
      "Nevada" => "Carson City",
      "New Hampshire" => "Concord",
      "New Jersey" => "Trenton",
      "New Mexico" => "Santa Fe",
      "North Carolina" => "Raleigh",
      "North Dakota" => "Bismarck",
      "New York" => "Albany",
      "Ohio" => "Columbus",
      "Oklahoma" => "Oklahoma City",
      "Oregon" => "Salem",
      "Pennsylvania" => "Harrisburg",
      "Rhode Island" => "Providence",
      "South Carolina" => "Columbia",
      "South Dakota" => "Pierre",
      "Tennessee" => "Nashville",
      "Texas" => "Austin",
      "Utah" => "Salt Lake City",
      "Vermont" => "Montpelier",
      "Virginia" => "Richmond",
      "Washington" => "Olympia",
      "West Virginia" => "Charleston",
      "Wisconsin" => "Madison",
      "Wyoming" => "Cheyenne"
    }
  end

  defp state_cities() do
    %{
      "Pennsylvania" => [
        "Pittsburgh",
        "Altoona",
        "Reading",
        "Bethlehem",
        "Scranton",
        "York",
        "Wilkes-Barre",
        "State College",
        "Erie",
        "Lancaster",
        "Philadelphia",
        "Allentown"
      ],
      "Maine" => ["Portland", "Lewiston", "	Bangor", "Auburn", "Biddeford", "Sanford"],
      "North Dakota" => ["Minot", "Fargo", "Grand Forks"],
      "South Carolina" => [
        "Summerville",
        "Hilton Head Island",
        "Rock Hill",
        "Sumter",
        "North Charleston",
        "Goose Creek",
        "Charleston",
        "Florence",
        "Spartanburg",
        "Greenville",
        "Mount Pleasant"
      ],
      "Hawaii" => ["Hilo", "Pearl City", "Kaneohe", "Kahului", "Kapolei", "Halawa", "Waipahu"],
      "Massachusetts" => [
        "Everett",
        "Cambridge",
        "Haverhill",
        "Chicopee",
        "New Bedford",
        "Lynn",
        "Westfield",
        "Somerville",
        "Pittsfield",
        "Methuen",
        "Attleboro",
        "Beverly",
        "Leominster",
        "Quincy",
        "Revere",
        "Peabody",
        "Brockton",
        "Holyoke",
        "Barnstable Town",
        "Marlborough",
        "Waltham",
        "Lawrence",
        "Taunton",
        "Lowell",
        "Springfield",
        "Newton",
        "Fitchburg",
        "Medford",
        "Chelsea",
        "Malden",
        "Weymouth Town",
        "Fall River",
        "Woburn",
        "Salem",
        "Worcester"
      ],
      "Missouri" => [
        "Joplin",
        "Independence",
        "Chesterfield",
        "Springfield",
        "O'Fallon",
        "Blue Springs",
        "Columbia",
        "St. Joseph",
        "Lee's Summit",
        "St. Peters",
        "Cape Girardeau",
        "St. Louis",
        "Florissant",
        "St. Charles",
        "Kansas City"
      ],
      "West Virginia" => ["Huntington", "Morgantown", "Parkersburg", "Wheeling", "Fairmont"],
      "South Dakota" => ["Sioux Falls", "Rapid City", "Aberdeen"],
      "Arkansas" => [
        "Conway",
        "Fayetteville",
        "Pine Bluff",
        "Jonesboro",
        "Springdale",
        "Bentonville",
        "North Little Rock",
        "Rogers",
        "Fort Smith"
      ],
      "Delaware" => ["Wilmington", "Newark", "Middletown", "Bear"],
      "Wyoming" => ["Casper", "Gillette", "Laramie", "Rock Springs", "Sheridan"],
      "Washington" => [
        "Federal Way",
        "Redmond",
        "Pasco",
        "Tacoma",
        "Sammamish",
        "Kirkland",
        "Renton",
        "Auburn",
        "Richland",
        "Bellevue",
        "Seattle",
        "Vancouver",
        "Everett",
        "Yakima",
        "Lacey",
        "Spokane Valley",
        "Kent",
        "Edmonds",
        "Shoreline",
        "Bremerton",
        "Puyallup",
        "Burien",
        "Lakewood",
        "Bellingham",
        "Kennewick",
        "Spokane",
        "Marysville"
      ],
      "Wisconsin" => [
        "Green Bay",
        "Janesville",
        "Sheboygan",
        "Oshkosh",
        "Milwaukee",
        "Racine",
        "Wauwatosa",
        "Appleton",
        "Beloit",
        "Kenosha",
        "Greenfield",
        "Eau Claire",
        "Brookfield",
        "Fond du Lac",
        "Wausau",
        "Waukesha",
        "West Allis",
        "La Crosse",
        "New Berlin"
      ],
      "Mississippi" => ["Biloxi", "Meridian", "Hattiesburg", "Gulfport", "Southaven"],
      "Colorado" => [
        "Northglenn",
        "Greeley",
        "Westminster",
        "Castle Rock",
        "Longmont",
        "Loveland",
        "Grand Junction",
        "Centennial",
        "Boulder",
        "Colorado Springs",
        "Aurora",
        "Arvada",
        "Broomfield",
        "Fort Collins",
        "Commerce City",
        "Pueblo",
        "Littleton",
        "Thornton",
        "Lakewood",
        "Parker"
      ],
      "Georgia" => [
        "Roswell",
        "Brookhaven",
        "Valdosta",
        "Alpharetta",
        "Sandy Springs",
        "Warner Robins",
        "Dunwoody",
        "Peachtree Corners",
        "Savannah",
        "Albany",
        "Augusta-Richmond County",
        "Johns Creek",
        "Macon",
        "Athens-Clarke County",
        "Smyrna",
        "Columbus",
        "Marietta"
      ],
      "North Carolina" => [
        "Asheville",
        "Winston-Salem",
        "Hickory",
        "High Point",
        "Kannapolis",
        "Charlotte",
        "Fayetteville",
        "Burlington",
        "Apex",
        "Jacksonville",
        "Greensboro",
        "Durham",
        "Rocky Mount",
        "Wilson",
        "Wilmington",
        "Huntersville",
        "Cary",
        "Chapel Hill",
        "Concord",
        "Greenville",
        "Gastonia"
      ],
      "Idaho" => [
        "Twin Falls",
        "Pocatello",
        "Idaho Falls",
        "Nampa",
        "Coeur d'Alene",
        "Meridian",
        "Caldwell",
        "Boise City"
      ],
      "Nevada" => ["Las Vegas", "Sparks", "North Las Vegas", "Reno", "Henderson"],
      "New Hampshire" => ["Manchester", "Nashua", "Derry", "Dover", "Rochester", "Salem"],
      "Florida" => [
        "Lauderhill",
        "Boca Raton",
        "Ocala",
        "Fort Pierce",
        "Panama City",
        "Ocoee",
        "Greenacres",
        "Winter Garden",
        "Aventura",
        "Gainesville",
        "Hialeah",
        "Hallandale Beach",
        "Palm Beach Gardens",
        "Largo",
        "Cape Coral",
        "Homestead",
        "North Port",
        "Bonita Springs",
        "Miami",
        "Margate",
        "Cutler Bay",
        "Clearwater",
        "Fort Lauderdale",
        "Bradenton",
        "Coconut Creek",
        "Miramar",
        "Ormond Beach",
        "Port St. Lucie",
        "St. Petersburg",
        "Port Orange",
        "Deltona",
        "Pembroke Pines",
        "Tamarac",
        "Altamonte Springs",
        "Palm Coast",
        "St. Cloud",
        "Jupiter",
        "Sarasota",
        "Plantation",
        "Tampa",
        "Fort Myers",
        "Lakeland",
        "Pensacola",
        "Sunrise",
        "Miami Beach",
        "Titusville",
        "Weston",
        "Wellington",
        "Delray Beach",
        "Boynton Beach",
        "Oakland Park",
        "Davie",
        "Pompano Beach",
        "Sanford",
        "Palm Bay",
        "Melbourne",
        "Miami Gardens",
        "North Miami",
        "North Miami Beach",
        "Pinellas Park",
        "Orlando",
        "Kissimmee",
        "Coral Gables",
        "Jacksonville",
        "Hollywood",
        "Apopka",
        "Coral Springs",
        "Deerfield Beach",
        "North Lauderdale",
        "Daytona Beach",
        "Doral",
        "West Palm Beach"
      ],
      "Utah" => [
        "West Jordan",
        "St. George",
        "Draper",
        "Roy",
        "Orem",
        "West Valley City",
        "Sandy",
        "Murray",
        "Layton",
        "Ogden",
        "Lehi",
        "Riverton",
        "Taylorsville",
        "Spanish Fork",
        "Provo",
        "Bountiful",
        "South Jordan",
        "Logan"
      ],
      "Tennessee" => [
        "Hendersonville",
        "Smyrna",
        "Brentwood",
        "Cleveland",
        "Memphis",
        "Germantown",
        "Murfreesboro",
        "Knoxville",
        "Clarksville",
        "Johnson City",
        "Jackson",
        "Chattanooga",
        "Collierville",
        "Bartlett",
        "Franklin",
        "Kingsport"
      ],
      "Kansas" => [
        "Salina",
        "Shawnee",
        "Hutchinson",
        "Olathe",
        "Wichita",
        "Manhattan",
        "Kansas City",
        "Lawrence",
        "Lenexa",
        "Overland Park"
      ],
      "Illinois" => [
        "Hanover Park",
        "Park Ridge",
        "Cicero",
        "Evanston",
        "Orland Park",
        "Urbana",
        "Tinley Park",
        "Waukegan",
        "Elgin",
        "Carpentersville",
        "Berwyn",
        "Champaign",
        "Hoffman Estates",
        "Plainfield",
        "Joliet",
        "Carol Stream",
        "Downers Grove",
        "Rockford",
        "Arlington Heights",
        "Moline",
        "Skokie",
        "Lombard",
        "Chicago",
        "Schaumburg",
        "Glenview",
        "Bolingbrook",
        "Oak Park",
        "Palatine",
        "Des Plaines",
        "Rock Island",
        "Bartlett",
        "Mount Prospect",
        "Decatur",
        "Streamwood",
        "Bloomington",
        "Quincy",
        "Elmhurst",
        "Peoria",
        "Wheaton",
        "Buffalo Grove",
        "Wheeling",
        "Romeoville",
        "Normal",
        "Addison",
        "Crystal Lake",
        "Belleville",
        "Calumet City",
        "Oak Lawn",
        "Naperville",
        "DeKalb",
        "Aurora"
      ],
      "New York" => [
        "New York",
        "Utica",
        "White Plains",
        "Freeport",
        "Valley Stream",
        "Syracuse",
        "Troy",
        "New Rochelle",
        "Hempstead",
        "Niagara Falls",
        "Yonkers",
        "Rochester",
        "Binghamton",
        "Schenectady",
        "Mount Vernon",
        "Buffalo"
      ],
      "Rhode Island" => ["Pawtucket", "Warwick", "Cranston", "Woonsocket", "East Providence"],
      "Indiana" => [
        "Evansville",
        "Anderson",
        "South Bend",
        "Columbus",
        "Terre Haute",
        "Carmel",
        "Gary",
        "Muncie",
        "Jeffersonville",
        "Lafayette",
        "Kokomo",
        "Hammond",
        "Greenwood",
        "Fort Wayne",
        "Mishawaka",
        "Lawrence",
        "Noblesville",
        "Fishers",
        "Bloomington",
        "Elkhart"
      ],
      "Kentucky" => ["Bowling Green", "Lexington-Fayette", "Louisville", "Owensboro", "Covington"],
      "Oregon" => [
        "Gresham",
        "Corvallis",
        "Springfield",
        "Keizer",
        "Albany",
        "Medford",
        "Bend",
        "Lake Oswego",
        "Hillsboro",
        "Beaverton",
        "Eugene",
        "Tigard",
        "Portland"
      ],
      "Texas" => [
        "Corpus Christi",
        "Cedar Hill",
        "League City",
        "Lewisville",
        "Arlington",
        "Waco",
        "Tyler",
        "Fort Worth",
        "Sherman",
        "College Station",
        "Coppell",
        "Plano",
        "Hurst",
        "Bryan",
        "Cedar Park",
        "Friendswood",
        "Round Rock",
        "Huntsville",
        "Carrollton",
        "Wylie",
        "Victoria",
        "Pflugerville",
        "Temple",
        "Texas City",
        "Edinburg",
        "El Paso",
        "Pasadena",
        "Euless",
        "Keller",
        "Georgetown",
        "Odessa",
        "Beaumont",
        "Houston",
        "Irving",
        "New Braunfels",
        "San Marcos",
        "Richardson",
        "Frisco",
        "Burleson",
        "Port Arthur",
        "Garland",
        "Mesquite",
        "Grand Prairie",
        "Longview",
        "Amarillo",
        "Killeen",
        "McKinney",
        "McAllen",
        "San Angelo",
        "Weslaco",
        "Lancaster",
        "Duncanville",
        "Sugar Land",
        "Haltom City",
        "Laredo",
        "Galveston",
        "Denton",
        "Harlingen",
        "Bedford",
        "Mansfield",
        "Grapevine",
        "Flower Mound",
        "Brownsville",
        "DeSoto",
        "Rockwall",
        "Midland",
        "Pharr",
        "Missouri City",
        "Wichita Falls",
        "Abilene",
        "Allen",
        "Mission",
        "Baytown",
        "San Antonio",
        "Conroe",
        "Pearland",
        "The Colony",
        "Texarkana",
        "Dallas",
        "North Richland Hills",
        "Rowlett",
        "Lubbock"
      ],
      "Nebraska" => ["Grand Island", "Bellevue", "Omaha"],
      "Vermont" => ["Burlington", "Essex", "Colchester", "Bennington"],
      "Alabama" => [
        "Dothan",
        "Phenix City",
        "Florence",
        "Auburn",
        "Decatur",
        "Hoover",
        "Tuscaloosa",
        "Mobile",
        "Madison",
        "Huntsville",
        "Birmingham",
        "Montgomery"
      ],
      "Michigan" => [
        "Novi",
        "Roseville",
        "Dearborn",
        "Farmington Hills",
        "Dearborn Heights",
        "Livonia",
        "Wyoming",
        "Portage",
        "East Lansing",
        "Ann Arbor",
        "Rochester Hills",
        "Midland",
        "Warren",
        "Grand Rapids",
        "Battle Creek",
        "Westland",
        "Royal Oak",
        "Troy",
        "Kalamazoo",
        "Muskegon",
        "Pontiac",
        "Detroit",
        "Saginaw",
        "Taylor",
        "Kentwood",
        "St. Clair Shores",
        "Flint",
        "Lincoln Park",
        "Sterling Heights",
        "Southfield"
      ],
      "Maryland" => ["Baltimore", "Rockville", "Hagerstown", "Bowie", "Frederick", "Gaithersburg"],
      "Louisiana" => [
        "Monroe",
        "Bossier City",
        "Lake Charles",
        "Shreveport",
        "Kenner",
        "Alexandria",
        "New Orleans",
        "Lafayette"
      ],
      "Alaska" => ["Anchorage"],
      "New Mexico" => [
        "Farmington",
        "Las Cruces",
        "Clovis",
        "Rio Rancho",
        "Albuquerque",
        "Roswell"
      ],
      "Virginia" => [
        "Virginia Beach",
        "Hampton",
        "Alexandria",
        "Suffolk",
        "Manassas",
        "Danville",
        "Roanoke",
        "Harrisonburg",
        "Norfolk",
        "Portsmouth",
        "Chesapeake",
        "Newport News",
        "Charlottesville",
        "Lynchburg",
        "Blacksburg",
        "Leesburg"
      ],
      "Oklahoma" => [
        "Moore",
        "Norman",
        "Enid",
        "Edmond",
        "MidWest City",
        "Stillwater",
        "Muskogee",
        "Broken Arrow",
        "Lawton",
        "Tulsa"
      ],
      "Iowa" => [
        "Davenport",
        "Cedar Rapids",
        "Iowa City",
        "Cedar Falls",
        "Ames",
        "Dubuque",
        "Sioux City",
        "Ankeny",
        "Waterloo",
        "West Des Moines",
        "Council Bluffs",
        "Urbandale"
      ],
      "Ohio" => [
        "Cleveland Heights",
        "Canton",
        "Lakewood",
        "Beavercreek",
        "Lorain",
        "Akron",
        "Westerville",
        "Newark",
        "Middletown",
        "Elyria",
        "Mentor",
        "Springfield",
        "Hamilton",
        "Huber Heights",
        "Warren",
        "Euclid",
        "Dayton",
        "Strongsville",
        "Findlay",
        "Dublin",
        "Mansfield",
        "Youngstown",
        "Toledo",
        "Cincinnati",
        "Parma",
        "Fairfield",
        "Grove City",
        "Cuyahoga Falls",
        "Kettering",
        "Lancaster",
        "Lima",
        "Cleveland"
      ],
      "Montana" => ["Great Falls", "Billings", "Bozeman", "Missoula"],
      "New Jersey" => [
        "Linden",
        "West New York",
        "Vineland",
        "East Orange",
        "Plainfield",
        "Clifton",
        "Hoboken",
        "Perth Amboy",
        "Jersey City",
        "Bayonne",
        "Kearny",
        "New Brunswick",
        "Sayreville",
        "Elizabeth",
        "Camden",
        "Hackensack",
        "Union City",
        "Newark",
        "Paterson",
        "Passaic",
        "Atlantic City"
      ],
      "Arizona" => [
        "Glendale",
        "Yuma",
        "Surprise",
        "Prescott Valley",
        "Casa Grande",
        "Avondale",
        "Tempe",
        "Peoria",
        "Bullhead City",
        "Apache Junction",
        "Chandler",
        "Sierra Vista",
        "Goodyear",
        "Maricopa",
        "Mesa",
        "Oro Valley",
        "Tucson",
        "Marana",
        "Gilbert",
        "Scottsdale",
        "Buckeye",
        "Prescott",
        "Lake Havasu City",
        "Flagstaff"
      ],
      "California" => [
        "Compton",
        "Lake Forest",
        "Oceanside",
        "Santa Clara",
        "Stanton",
        "Huntington Beach",
        "South Gate",
        "Downey",
        "Yucaipa",
        "Los Angeles",
        "Lynwood",
        "Garden Grove",
        "La Mirada",
        "Davis",
        "Brentwood",
        "Palo Alto",
        "Oakley",
        "Torrance",
        "Azusa",
        "Thousand Oaks",
        "Martinez",
        "Turlock",
        "La Mesa",
        "Santa Maria",
        "Carson",
        "West Covina",
        "Simi Valley",
        "San Rafael",
        "West Sacramento",
        "Gardena",
        "Glendale",
        "Ontario",
        "San Ramon",
        "Menifee",
        "Aliso Viejo",
        "Union City",
        "Redwood City",
        "San Gabriel",
        "Fresno",
        "Gilroy",
        "Cupertino",
        "Lancaster",
        "Pacifica",
        "Irvine",
        "San Jose",
        "La Puente",
        "Cerritos",
        "Pico Rivera",
        "Fullerton",
        "Burbank",
        "Rancho Cordova",
        "Highland",
        "Norwalk",
        "Beaumont",
        "Whittier",
        "South San Francisco",
        "Bakersfield",
        "Redding",
        "Carlsbad",
        "Watsonville",
        "Rancho Cucamonga",
        "Rosemead",
        "El Cajon",
        "Lakewood",
        "San Marcos",
        "Hemet",
        "Woodland",
        "Roseville",
        "Santa Ana",
        "Monrovia",
        "Anaheim",
        "Paramount",
        "Oxnard",
        "Santee",
        "Temecula",
        "Redondo Beach",
        "Hesperia",
        "Santa Clarita",
        "Rocklin",
        "Corona",
        "Delano",
        "La Quinta",
        "Santa Monica",
        "Vacaville",
        "Yuba City",
        "Manteca",
        "Alameda",
        "Rohnert Park",
        "Livermore",
        "Folsom",
        "Lincoln",
        "Mission Viejo",
        "Novato",
        "Palmdale",
        "Riverside",
        "Coachella",
        "Bellflower",
        "Jurupa Valley",
        "Modesto",
        "Upland",
        "Apple Valley",
        "Napa",
        "Petaluma",
        "Pasadena",
        "Inglewood",
        "Elk Grove",
        "Culver City",
        "Morgan Hill",
        "Victorville",
        "San Bernardino",
        "San Jacinto",
        "Poway",
        "Chino Hills",
        "Fontana",
        "San Francisco",
        "Montclair",
        "Placentia",
        "Milpitas",
        "Fairfield",
        "Pleasanton",
        "Montebello",
        "Colton",
        "Chico",
        "Long Beach",
        "Newport Beach",
        "San Luis Obispo",
        "Baldwin Park",
        "Diamond Bar",
        "Newark",
        "Richmond",
        "Huntington Park",
        "Encinitas",
        "Costa Mesa",
        "Laguna Niguel",
        "Stockton",
        "Hawthorne",
        "Citrus Heights",
        "Alhambra",
        "Arcadia",
        "Vallejo",
        "Madera",
        "Monterey Park",
        "Lake Elsinore",
        "Mountain View",
        "Oakland",
        "Camarillo",
        "Palm Desert",
        "Tracy",
        "Santa Cruz",
        "Sunnyvale",
        "Cathedral City",
        "Santa Rosa",
        "San Diego",
        "Palm Springs",
        "Rancho Santa Margarita",
        "Rialto",
        "Redlands",
        "Cypress",
        "Hanford",
        "Hayward",
        "National City",
        "Lodi",
        "Vista",
        "San Leandro",
        "Bell Gardens",
        "Ceres",
        "Salinas",
        "Lompoc",
        "San Mateo",
        "Santa Barbara",
        "Danville",
        "El Monte",
        "Daly City",
        "La Habra",
        "San Clemente",
        "Berkeley",
        "San Bruno",
        "Escondido",
        "Tustin",
        "Eastvale",
        "Pomona",
        "Fremont",
        "San Buenaventura (Ventura)",
        "Yorba Linda",
        "Merced",
        "Porterville",
        "Walnut Creek",
        "Orange",
        "Clovis",
        "Calexico",
        "Glendora",
        "Indio",
        "Brea",
        "Pittsburg",
        "El Centro",
        "Dublin",
        "Moreno Valley",
        "Campbell",
        "Concord",
        "Chula Vista",
        "Tulare",
        "Fountain Valley",
        "Chino",
        "Murrieta",
        "Antioch",
        "Visalia",
        "Covina",
        "Rancho Palos Verdes",
        "Westminster",
        "Buena Park",
        "Perris"
      ],
      "Minnesota" => [
        "St. Louis Park",
        "Woodbury",
        "Mankato",
        "Maple Grove",
        "Plymouth",
        "Minnetonka",
        "Apple Valley",
        "Maplewood",
        "Duluth",
        "Moorhead",
        "Bloomington",
        "Eden Prairie",
        "Lakeville",
        "Blaine",
        "Coon Rapids",
        "Edina",
        "St. Cloud",
        "Minneapolis",
        "Shakopee",
        "Rochester",
        "Brooklyn Park",
        "Burnsville",
        "Eagan"
      ],
      "Connecticut" => [
        "New Britain",
        "Bristol",
        "Bridgeport",
        "Middletown",
        "Meriden",
        "Milford",
        "Shelton",
        "New Haven",
        "Norwich",
        "Danbury",
        "Norwalk",
        "West Haven",
        "Stamford",
        "Waterbury"
      ]
    }
  end
end
