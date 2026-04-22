function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // 🔥 ADD GRID CONTAINER (important for CSS)
  const section = document.createElement("section");
  section.classList.add("episode-section");

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.classList.add("episode-card"); // 🔥 

    // ---------- TITLE (boxed header style) ----------
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    const title = document.createElement("h2");
    title.classList.add("episode-title"); // 🔥 FIX

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

  rootElem.appendChild(section);

  // ---------- CREDIT ----------
  const credit = createCredit();
  rootElem.appendChild(credit);
}

window.onload = setup;

// ---------- CREDIT FUNCTION ----------
function createCredit() {
  const credit = document.createElement("p");
  credit.innerHTML = `
    Data originally from 
    <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>
  `;
  return credit;
}
