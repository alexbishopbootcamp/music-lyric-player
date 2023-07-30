// Globals and constants
var geniusAPIKey;
const CLEANREGEX = /(\(.+\)|-.+|,.+|feat\..+|\/.+)/g;
const DEBUG = false;

// Load API key first
fetch('secrets.json')
  .then(response => response.json())
  .then(secrets => {
    geniusAPIKey = secrets.genius;
    // Do any other required set up here
  }
);

// Function to replace any curly quotes with their ascii equivalents
function replaceCurlyQuotesWithAscii(inputString) {
  const curlyQuotesRegex = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F]/g;
  const asciiQuotesMap = {
    '\u2018': "'", // Left single curly quote to apostrophe
    '\u2019': "'", // Right single curly quote to apostrophe
    '\u201A': "'", // Single low-9 quotation mark to apostrophe
    '\u201B': "'", // Single high-reversed-9 quotation mark to apostrophe
    '\u201C': '"', // Left double curly quote to double quotation mark
    '\u201D': '"', // Right double curly quote to double quotation mark
    '\u201E': '"', // Double low-9 quotation mark to double quotation mark
    '\u201F': '"', // Double high-reversed-9 quotation mark to double quotation mark
  };

  return inputString.replace(curlyQuotesRegex, (match) => asciiQuotesMap[match]);
}

// Debug logging function to make it easier to turn on and off
function debugLog(){
  if(DEBUG){
    console.log('%cDEBUG', 'background: black; color: lime; padding: 0px 3px', ...arguments);
  }
}

// Return the lyrics for a specific track in HTML form
async function geniusGetLyrics(name, artist){
  const lyrics = await matchSong(name, artist);
  // Place lyrics on the page if we get any
  if(lyrics){
    document.querySelector("#lyrics").innerHTML = lyrics;
  }
}


async function matchSong(name, artist){
  // Always .toLowerCase() before comparing strings
  name = name.toLowerCase();
  artist = artist.toLowerCase();
  // Remove any extra info from the name
  let cleanName = name.replace(CLEANREGEX, '').trim();
  // Replace curly apostrophes with normal apostrophes
  cleanName = replaceCurlyQuotesWithAscii(cleanName);

  // Query strings for each fallback
  const queryString1 = artist + ' ' + cleanName;
  const queryString2 = cleanName;
  const queryString3 = artist + ' ' + name;
  const queryString4 = name;

  debugLog(queryString1);
  debugLog(queryString2);
  debugLog(queryString3);
  debugLog(queryString4);

  // pre-fetch all fallback searches.
  // This gives us very good coverage in the case that Spotify or Genius is
  // using the wrong name for a song, or is otherwise formatted differently.
  // Incremental fallbacks was never implemented in order to speed up the
  // lyric fetching process.
  const songList1 = geniusSearch(queryString1);
  const songList2 = geniusSearch(queryString2);
  let songList3;
  let songList4;
  // Only search for the third and fourth fallbacks if they are different from the first two
  if(name != cleanName){
    songList3 = geniusSearch(queryString3);
    songList4 = geniusSearch(queryString4);
  }

  // Join promises (ie. wait for the 4 web fetches to complete).
  // This will result in a list of lists of songs.
  const songListList = await Promise.all([songList1, songList2, songList3, songList4]);
  
  // Attempt to find a clean match for each song list
  for(let songList of songListList){
    if(songList){ // Check in case we got no results
      const matchedSong = matchSpotifyToGenius(songList, cleanName, artist);
      if(matchedSong){
        return geniusIDToLyrics(matchedSong.id.toString());
      }
    }
  }

  // If execution reaches this point, no matches were found
  debugLog('No song matches found.')

  // Bail if we have no results
  if(songListList[1].length === 0){
    document.querySelector("#lyrics").innerHTML = '<p>Could not find any lyrics</p>';
    return;
  }
  
  document.querySelector("#lyrics").innerHTML = '<p>Could not match lyrics. Please select from the list</p>';

  // Use song list from cleaned name search. This consistently returns the most relevant results.
  for(let geniusSong of songListList[1]){
    debugLog(geniusSong);
    // Clone our search result template and use it to display lyric suggestions
    const searchResult = document.querySelector('#search-results-template').cloneNode(true);
    searchResult.removeAttribute('id');
    searchResult.removeAttribute('hidden');
    searchResult.querySelector('#template-title').textContent = geniusSong.title;
    searchResult.querySelector('#template-artist').textContent = geniusSong.primary_artist.name;
    searchResult.querySelector('#template-art').src = geniusSong.song_art_image_thumbnail_url;
    searchResult.dataset.geniusId = geniusSong.id.toString();
    searchResult.addEventListener('click', async function(){
      // On click, fetch the lyrics for the selected song and display them
      document.querySelector("#lyrics").innerHTML = "";
      showLoadingSpinnerLyrics();
      const lyrics = await geniusIDToLyrics(this.dataset.geniusId);
      document.querySelector("#lyrics").innerHTML = lyrics;
    });
    // Need to append child here in order to preserve the event liseners we attached
    document.querySelector("#lyrics").appendChild(searchResult);
  }

  return;
}

// Attempt to match using only data from the initial search
function matchSpotifyToGenius(songList, spotifyTitle, spotifyArtist){
  let matches = [];
  debugLog(songList);
  for(let geniusSong of songList){
    // Clean up strings
    const geniusTitle = geniusSong.title.toLowerCase();
    let geniusTitleClean = geniusSong.title.replace(CLEANREGEX, '').trim().toLowerCase();
    // Also replace any curly quotes with ascii quotes here
    geniusTitleClean = replaceCurlyQuotesWithAscii(geniusTitleClean);
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
  } else if(matches.length > 1){
    return songList[0];
  }

  // Fallback
  return false;
}

// Return a list of songs from Genius that match the search query
function geniusSearch(query) {
  // Encode URL parameter
  const urlQuery = encodeURIComponent(query);
  const requestUrl = 'https://api.genius.com/search?q=' + urlQuery + '&access_token=' + geniusAPIKey;
  
  // Fetch song list
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

// Returns the HTML lyrics for a song given its Genius ID
async function geniusIDToLyrics(songId){
  
  // The first API call of this function as been omitted due to an optimization
  // where we can just build the URL manually. This is because the embed.js URL
  // is deterministic based on the song ID.

  // const requestUrl = 'https://api.genius.com/songs/'+ songId + '?access_token=' + geniusAPIKey;
  
  // // Get song data
  // const song = await fetch(requestUrl, {
  //   method: 'GET',
  //   })
  //   .then(response => {
  //     return response.json();
  //   })
  //   .then(data => {
  //     return data.response.song;
  //   })
  //   .catch(error => {
  //       console.error('Error:', error);
  //   });

    const parser = new DOMParser();

  //   // Extract the embed.js URL from the song data
  //   const embedHTML = song.embed_content;
  //   const embed = parser.parseFromString(embedHTML, 'text/html');
  //   const embedJsURL = embed.querySelector('script').src;

    // Skip the previous request and just build the URL manually using the deterministic embed URL
    const embedJsURL = `https://genius.com/songs/${songId}/embed.js`


    // Get the embed.js file
    const embedJs = await fetch(embedJsURL, {
        method: 'GET',
      })
      .then(response => {
        debugLog(response);
        return response.text();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  
    // Attempting to manually parse the JSON string proved too difficult under
    // the (multiple) layers of escaping (I counted up to 7 or 8 backslashes
    // in a row in some places!)
    // Instead, we will just cut out the JSON string including the JSON.parse
    // and eval it in the context of this script
    // Extract the JSON string, still encased in JSON.parse, from the embed.js file
    const regex = /(JSON\.parse\('.+'\))/gm;
    const lyrics = eval(regex.exec(embedJs)[0]);

    // Parse HTML and only return the body of the embed
    const doc = parser.parseFromString(lyrics, 'text/html');
    const docBody = doc.querySelector('.rg_embed_body');
    debugLog(docBody);

    // Replace all child elements in doc with a copy of itself with only the textContent remainding
    // This is to remove extra hrefs, attributes, etc. that we don't want
    // We use a recursive function to traverse the DOM tree and make sure we get everything
    function traverse(node){
      for(let child of node.children){
        if(child.children.length > 0){
          traverse(child);
        }
        const newChild = document.createElement(child.tagName);
        newChild.innerHTML = child.innerHTML;
        debugLog(newChild);
        node.replaceChild(newChild, child);
      }
    }
    // Kick off the process
    traverse(docBody);

    return docBody.innerHTML;
}