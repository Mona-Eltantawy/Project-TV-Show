// =========================
// STATE MANAGEMENT
// =========================
let state = {
  shows: [],
  selectedShowId: null,
  episodes: [],
  searchTerm: "",
  showSearchTerm: "",
  counterEl: null,
  showSelectEl: null,
  searchInputEl: null,
  isLoadingShows: true,
  isLoadingEpisodes: true,
  error: null,
  currentView: "shows", // "shows" or "episodes"
  cache: {
    shows: null,
    episodes: {},
  },
};

// =========================
// APP START
// =========================
async function setup() {
  makePageForEpisodes([]);

  try {
    await loadShowList();

    if (state.shows.length === 0) {
      throw new Error("No shows were loaded");
    }

    state.currentView = "shows";
    renderShows(state.shows);
  } catch (error) {
    state.error = error.message;
    showError(error.message);
  }
}

// =========================
// LOAD SHOWS (CACHED)
// =========================
async function loadShowList() {
  if (state.cache.shows) {
    state.shows = state.cache.shows;
    state.isLoadingShows = false;
    populateShowSelect();
    return;
  }

  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const shows = await response.json();

  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  state.cache.shows = shows;
  state.shows = shows;
  state.isLoadingShows = false;

  populateShowSelect();
}

// =========================
// LOAD EPISODES (CACHED)
// =========================
async function loadEpisodesForShow(showId) {
  state.isLoadingEpisodes = true;
  state.error = null;

  if (state.cache.episodes[showId]) {
    state.episodes = state.cache.episodes[showId];
    state.isLoadingEpisodes = false;
    return;
  }

  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`,
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const episodes = await response.json();

  state.cache.episodes[showId] = episodes;
  state.episodes = episodes;
  state.isLoadingEpisodes = false;
}

// =========================
// SHOW VIEW RENDERING
// =========================
function renderShows(showList) {
  const rootElem = document.getElementById("root");
  const credit = document.getElementById("credit");

  // clear old content
  const oldShows = rootElem.querySelector(".shows-section");
  if (oldShows) oldShows.remove();

  const oldEpisodes = rootElem.querySelector(".episode-section");
  if (oldEpisodes) oldEpisodes.remove();

  const section = document.createElement("section");
  section.classList.add("shows-section");

  showList.forEach((show) => {
    const card = document.createElement("article");
    card.classList.add("show-card");

    const title = document.createElement("h2");
    title.textContent = show.name;
    title.style.cursor = "pointer";

    title.addEventListener("click", async () => {
      state.selectedShowId = show.id;

      updateShowTitle(show.name);

      await loadEpisodesForShow(show.id);

      state.currentView = "episodes";
      renderEpisodes(state.episodes);
      addBackButton();
    });

    const img = document.createElement("img");
    img.src = show.image?.medium || "";

    const info = document.createElement("p");
    info.textContent = `
      Genres: ${show.genres.join(", ")} |
      Status: ${show.status} |
      Rating: ${show.rating?.average || "N/A"} |
      Runtime: ${show.runtime} min
    `;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary;

    card.append(title, img, info, summary);
    section.appendChild(card);
  });

  rootElem.insertBefore(section, credit);
}

// =========================
// BACK BUTTON
// =========================
function addBackButton() {
  if (document.getElementById("back-btn")) return;

  const nav = document.querySelector(".nav-bar");

  const btn = document.createElement("button");
  btn.id = "back-btn";
  btn.textContent = "← Back to Shows";

  btn.addEventListener("click", () => {
    state.currentView = "shows";
    renderShows(state.shows);
  });

  nav.appendChild(btn);
}

// =========================
// EPISODE SEARCH
// =========================
function handleSearchInput(query, episodeList) {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) return episodeList;

  return episodeList.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = episode.summary ? episode.summary.toLowerCase() : "";

    return name.includes(searchTerm) || summary.includes(searchTerm);
  });
}

// =========================
// SHOW SEARCH
// =========================
function handleShowSearch(query) {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) return state.shows;

  return state.shows.filter((show) => {
    return (
      show.name.toLowerCase().includes(searchTerm) ||
      show.genres.join(" ").toLowerCase().includes(searchTerm) ||
      (show.summary || "").toLowerCase().includes(searchTerm)
    );
  });
}

// =========================
// PAGE BUILDER (HEADER)
// =========================
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  const headerSectionEl = document.createElement("section");
  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");

  const navLinks = document.createElement("ul");

  // LOGO
  const logo = document.createElement("li");
  logo.textContent = "TV Show Explorer";
  logo.classList.add("logo");
  navLinks.appendChild(logo);

  // COUNTER
  const counter = document.createElement("li");
  counter.textContent = "";
  counter.classList.add("counter");
  state.counterEl = counter;
  navLinks.appendChild(counter);

  // SHOW SELECT (optional legacy)
  const showSelectEl = document.createElement("select");
  showSelectEl.disabled = true;
  state.showSelectEl = showSelectEl;

  navLinks.appendChild(showSelectEl);

  // SHOW SEARCH (NEW REQUIREMENT)
  const showSearch = document.createElement("input");
  showSearch.placeholder = "Search shows...";
  showSearch.classList.add("search-bar");

  showSearch.addEventListener("input", (e) => {
    const filtered = handleShowSearch(e.target.value);
    renderShows(filtered);
  });

  navLinks.appendChild(showSearch);

  // EPISODE SEARCH
  const episodeSearch = document.createElement("input");
  episodeSearch.type = "search";
  episodeSearch.placeholder = "Search episodes...";
  episodeSearch.classList.add("search-bar");

  state.searchInputEl = episodeSearch;

  episodeSearch.addEventListener("input", (e) => {
    const filtered = handleSearchInput(e.target.value, state.episodes);
    renderEpisodes(filtered);
  });

  navLinks.appendChild(episodeSearch);

  navBarEl.appendChild(navLinks);
  headerSectionEl.appendChild(navBarEl);

  rootElem.appendChild(headerSectionEl);

  const credit = document.createElement("p");
  credit.id = "credit";
  credit.innerHTML = `Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(credit);
}

// =========================
// EPISODE RENDERING
// =========================
function renderEpisodes(episodeList) {
  if (state.currentView !== "episodes") return;

  const rootElem = document.getElementById("root");
  const credit = document.getElementById("credit");

  const old = rootElem.querySelector(".episode-section");
  if (old) old.remove();

  const section = document.createElement("section");
  section.classList.add("episode-section");

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.classList.add("episode-card");

    const title = document.createElement("h2");

    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    title.textContent = `${episode.name} - S${season}E${number}`;

    const img = document.createElement("img");
    img.src = episode.image?.medium || "";

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary || "";

    card.append(title, img, summary);
    section.appendChild(card);
  });

  rootElem.insertBefore(section, credit);

  updateCounter(episodeList, state.episodes);
}

// =========================
// COUNTER
// =========================
function updateCounter(filtered, all) {
  if (state.counterEl) {
    state.counterEl.textContent = `Showing ${filtered.length} of ${all.length}`;
  }
}

// =========================
// TITLE UPDATE
// =========================
function updateShowTitle(name) {
  const logo = document.querySelector(".logo");
  if (logo) logo.textContent = `${name} Episodes`;
}

// =========================
// SHOW SELECT POPULATION
// =========================
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
}

// =========================
// ERROR HANDLING
// =========================
function showError(message) {
  const rootElem = document.getElementById("root");

  const error = document.createElement("div");
  error.id = "error-message";
  error.textContent = message;

  rootElem.appendChild(error);
}

window.onload = setup;
