// Inject spotify player script
const script = document.createElement('script');
script.src = "https://open.spotify.com/embed-podcast/iframe-api/v1";
script.async = true;
// Spotify documentation reccomends embedding within document body
document.body.appendChild(script);

// Exports
function loadTrack(){};
function loadUri(){};
function play(){};
function togglePlay(){};
function seek(){};
function destroy(){};

// Generate some buttons to demo the player API
const playButton = document.createElement('button');
playButton.innerHTML = "Play";
playButton.onclick = () => play();
document.body.appendChild(playButton);

const togglePlayButton = document.createElement('button');
togglePlayButton.innerHTML = "Toggle Play";
togglePlayButton.onclick = () => togglePlay();
document.body.appendChild(togglePlayButton);

const destroyButton = document.createElement('button');
destroyButton.innerHTML = "Destroy";
destroyButton.onclick = () => destroy();
document.body.appendChild(destroyButton);

const seekButton = document.createElement('button');
seekButton.innerHTML = "Seek to 30s";
seekButton.onclick = () => seek(30);
document.body.appendChild(seekButton);

const trackSelector = document.createElement('p');
trackSelector.innerHTML = "Select a track to load";
document.body.appendChild(trackSelector);

const BohemianRhapsody = document.createElement('button');
BohemianRhapsody.innerHTML = "Bohemian Rhapsody";
BohemianRhapsody.onclick = () => loadUri('spotify:track:3z8h0TU7ReDPLIbEnYhWZb');
document.body.appendChild(BohemianRhapsody);

const UnderTheBridge = document.createElement('button');
UnderTheBridge.innerHTML = "Under the Bridge";
UnderTheBridge.onclick = () => loadUri('spotify:track:3d9DChrdc6BOeFsbrZ3Is0');
document.body.appendChild(UnderTheBridge);

const OneStepCloser = document.createElement('button');
OneStepCloser.innerHTML = "One Step Closer";
OneStepCloser.onclick = () => loadUri('spotify:track:3K4HG9evC7dg3N0R9cYqk4');
document.body.appendChild(OneStepCloser);
 

function ready(){
  console.log("Spotify player ready");
};
function playback_update(){
  console.log("Playback update");
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
    };
  let callback = (EmbedController) => {
    // https://developer.spotify.com/documentation/embeds/references/iframe-api
    // Player methods
    loadUri = (uri)   => EmbedController.loadUri(uri);
    play = ()         => EmbedController.play();
    togglePlay = ()   => EmbedController.togglePlay();
    seek = (seconds)  => EmbedController.seek(seconds);
    destroy = ()      => EmbedController.destroy();

    // Player events
    EmbedController.addListener('ready', ready);
    EmbedController.addListener('playback_update', e => playback_update(e));
  
  };
  IFrameAPI.createController(player, options, callback);
};
