// TODO: apply hidden to genius analytics iframe as it sometimes 404s and becomes visible

// Globals
var geniusAPIKey;

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


// Return the lyrics for a specific track
function geniusGetLyrics(name, artist, album, date, trackUri){
  // getSongDetails(artist + ' ' + name);
  matchSong(name, artist, album, date, trackUri);
}

async function matchSong(name, artist, album, date, trackUri){
  // Filtering step 1: Clean title. Remove everything after the first parenthesis, hyphen, feat., etc.
  const cleanNameRegex = /(\(.+\)|-.+|,.+|feat\..+|\/.+)/g;
  const cleanName = name.replace(cleanNameRegex, '').trim();
  // const queryString = artist + ' ' + cleanName;
  const queryString = cleanName;
  console.log(queryString);
  // Get stage 1 song list
  const songList = await geniusSearch(queryString);
  console.log(tier1Match(songList, name, artist));
  
}

// Attempt to match using only data from the initial search
function tier1Match(songList, name, artist){
  let match;
  for(let song of songList){
    // Title AND artist match
    if(song.title.toLowerCase() === name.toLowerCase() && song.primary_artist.name.toLowerCase() === artist.toLowerCase()){
      return song;
    } 
    // Title matches and is only title match in songList
    else if(song.title.toLowerCase() === name.toLowerCase()){
      if(match){
        // If there is more than one match, return false
        return false;
      } else {
        match = song;
      }
    }
  }
  return match;
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

