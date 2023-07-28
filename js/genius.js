// TODO: apply hidden to genius analytics iframe as it sometimes 404s and becomes visible

// Globals and constants
var geniusAPIKey;
const CLEANREGEX = /(\(.+\)|-.+|,.+|feat\..+|\/.+)/g;
const MAXFALLBACKS = 4;
const DEBUG = true;

// Load API key first
fetch('secrets.json')
  .then(response => response.json())
  .then(secrets => {
    geniusAPIKey = secrets.genius;
    // Do any other required set up here
  }
);

function debugLog(){
  if(DEBUG){
    // Debug log with black background and green text
    console.log('%cDEBUG', 'background: black; color: lime; padding: 0px 3px', ...arguments);

  }
}

// Return the lyrics for a specific track
function geniusGetLyrics(name, artist){
  matchSong(name, artist);
}

async function matchSong(name, artist){
  // Always .toLowerCase() before comparing strings
  name = name.toLowerCase();
  artist = artist.toLowerCase();
  // Remove any extra info from the name
  const cleanName = name.replace(CLEANREGEX, '').trim();

  // Query strings for each fallback
  const queryString1 = artist + ' ' + cleanName;
  const queryString2 = cleanName;
  const queryString3 = artist + ' ' + name;
  const queryString4 = name;

  debugLog(queryString1);
  debugLog(queryString2);
  debugLog(queryString3);
  debugLog(queryString4);

  // TODO: Implement MAXFALLBACKS

  // pre-fetch all fallback searches
  const songList1 = geniusSearch(queryString1);
  const songList2 = geniusSearch(queryString2);
  const songList3 = geniusSearch(queryString3);
  const songList4 = geniusSearch(queryString4);

  // Join promises
  const songListList = await Promise.all([songList1, songList2, songList3, songList4]);
  
  // const matchedLyrics = tier1Match(songList, name, artist);
  for(let songList of songListList){
    const matchedLyrics = tier1Match(songList, cleanName, artist);
    if(matchedLyrics){
      getSong(matchedLyrics.id.toString());
      return;
    }
  }

  // TODO: Manual search fallback
  document.querySelector("#lyrics").innerHTML = "Could not match lyrics. Please select from the list";

  // Use song list from cleaned name search
  for(let geniusSong of songListList[1]){
    debugLog(geniusSong);
    const searchResult = document.querySelector('#search-results-template').cloneNode(true);
    searchResult.removeAttribute('id');
    searchResult.removeAttribute('hidden');
    searchResult.querySelector('#template-title').innerHTML = geniusSong.title;
    searchResult.querySelector('#template-artist').innerHTML = geniusSong.primary_artist.name;
    searchResult.querySelector('#template-art').src = geniusSong.song_art_image_thumbnail_url;
    searchResult.addEventListener('click', function(){
      // clear lyrics field
      document.querySelector("#lyrics").innerHTML = "";
      showLoadingSpinnerLyrics();
      getSong(geniusSong.id.toString());
    });
    document.querySelector("#lyrics").appendChild(searchResult);
  }
}

// Attempt to match using only data from the initial search
function tier1Match(songList, spotifyTitle, spotifyArtist){
  let matches = [];
  debugLog(songList);
  for(let geniusSong of songList){
    // Clean up strings
    const geniusTitle = geniusSong.title.toLowerCase();
    const geniusTitleClean = geniusSong.title.replace(CLEANREGEX, '').trim().toLowerCase();
    const geniusArtist = geniusSong.primary_artist.name.toLowerCase();

    debugLog(geniusTitleClean + ' <==> ' + spotifyTitle);

    // Match Title AND Artist
    if((geniusTitle === spotifyTitle || geniusTitleClean === spotifyTitle) && geniusArtist === spotifyArtist){
      return geniusSong;
    }

    // Match Unique Title (inside loop)
    else if(geniusTitle === spotifyTitle || geniusTitleClean === spotifyTitle){
      matches.push(geniusSong);
    }
  }

  // Match Unique Title (end of loop)
  if(matches.length === 1){
    return matches[0];
    
  // Return first match if there are multiple
  } else if(matches.length > 1 && TIER2){
    return songList[0];
  }

  // Fallback
  return false;
}

// Return a list of songs from Genius that match the search query
function geniusSearch(query) {
  const urlQuery = encodeURIComponent(query);
  const requestUrl = 'https://api.genius.com/search?q=' + urlQuery + '&access_token=' + geniusAPIKey;
  
  const songList = fetch(requestUrl, {
    method: 'GET',
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    // return map of data.response.hits[x].result
    return data.response.hits.map(hit => hit.result);
  })

  return songList;
}


function getSong(songId) {
  // debugLog(id)
  const requestUrl = 'https://api.genius.com/songs/'+ songId + '?access_token=' + geniusAPIKey;
  // debugLog(requestUrl)
  const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      return response.json();
    })

    .then(data => {
      // debugLog(data);
      var song = data.response.song.embed_content;
      let parser = new DOMParser();
      let doc = parser.parseFromString(song, "text/html");
      let scriptTag = doc.body.childNodes[2];
      var src = scriptTag.src
      const requestUrl = src;
      getLyrics(requestUrl)
      return song;
    })
    .catch(error => {
        console.error('Error:', error);
    });

    return lyric;
}


function getLyrics(requestUrl) {
  const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      return response.text();
    })
  async function displayLyrics() {
    const lyricText = await lyric;
    const regex = /(JSON\.parse.+)./g;
    const match = regex.exec(lyricText)[0].split(0, -1);
    const myScript = document.createElement('script');
    myScript.innerHTML += 'document.querySelector("#lyrics").innerHTML = (';
    myScript.innerHTML += match + ';lyricsInjected();';


    document.body.appendChild(myScript);
    // mainText.removeChild(mainText.children[1])
  }
  displayLyrics()
}

function lyricsInjected(){
  debugLog('Script Injected');
  // Cleanup left over elements from injection
  document.querySelector('.rg_embed_header').remove();
  document.querySelector('.rg_embed_footer').remove();
  document.querySelector('.rg_embed_analytics').remove();
}