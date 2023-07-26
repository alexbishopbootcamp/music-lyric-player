// Inject spotify player script
const script = document.createElement('script');
script.src = "https://open.spotify.com/embed-podcast/iframe-api/v1";
script.async = true;
// Spotify documentation reccomends embedding within document body
document.body.appendChild(script);

// Exports
function playerLoadTrack(){};
function playerLoadURI(){};
function playerPlay(){};
function playerTogglePlay(){};
function playerSeek(){};
function playerDestroy(){};

function ready(){
  console.log("Spotify player ready");
  // Start playing as soon as any track is loaded
  playerPlay();
};

function playback_update(){
  // do nothing
}

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  console.log("Spotify API ready");
  let player = document.getElementById('spotify-player');
  if(!player){
    console.log("No element with ID spotify-player found");
    return;
  }
  let options = {
      uri: 'spotify:track:3z8h0TU7ReDPLIbEnYhWZb',
      height: '80',
      width: '100%',
      // preferVideo: false, // Undocumented option I found that I don't know what does
      theme: 'dark' // Undocumented option I found to make the player dark, #282828
    };
  let callback = (EmbedController) => {
    // https://developer.spotify.com/documentation/embeds/references/iframe-api
    // Player methods
    playerLoadURI = (uri)   => EmbedController.loadUri(uri);
    playerPlay = ()         => EmbedController.play();
    playerTogglePlay = ()   => EmbedController.togglePlay();
    playerSeek = (seconds)  => EmbedController.seek(seconds);
    playerDestroy = ()      => EmbedController.destroy();

    // Player events
    EmbedController.addListener('ready', ready);
    EmbedController.addListener('playback_update', e => playback_update(e));
    // Add back the id so we can reference it later on
    EmbedController.iframeElement.id = 'spotify-player';
  };
  IFrameAPI.createController(player, options, callback);
  player.id = 'spotify-player';
};