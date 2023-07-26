// Entry point
document.addEventListener('DOMContentLoaded', async function () {
  console.log('DOM loaded');

  await spotifyCatchOAuthReturn()
    .then((result) => {
      return;
    })
    .catch((error) => {
      if (error === 'access_denied') {
        // User denied access
      } else {
        // Other error
        console.error(error);
      }
      return;
    });

  if (await spotifyIsAuthorized()) {
    // Refresh token if needed.
    // TODO: Disable search form until token is refreshed
    if (spotifyTokenIsExpired()) {
      // Disable form
      spotifyRefreshToken().then(() => {
        // Enable button code here
      });
    }
    showLandingPage();
  } else {
    showLinkingPage();
  }

  document.querySelector('#spotify-btn').addEventListener('click', function () {
    spotifyOAuth();
  });
});

async function searchTracks(query) {
  const template = document.querySelector('#search-results-template');
  const tracks = await spotifySearchTracks(query);
  clearTrackSearchResults();
  for (let track of tracks.tracks.items) {
    const searchResult = template.cloneNode(true);
    searchResult.removeAttribute('id');
    searchResult.removeAttribute('hidden');
    searchResult.classList.add('track-search-result');
    searchResult.dataset.uri = track.uri;
    searchResult.querySelector('#template-title').textContent = track.name;
    searchResult.querySelector('#template-artist').textContent = track.artists[0].name;
    searchResult.querySelector('#template-art').src = track.album.images[2].url;
    searchResult.addEventListener('click', () => {
      onTrackSearchResultClick(searchResult);
    });
    document.querySelector('#search-results').appendChild(searchResult);
  }
}

function onTrackSearchResultClick(searchResult){
  // Get track URI from button and load it
  const trackUri = searchResult.dataset.uri;
  // Load track into player
  playerLoadURI(trackUri);
  // Populate track information
  populateTrackInformation(trackUri);
  // Remove all track search results
  clearTrackSearchResults();
  // Switch to main page
  showMainPage();
}

function clearTrackSearchResults(){
  const trackSearchResults = document.querySelectorAll('.track-search-result');
  for (let trackSearchResult of trackSearchResults) {
    trackSearchResult.remove();
  }
}

async function populateTrackInformation(trackUri){
  // Get track information
  const track = await spotifyGetTrack(trackUri);
  // Populate track information
  document.querySelector('#album-art img').src = track.album.images[0].url;
  document.querySelector('#track-title').textContent = track.name;
  //document.querySelector('#artist-name').textContent = track.artists[0].name;
  document.querySelector('#album-name').textContent = track.album.name;
  document.querySelector('#release-year').textContent = track.album.release_date.slice(0, 4);
  document.querySelector('#song-length').textContent = msToTime(track.duration_ms);
}

// Convert MS into a track duration
function msToTime(duration) {
  // Calculate seconds, minutes and hours and add leading zeroes
  const seconds = parseInt((duration / 1000) % 60);
  secondsStr = seconds < 10 ? `0${seconds}` : seconds;
  const minutes = parseInt((duration / (1000 * 60)) % 60);
  minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const hours = parseInt((duration / (1000 * 60 * 60)));
  // Omit hours if song is less than an hour
  const hoursStr = hours > 0 ? hours + ":" : "";
  return `${hoursStr}${minutesStr}:${secondsStr}`;
}

function showMainPage() {
  hideAllPages();
  document.querySelector('#main-page').removeAttribute('hidden');
  scrollToTop();
}

function showLandingPage() {
  playerRespawn();
  hideAllPages();
  document.querySelector('#landing-page').removeAttribute('hidden');
  scrollToTop();
}

function showLinkingPage() {
  playerRespawn();
  hideAllPages();
  document.querySelector('#linking-page').removeAttribute('hidden');
  scrollToTop();
}

function hideAllPages(){
  document.querySelector('#main-page').setAttribute('hidden', '');
  document.querySelector('#landing-page').setAttribute('hidden', '');
  document.querySelector('#linking-page').setAttribute('hidden', '');
}

function scrollToTop(){
  // wait for page to redraw then scroll to top
  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
}

// Event listeners
document.querySelector('#search-bar').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.querySelector('#search-bar input').value;
    searchTracks(query);
  });

  document.querySelector('#title-link').addEventListener('click', () => {
    showLandingPage();
  })