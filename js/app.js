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
  // Clear lyrics in case user has looped back around without reloading page
  clearLyrics();
  const template = document.querySelector('#search-results-template');
  // Inject loading spinner
  showLoadingSpinnerTrackSearch();
  const tracks = await spotifySearchTracks(query);
  clearTrackSearchResults();
  for (let track of tracks.tracks.items) {
    const searchResult = template.cloneNode(true);
    searchResult.removeAttribute('id');
    searchResult.removeAttribute('hidden');
    searchResult.classList.add('track-search-result');
    searchResult.dataset.name = track.name;
    searchResult.dataset.artist = track.artists[0].name;
    searchResult.dataset.album = track.album.name;
    searchResult.dataset.date = track.album.release_date;
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
  // Extract track information from dataset
  const name = searchResult.dataset.name;
  const artist = searchResult.dataset.artist;
  const album = searchResult.dataset.album;
  const date = searchResult.dataset.date;
  const trackUri = searchResult.dataset.uri;
  // Show the spinner
  showLoadingSpinnerLyrics();
  // Fetch lyrics from Genius, providing all the info it may need to find a match
  geniusGetLyrics(name, artist, album, date, trackUri);
  // Load track into player
  playerLoadURI(trackUri);
  // Populate track information
  populateTrackInformation(trackUri);
  // Remove all track search results
  clearTrackSearchResults();
  // Switch to main page
  showMainPage();
}

function showLoadingSpinnerLyrics(){
  const spinner = document.querySelector('#spinner').cloneNode(true);
  spinner.removeAttribute('id');
  spinner.removeAttribute('hidden');
  document.querySelector('#lyrics').appendChild(spinner);
}

function showLoadingSpinnerTrackSearch(){
  const spinner = document.querySelector('#spinner').cloneNode(true);
  spinner.removeAttribute('id');
  spinner.removeAttribute('hidden');
  document.querySelector('#search-results').appendChild(spinner);
}

function clearTrackSearchResults(){
  document.querySelector('#search-results').innerHTML = '';
}

function clearLyrics(){
  document.querySelector('#lyrics').innerHTML = '';
}

async function populateTrackInformation(trackUri){
  // Get track information
  const track = await spotifyGetTrack(trackUri);
  // Populate track information
  document.querySelector('#album-art img').src = track.album.images[0].url;
  document.querySelector('#track-title').textContent = track.name;
  document.querySelector('#artist-name').textContent = track.artists[0].name;
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
  // Move search form to main page
  document.querySelector('#main-page-search').appendChild(document.querySelector('#search-bar'));
  scrollToTop();
}

function showLandingPage() {
  hideAllPages();
  document.querySelector('#landing-page').removeAttribute('hidden');
  // Move search form to landing page
  document.querySelector('#landing-page-search').appendChild(document.querySelector('#search-bar'));
  playerRespawn();
  scrollToTop();
}

function showLinkingPage() {
  hideAllPages();
  document.querySelector('#linking-page').removeAttribute('hidden');
  playerRespawn();
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
    // Always show landing page when searching
    showLandingPage();
    searchTracks(query);
  });

document.querySelector('#title-link').addEventListener('click', () => {
  showLandingPage();
})