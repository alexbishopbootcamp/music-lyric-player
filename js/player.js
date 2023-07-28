// Inject spotify player script
const script = document.createElement('script');
let spotifyIFrameAPI;
script.src = "https://open.spotify.com/embed-podcast/iframe-api/v1";
script.async = true;
// Spotify documentation reccomends embedding within document body
document.body.appendChild(script);

// Exports
function playerLoadURI(){};
function playerPlay(){};
function playerTogglePlay(){};
function playerSeek(){};
function playerDestroy(){};


function playerRespawn(){
  playerDestroy();
  playerSpawn();
};

function playerSpawn(){
  if(!spotifyIFrameAPI){
    // Silenty return
    return;
  }

  const playerContainer = document.querySelector('#player-container');
  if(!playerContainer){
    console.error("No element with ID player-container found");
    return;
  }

  // create sacrificial player element
  const player = document.createElement('div');
  player.id = 'spotify-player';
  playerContainer.appendChild(player);

  const options = {
      uri: '',
      height: '80',
      width: '100%',
      // preferVideo: false, // Undocumented option I found that I don't know what does
      theme: 'dark' // Undocumented option I found to make the player dark, #282828
    };

  const callback = (EmbedController) => {
    // https://developer.spotify.com/documentation/embeds/references/iframe-api
    // Player methods
    playerLoadURI = (uri)   => EmbedController.loadUri(uri);
    playerPlay = ()         => EmbedController.play();
    playerTogglePlay = ()   => EmbedController.togglePlay();
    playerSeek = (seconds)  => EmbedController.seek(seconds);
    playerDestroy = ()      => EmbedController.destroy();

    // Player events
    EmbedController.addListener('ready', playerReady);
    EmbedController.addListener('playback_update', e => playerPlaybackUpdate(e));
    // Add back the id so we can reference it later on
    EmbedController.iframeElement.id = 'spotify-player';
  };

  spotifyIFrameAPI.createController(player, options, callback);
  player.id = 'spotify-player';
}

function playerReady(){
  console.log("Spotify player ready");
  // Start playing as soon as any track is loaded
  playerPlay();
};

function playerPlaybackUpdate(){
  // do nothing
}

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  // Store reference to IFrameAPI for later
  spotifyIFrameAPI = IFrameAPI;
  console.log("Spotify API ready");
  playerSpawn();
};