// =========================
// STATE MANAGEMENT
// =========================
let state = {
  shows: [],
  selectedShowId: null,
  episodes: [],
  counterEl: null,
  showSelectEl: null,
  searchInputEl: null,
  episodeSelectEl: null,
  navLinks: null,
  isLoadingShows: true,
  isLoadingEpisodes: true,
  error: null,
  cache: {
    shows: null,
    episodes: {},
  },
};

// =========================
// APP START
// =========================
async function setup() {
  makeHeader(); // persistent header

  try {
    await loadShowList();

    if (state.shows.length === 0) {
      throw new Error("No shows were loaded");
    }

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
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
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

  if (state.episodeSelectEl) {
    state.episodeSelectEl.innerHTML = "";
  }

  if (state.cache.episodes[showId]) {
    state.episodes = state.cache.episodes[showId];
    state.isLoadingEpisodes = false;
    return;
  }

  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const episodes = await response.json();

  state.cache.episodes[showId] = episodes;
  state.episodes = episodes;
  state.isLoadingEpisodes = false;
}

// =========================
// HEADER (PERSISTENT)
// =========================
function makeHeader() {
  const rootElem = document.getElementById("root");

  const headerSectionEl = document.createElement("section");
  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");

  const navLinks = document.createElement("ul");
  state.navLinks = navLinks;

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

  // SHOW SELECT (DROPDOWN LIKE SCREENSHOT)
  const showSelectEl = document.createElement("select");
  showSelectEl.disabled = true;
  state.showSelectEl = showSelectEl;

  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "Select a show...";
  showSelectEl.appendChild(defaultShowOption);

  showSelectEl.addEventListener("change", async (e) => {
    const showId = Number(e.target.value);

    if (!showId) {
      // back to full shows listing
      updateShowTitle("TV Show Explorer");
      renderShows(state.shows);
      return;
    }

    const selectedShow = state.shows.find((s) => s.id === showId);
    if (!selectedShow) return;

    updateShowTitle(selectedShow.name);
    await loadEpisodesForShow(showId);
    renderEpisodes(state.episodes);
    addBackButton();
  });

  navLinks.appendChild(showSelectEl);

  // SHOW SEARCH
  const showSearch = document.createElement("input");
  showSearch.placeholder = "Search shows...";
  showSearch.classList.add("search-bar");

  showSearch.addEventListener("input", (e) => {
    const filtered = handleShowSearch(e.target.value);
    renderShows(filtered);
  });

  navLinks.appendChild(showSearch);

  // EPISODE SELECT (JUMP TO EPISODE)
  const episodeSelectEl = document.createElement("select");
  episodeSelectEl.disabled = true;
  episodeSelectEl.classList.add("episode-jump");

  episodeSelectEl.addEventListener("change", (e) => {
    const episodeId = e.target.value;
    if (!episodeId) return;

    const target = document.getElementById(`episode-${episodeId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  state.episodeSelectEl = episodeSelectEl;
  navLinks.appendChild(episodeSelectEl);

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
// SHOW RENDERING
// =========================
function renderShows(showList) {
  const rootElem = document.getElementById("root");

  const oldContent = rootElem.querySelector(".content-section");
  if (oldContent) oldContent.remove();

  const section = document.createElement("section");
  section.classList.add("content-section", "shows-section");

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

      renderEpisodes(state.episodes);
      addBackButton();
    });

    const img = document.createElement("img");
    img.src = show.image?.medium || "";

    const info = document.createElement("p");
    info.textContent =
      `Genres: ${show.genres.join(", ")} | ` +
      `Status: ${show.status} | ` +
      `Rating: ${show.rating?.average || "N/A"} | ` +
      `Runtime: ${show.runtime} min`;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary;

    card.append(title, img, info, summary);
    section.appendChild(card);
  });

  const credit = document.getElementById("credit");
  rootElem.insertBefore(section, credit);

  // reset episode dropdown when back on shows
  populateEpisodeSelect([]);
  updateCounter(showList, state.shows);
}

// =========================
// EPISODE RENDERING
// =========================
function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const oldContent = rootElem.querySelector(".content-section");
  if (oldContent) oldContent.remove();

  const section = document.createElement("section");
  section.classList.add("content-section", "episode-section");

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.classList.add("episode-card");
    card.id = `episode-${episode.id}`;

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

  const credit = document.getElementById("credit");
  rootElem.insertBefore(section, credit);

  populateEpisodeSelect(episodeList);
  updateCounter(episodeList, state.episodes);
}

// =========================
// POPULATE EPISODE SELECT
// =========================
function populateEpisodeSelect(episodeList = state.episodes) {
  if (!state.episodeSelectEl) return;

  state.episodeSelectEl.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Jump to episode...";
  defaultOption.value = "";
  state.episodeSelectEl.appendChild(defaultOption);

  episodeList.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")} - ${ep.name}`;
    state.episodeSelectEl.appendChild(option);
  });

  state.episodeSelectEl.disabled = episodeList.length === 0;
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
    updateShowTitle("TV Show Explorer");
    renderShows(state.shows);
  });

  nav.appendChild(btn);
}

// =========================
// SEARCH HELPERS
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
  if (logo) logo.textContent = name;
}

// =========================
// SHOW SELECT POPULATION
// =========================
function populateShowSelect() {
  if (!state.showSelectEl) return;

  state.showSelectEl.innerHTML = "";

  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "Select a show...";
  state.showSelectEl.appendChild(defaultShowOption);

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
