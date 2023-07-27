// TODO: apply hidden to genius analytics iframe as it sometimes 404s and becomes visible

// Globals and constants
var geniusAPIKey;
const CLEANREGEX = /(\(.+\)|-.+|,.+|feat\..+|\/.+)/g;
const TIER2 = true;
const MAXFALLBACKS = 4;

// Load API key first
fetch('secrets.json')
  .then(response => response.json())
  .then(secrets => {
    geniusAPIKey = secrets.genius;
    // Do any other required set up here
  }
);

// High confidence filters:
// (T1) Song name and artist name match
// (T2) Spotify URI matches

// Useful data included in the Search API response

// artist_names: "King Gizzard & The Lizard Wizard"
// full_title: "Robot Stop by King Gizzard & The Lizard Wizard"
// lyrics_state: "complete"
// primary_artist: {name: "King Gizzard & The Lizard Wizard"}
// release_date_components: {day: 29, month: 4, year: 2016}
// release_date_for_display: "April 29, 2016" 
// release_date_with_abbreviated_month_for_display: "Apr. 29, 2016"
// stats: {hot: false, pageviews: 108390, unreviewed_annotations: 19}
// title: "Robot Stop"
// title_with_featured: "Robot Stop"


// Matching order:
// Tier 1 High, Tier 1 Low, Tier 2


// Return the lyrics for a specific track
function geniusGetLyrics(name, artist, album, date, trackUri){
  // getSongDetails(artist + ' ' + name);
  matchSong(name, artist, album, date, trackUri);
}

async function matchSong(name, artist, album, date, trackUri){
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

  // console.log(queryString1);
  // console.log(queryString2);
  // console.log(queryString3);
  // console.log(queryString4);

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

  document.querySelector("#lyrics").innerHTML = "No lyrics found";
  
}

// Attempt to match using only data from the initial search
function tier1Match(songList, spotifyTitle, spotifyArtist){
  let matches = [];
  // console.log(songList);
  for(let geniusSong of songList){
    // Clean up strings
    const geniusTitle = geniusSong.title.toLowerCase();
    const geniusTitleClean = geniusSong.title.replace(CLEANREGEX, '').trim().toLowerCase();
    const geniusArtist = geniusSong.primary_artist.name.toLowerCase();

    // console.log(geniusTitleClean + ' <==> ' + spotifyTitle);

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
    
  // Proceed to tier 2 matching
  } else if(matches.length > 1 && TIER2){
    return tier2Match(matches, spotifyTitle, spotifyArtist);
  }

  // Fallback
  return false;
}

function tier2Match(songList, spotifyTitle, spotifyArtist){
  // console.log('@tier2Match');
  // Just return first result until function is implemented
  return songList[0];
}

function geniusSearch(geniusToSearch) {
  const urlQuery = encodeURIComponent(geniusToSearch);
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
    
    console.log(data);
    var song = data.response.hits[0].result
    var songId = song.id.toString();
    getSong(songId);
    // var title = song.full_title
    // var lCaseTitle = title.toLowerCase()
    // var splitlCaseTitle = lCaseTitle.split(' by')[0]
    // var lCasetoSearch = geniusToSearch.toLowerCase()
    // // console.log(splitlCaseTitle);

    // if (splitlCaseTitle === lCasetoSearch) {
    //   getSong(songId)
    //   // console.log(songId)
    // } else {
    //   console.log("not same")
    // }
  })

  return songList;
}


function getSong(songId) {
  // console.log(id)
  const requestUrl = 'https://api.genius.com/songs/'+ songId + '?access_token=' + geniusAPIKey;
  // console.log(requestUrl)
  const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      return response.json();
    })

    .then(data => {
      // console.log(data);
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
    myScript.innerHTML += match;
    document.body.appendChild(myScript);
    // mainText.removeChild(mainText.children[1])
  }
  displayLyrics()
}

