function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("section");

    // Title
    const title = document.createElement("h2");
    title.textContent = `${episode.name} (${episode.season}x${episode.number})`;

    // Image
    const image = document.createElement("img");
    image.src = episode.image.medium;

    // Summary
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    // Append elements
    card.append(title, image, summary);
    rootElem.appendChild(card);
  });
}

// Combine season number and episode number into an episode code:
// Each part should be zero-padded to two digits.
// Example: S02E07 would be the code for the 7th episode of the 2nd season. S2E7 would be incorrect.
// Your page should state somewhere that the data has (originally) come from TVMaze.com, and link back to that site (or the specific episode on that site). See tvmaze.com/api#licensing.
// Screenshot of minimal vers

window.onload = setup;
