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
    // Show search bar
    // document.querySelector('#spotify-btn').setAttribute('hidden', '');
    // document.querySelector('#search-bar').removeAttribute('hidden');
    showLandingPage();
  } else {
    // App not authorized, propmt user to OAuth
    // document.querySelector('#spotify-btn').removeAttribute('hidden');
    // document.querySelector('#search-bar').setAttribute('hidden', '');
    showLinkingPage();
  }

  document.querySelector('#spotify-btn').addEventListener('click', function () {
    spotifyOAuth();
  });
});

async function listTracks(query) {
  const tracks = await spotifySearchTracks(query);
  for (let track of tracks.tracks.items) {
    const trackDiv = document.createElement('div');
    trackDiv.classList.add('track-search-result');
    trackDiv.textContent = track.name;
    trackDiv.style.border = '1px solid black';
    trackDiv.style.padding = '2px';
    trackDiv.style.margin = '2px';
    trackDiv.dataset.uri = track.uri;
    trackDiv.addEventListener('click', () => {
      onTrackSearchResultClick(trackDiv);
    });
    document.querySelector('#track-search-results').appendChild(trackDiv);
  }
}


function onTrackSearchResultClick(button){
  // Get track URI from button and load it
  const trackUri = button.dataset.uri;
  // Load track into player
  loadUri(trackUri);
  // Populate track information
  populateTrackInformation(trackUri);
  // Remove all track search results
  const trackSearchResults = document.querySelectorAll('.track-search-result');
  for (let trackSearchResult of trackSearchResults) {
    trackSearchResult.remove();
  }
  // Switch to main page
  showMainPage();
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
  document.querySelector('#linking-page').setAttribute('hidden', '');
  document.querySelector('#landing-page').setAttribute('hidden', '');
  document.querySelector('#main-page').removeAttribute('hidden');
}

function showLandingPage() {
  document.querySelector('#linking-page').setAttribute('hidden', '');
  document.querySelector('#main-page').setAttribute('hidden', '');
  document.querySelector('#landing-page').removeAttribute('hidden');
}

function showLinkingPage() {
  document.querySelector('#main-page').setAttribute('hidden', '');
  document.querySelector('#landing-page').setAttribute('hidden', '');
  document.querySelector('#linking-page').removeAttribute('hidden');
}

// Event listeners
document.querySelector('#search-bar').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.querySelector('#search-bar input').value;
    listTracks(query);
  });
