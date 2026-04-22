//State Management
let state = {
  shows: [],
  selectedShowId: null,
  episodes: [],
  searchTerm: "",
  counterEl: null,
  showSelectEl: null,
  searchInputEl: null,
  isLoadingShows: true,
  isLoadingEpisodes: true,
  error: null,
  cache: {
    shows: null,
    episodes: {},
  },
};

async function setup() {
  makePageForEpisodes([]);

  try {
    await loadShowList();
    if (state.shows.length === 0) {
      throw new Error("No shows were loaded");
    }

    const firstShow = state.shows[0];
    state.selectedShowId = firstShow.id;
    updateShowTitle(firstShow.name);
    await loadEpisodesForShow(firstShow.id);
  } catch (error) {
    state.isLoadingShows = false;
    state.isLoadingEpisodes = false;
    state.error = error.message;
    showError(error.message);
  }
}

async function loadShowList() {
  if (state.cache.shows) {
    state.shows = state.cache.shows;
    state.isLoadingShows = false;
    populateShowSelect();
    return;
  }

  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const shows = await response.json();
  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  state.cache.shows = shows;
  state.shows = shows;
  state.isLoadingShows = false;
  populateShowSelect();
}

async function loadEpisodesForShow(showId) {
  state.isLoadingEpisodes = true;
  state.error = null;
  renderEpisodes([]);

  if (state.cache.episodes[showId]) {
    state.episodes = state.cache.episodes[showId];
    state.isLoadingEpisodes = false;
    renderEpisodes(state.episodes);
    return;
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const episodes = await response.json();
    state.cache.episodes[showId] = episodes;
    state.episodes = episodes;
    state.isLoadingEpisodes = false;
    renderEpisodes(state.episodes);
  } catch (error) {
    state.isLoadingEpisodes = false;
    throw error;
  }
}

function updateShowTitle(name) {
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.textContent = `${name} Episodes`;
  }
}

function populateShowSelect() {
  if (!state.showSelectEl) return;
  state.showSelectEl.innerHTML = "";

  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    state.showSelectEl.appendChild(option);
  });

  state.showSelectEl.disabled = false;
  if (state.selectedShowId) {
    state.showSelectEl.value = state.selectedShowId;
  }
}

// Function to display error messages to the user
function showError(message) {
  const rootElem = document.getElementById("root");
  const errorElement = document.createElement("div");
  errorElement.id = "error-message";
  errorElement.style.cssText = `
    background-color: #8b3a3a;
    color: #ffffff;
    padding: 20px;
    margin: 20px;
    border-radius: 8px;
    border-left: 4px solid #d63031;
    font-size: 16px;
  `;
  errorElement.textContent = `Error loading episodes: ${message}`;
  const credit = document.getElementById("credit");
  if (credit) {
    rootElem.insertBefore(errorElement, credit);
  } else {
    rootElem.appendChild(errorElement);
  }
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
  logo.textContent = "TV Show Eplorer";
  logo.classList.add("logo");
  navLinks.appendChild(logo);

  const counter = document.createElement("li");
  counter.textContent = "counter place-holder";
  counter.classList.add("counter");
  navLinks.appendChild(counter);
  state.counterEl = counter;

  const showSelectEl = document.createElement("select");
  showSelectEl.id = "show-select";
  showSelectEl.classList.add("show-select");
  showSelectEl.disabled = true;
  showSelectEl.innerHTML = "<option>Loading shows...</option>";
  showSelectEl.addEventListener("change", async (event) => {
    const showId = Number(event.target.value);
    if (!showId || showId === state.selectedShowId) return;

    state.selectedShowId = showId;
    state.searchTerm = "";
    if (state.searchInputEl) {
      state.searchInputEl.value = "";
    }

    const selectedShow = state.shows.find((show) => show.id === showId);
    if (selectedShow) {
      updateShowTitle(selectedShow.name);
    }

    try {
      await loadEpisodesForShow(showId);
    } catch (error) {
      state.error = error.message;
      showError(error.message);
    }
  });

  const showSelectItem = document.createElement("li");
  showSelectItem.appendChild(showSelectEl);
  navLinks.appendChild(showSelectItem);
  state.showSelectEl = showSelectEl;

  const searchEl = document.createElement("li");
  searchEl.classList.add("search-item");
  const searchBoxEl = document.createElement("input");
  searchEl.appendChild(searchBoxEl);
  searchBoxEl.type = "search";
  searchBoxEl.placeholder = "Search episodes...";
  searchBoxEl.classList.add("search-bar");
  navLinks.appendChild(searchEl);

  state.searchInputEl = searchBoxEl;
  searchBoxEl.value = state.searchTerm;

  searchBoxEl.addEventListener("input", (event) => {
    const query = event.target.value;
    state.searchTerm = query;
    const filteredEpisodes = handleSearchInput(query, state.episodes);
    renderEpisodes(filteredEpisodes);
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
  const oldSection = rootElem.querySelector(".episode-section");
  if (oldSection) oldSection.remove();
  const oldLoading = document.getElementById("loading-message");
  if (oldLoading) oldLoading.remove();
  const oldError = rootElem.querySelector("#error-message");
  if (oldError) oldError.remove();

  // Show loading message if data is still being fetched
  if (state.isLoadingEpisodes) {
    const loadingElement = document.createElement("div");
    loadingElement.id = "loading-message";
    loadingElement.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      color: #b0acac;
      font-size: 18px;
    `;
    loadingElement.textContent = "Loading episodes...";
    rootElem.insertBefore(loadingElement, credit);
    return;
  }

  if (state.error) {
    return;
  }

  // Show message if no episodes available
  if (episodeList.length === 0 && !state.isLoadingEpisodes && !state.error) {
    const noDataElement = document.createElement("div");
    noDataElement.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      color: #b0acac;
      font-size: 18px;
    `;
    noDataElement.textContent = "No episodes found";
    rootElem.insertBefore(noDataElement, credit);
    return;
  }

  // 🔥 ADD GRID CONTAINER (important for CSS)
  const section = document.createElement("section");
  section.classList.add("episode-section");

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.classList.add("episode-card");

    // ---------- TITLE (boxed header style) ----------
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    const title = document.createElement("h2");
    title.classList.add("episode-title");
    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.textContent = `${episode.name} - ${episodeCode}`;

    title.appendChild(link);

    // ---------- IMAGE ----------
    const image = document.createElement("img");
    image.src = episode.image?.medium || "";
    image.alt = episode.name;

    // ---------- CONTENT WRAPPER ----------
    const content = document.createElement("div");
    content.classList.add("episode-content");

    const details = document.createElement("p");
    details.textContent = `Season ${episode.season}, Episode ${episode.number}`;

    const summary = document.createElement("p");
    summary.classList.add("episode-summary");
    summary.innerHTML = episode.summary;

    content.append(details, summary);

    // ---------- BUILD CARD ----------
    card.append(title, image, content);
    section.appendChild(card);
  });
  rootElem.insertBefore(section, credit);
  updateCounter(episodeList, state.episodes);
}

window.onload = setup;
