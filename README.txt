Aly Salem - Personal CV and Portfolio (Assignment 3)

Live site: see link.txt

FILES
index.html   Page structure (Home, About, Education, Experience, Skills,
             Projects, Live Data, Achievements, Contact)
styles.css   All styling, including dark mode
script.js    Interactive features (welcome message, dark mode, show/hide,
             dynamic skills, contact form validation)
api.js       Fetches data from the public APIs
widgets.js   Shows the API data on the page (loading / success / error)
images/      Profile picture

APIS USED (all free, none needs an API key)
1. Open-Meteo      - current weather for a selected city
2. DummyJSON       - random quotes with a "New quote" button
3. GitHub REST API - public repositories of a GitHub username

CONFIGURATION
To show my GitHub repositories automatically when the page opens, set my
username in widgets.js:  const GITHUB_USERNAME = "my-username";
Visitors can also type any username into the form in the Projects section.
