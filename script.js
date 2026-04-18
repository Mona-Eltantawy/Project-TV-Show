//State Management
let state = {
  episodes: [],
  searchTerm: "",
};
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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

  //SearchBox element appended as a child of header element
  const searchBoxEl = document.createElement("input");
  searchBoxEl.type = "search";
  searchBoxEl.placeholder = "Search episodes...";
  headerSectionEl.appendChild(searchBoxEl);

  //storing searchbox input value in state object
   searchBoxEl.value = state.searchTerm;

  //An event listener to to capture search event
   searchBoxEl.addEventListener("input", (event) => {
   const query = event.target.value;
   state.searchTerm = query;
   const filteredEpisodes = handleSearchInput(query, episodes);
   makePageForEpisodes(filteredEpisodes);
  });
  rootElem.appendChild(searchBoxEl);

  episodeList.forEach((episode) => {
    const card = document.createElement("section");

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
    rootElem.appendChild(card);
  });

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
  // credit
  const credit = document.createElement("p");
  credit.innerHTML = `
    Data originally from 
    <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>
  `;
  rootElem.appendChild(credit);
}
window.onload = setup;
