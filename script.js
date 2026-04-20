//State Management
let state = {
  episodes: [],
  searchTerm: "",
  selectedEpisode: "",
  counterEl: null,
};
let episodesCache = null;
const getAllEpisodes = async () => {
  if (episodesCache) return episodesCache;
  const response = await fetch("https://api.tvmaze.com/shows");
  const data = await response.json();
  episodesCache = data;
  return data;
};
async function setup() {
  const allEpisodes = await getAllEpisodes();
  state.episodes = allEpisodes;
  makePageForEpisodes(state.episodes);
}

function handleSearchInput(query, episodeList, selectedEpisode) {
  const searchTerm = query.trim().toLowerCase();

  return episodeList.filter((episode) => {
  const name = episode.name.toLowerCase();
  const summary = episode.summary ? episode.summary.toLowerCase() : "";

  const matchesSearch =
  searchTerm === "" ||
  name.includes(searchTerm) ||
  summary.includes(searchTerm);

  const matchesSelect =
  selectedEpisode === "" || episode.id.toString() === selectedEpisode;

  return matchesSearch && matchesSelect;
  });
}
function updateViewOnFilter() {
  const filteredEpisodes = handleSearchInput(
    state.searchTerm,
    state.episodes,
    state.selectedEpisode,
  );
  renderEpisodes(filteredEpisodes);
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
  const searchEl = document.createElement("li");
  const searchBoxEl = document.createElement("input");
  searchEl.appendChild(searchBoxEl);
  searchBoxEl.type = "search";
  searchBoxEl.placeholder = "Search episodes...";
  searchBoxEl.classList.add("search-bar");
  navLinks.appendChild(searchBoxEl);

  //storing searchbox input value in state object
  searchBoxEl.value = state.searchTerm;
  searchBoxEl.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    updateViewOnFilter();
  });

  const selectEl = document.createElement("li");
  const selectBoxEl = document.createElement("select");
  selectEl.appendChild(selectBoxEl);
  selectEl.classList.add("select-box");
  navLinks.appendChild(selectEl);

  const displayOption = async () => {
    const options = await getAllEpisodes();

    // sort alphabetically
    options.sort((a, b) => a.name.localeCompare(b.name));

    // default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "All episodes";
    selectBoxEl.appendChild(defaultOption);

    for (const option of options) {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.textContent = option.name;
      selectBoxEl.appendChild(newOption);
    }
  };

  displayOption();
  selectBoxEl.addEventListener("change", (event) => {
    state.selectedEpisode = event.target.value;
    updateViewOnFilter();
  });

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

//   ## Adding new functionality

// Level 400 is about expanding beyond one TV show.

// Until now, your site has only showed information about the episode of one TV show.

// But TVmaze has information about lots of TV shows, all in the same format.

// We want to display any of them.

// ### Requirements

// 1. Add a `select` element to your page so the user can choose a show.
// 2. When the user first loads the page, make a `fetch` request to https://api.tvmaze.com/shows ([documentation](https://www.tvmaze.com/api#show-index)) to get a list of available shows, and add an entry to the drop-down per show.
// 3. When a user selects a show, display the episodes for that show, just like the earlier levels of this project.

//   You will need to perform a `fetch` to get the episode list.
// 4. Make sure that your search and episode selector controls still work correctly when you change shows.
// 5. Your select must list shows in alphabetical order, case-insensitive.
// 6. During one user's visit to your website, you should never fetch any URL more than once.
