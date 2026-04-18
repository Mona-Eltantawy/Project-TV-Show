function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

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

  // credit
  const credit = document.createElement("p");
  credit.innerHTML = `
    Data originally from 
    <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>
  `;
  rootElem.appendChild(credit);
}
window.onload = setup;