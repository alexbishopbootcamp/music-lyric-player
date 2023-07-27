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

// Entry point
function init(){

}


// Return a list of songs that match the search query
function geniusSearch(query) {

}

// Return the lyrics for a specific track
function geniusGetLyrics(name, artist, album, date, trackUri){
  getSongDetails(name);
}

function getSongDetails(geniusToSearch) {
  const urlQuery = encodeURIComponent(geniusToSearch);
  const requestUrl = 'https://api.genius.com/search?q=' + urlQuery + '&access_token=' + geniusAPIKey;
  
  const sondId = fetch(requestUrl, {
    method: 'GET',
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
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

