//State Management
let state = {
  episodes: [],
  searchTerm: "",
  counterEl: null,
};
function setup() {
  const allEpisodes = getAllEpisodes();
  state.episodes = allEpisodes;
  makePageForEpisodes(state.episodes);
}
  //Function to filter Episode
  function handleSearchInput(query, episodeList) {
    const searchTerm = query.trim().toLowerCase();
    if (searchTerm === "") {
      return episodeList;
    }

    return episodeList.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = episode.summary ? episode.summary.toLowerCase() : "";
      return name.includes(searchTerm) || summary.includes(searchTerm);
    });
  }
  
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";
  //A header Element to contain searchbox element and a navigation bar for future navigation links
  const headerSectionEl = document.createElement("section");
  headerSectionEl.classList.add("header-section");
  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");
  headerSectionEl.appendChild(navBarEl);

  const navLinks = document.createElement("ul");
  const logo = document.createElement("li");
  logo.textContent = "Game of Thrones TV Episodes";
  logo.classList.add("logo");
  navLinks.appendChild(logo);

  const counter = document.createElement("li");
  counter.textContent = "counter place-holder";
  counter.classList.add("counter");
  navLinks.appendChild(counter);
  state.counterEl = counter;

  //SearchBox element appended as a child of header element
  const searchEl = document.createElement("li")
  const searchBoxEl = document.createElement("input");
  searchEl.appendChild(searchBoxEl);
  searchBoxEl.type = "search";
  searchBoxEl.placeholder = "Search episodes...";
  searchBoxEl.classList.add("search-bar");
  navLinks.appendChild(searchBoxEl);

  //storing searchbox input value in state object
  searchBoxEl.value = state.searchTerm;

  //An event listener to to capture search event
  searchBoxEl.addEventListener("input", (event) => {
    const query = event.target.value;
    state.searchTerm = query;
    const filteredEpisodes = handleSearchInput(query, state.episodes);
    renderEpisodes(filteredEpisodes);
  });

  const selectEl = document.createElement("li");
  const selectBoxEl = document.createElement("select");
  selectEl.appendChild(selectBoxEl);
  selectEl.classList.add("select-box");
  navLinks.appendChild(selectEl)
  
  navBarEl.appendChild(navLinks);

  rootElem.appendChild(headerSectionEl);

  // credit
  const credit = document.createElement("p");
  credit.id = "credit";
  credit.innerHTML = `
    Data originally from 
    <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>
  `;
  rootElem.appendChild(credit);
  renderEpisodes(episodeList);
}

//Displayed episode counter
function updateCounter(filteredEpisodes, allEpisodes) {
  state.counterEl.textContent = `Showing ${filteredEpisodes.length} of ${allEpisodes.length} episodes`;
}
function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const credit = document.getElementById("credit");
  // Remove old episode cards for re-rendering
  const oldCards = rootElem.querySelectorAll(".episode-card");
  oldCards.forEach((card) => card.remove());

  episodeList.forEach((episode) => {
    const card = document.createElement("section");
    card.classList.add("episode-card"); 

    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.textContent = `${episode.name} (${episodeCode})`;

    title.appendChild(link);

    const details = document.createElement("p");
    details.textContent = `Season ${episode.season}, Episode ${episode.number}`;

    const image = document.createElement("img");
    image.src = episode.image?.medium || "";

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    card.append(title, details, image, summary);
    rootElem.insertBefore(card, credit);
  });
  updateCounter(episodeList, state.episodes);
}

window.onload = setup;


