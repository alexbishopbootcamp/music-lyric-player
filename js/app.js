// Entry point
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded');

  // Catch if we've just returned from spotify OAuth
  await spotifyCatchOAuthReturn();

  if(!await spotifyIsAuthorized()){
    // App not authorized, propmt user to OAuth
    document.querySelector('#spotify-btn').removeAttribute('hidden');
    document.querySelector('#search-bar').setAttribute('hidden', '');
  } else {
    // Refresh token if needed.
    // TODO: Disable search form until token is refreshed
    if(spotifyTokenIsExpired()){
      // Disable form
      spotifyRefreshToken().then(() => {
        // Enable button code here
      });
    }
    // Show search bar
    document.querySelector('#spotify-btn').setAttribute('hidden', '');
    document.querySelector('#search-bar').removeAttribute('hidden');
  }

  document.querySelector('#spotify-btn').addEventListener('click', function() {
    spotifyOAuth();
  });
});

async function listTracks(query){
  const tracks = await spotifySearchTracks(query);
  console.log(tracks)
  for(let track of tracks.tracks.items){
    const trackDiv = document.createElement('div');
    trackDiv.textContent = track.name;
    trackDiv.style.border = '1px solid black';
    trackDiv.style.padding = '2px';
    trackDiv.style.margin = '2px';
    trackDiv.addEventListener('click', () => {
      loadUri(track.uri);
    });
    document.body.appendChild(trackDiv);
  }
}

function showMainPage(){
  document.querySelector('#landing-page').setAttribute('hidden', '');
  document.querySelector('#main-page').removeAttribute('hidden');
}

function showLandingPage(){
  document.querySelector('#main-page').setAttribute('hidden', '');
  document.querySelector('#landing-page').removeAttribute('hidden');
}

// Event listeners
document.querySelector('#search-bar').addEventListener('submit', function(event) {
  event.preventDefault();
  const query = document.querySelector('#search-bar input').value;
  listTracks(query);
});