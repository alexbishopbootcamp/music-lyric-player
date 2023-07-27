// To store API key
var secrets = {};
// Store div #text into lyricsText
var lyricsText = document.getElementById('text')

// Fetch the API key from secrets.js
fetch('secrets.json')
  .then(response => response.json())
  .then(data => {
    // Stor API key in var secret
    secrets = data;
    console.log(secrets);
  }
);

// API key
secrets = 'B98dceKwMBqBfHmExWu8E3xQ4SB-m8b4OGKlxj4Xc4elRZ6oQUhE-HfjpXpDMxLp'

// Create token
var token = 'access_token=' + secrets

console.log(secrets)

// Song to be searched 
var toSearch = 'beat it'

// Convert toSong into a coded form
const urlQuery = encodeURIComponent(toSearch);

console.log(urlQuery)

// Function to search song details and getting song id
function getSongDetails() {
  // Url of song searched 
  const requestUrl = 'https://api.genius.com/search?q=' + urlQuery + '&' + token;;

  // Fetch function to get song id from 
  fetch(requestUrl, {
    method: 'GET',
  })
  // Return the response and covert to JSON
  .then(response => {
    return response.json();
  })

  // Function to access song Id from response.json
  .then(data => {
    // Details of first found song in results
    var songDetail = data.response.hits[0].result;
    // Song Id
    var songId = songDetail.id.toString();
    // Song title
    var title = songDetail.full_title;

    // Convert title of song found and song searched to lowercase
    var lCaseTitle = title.toLowerCase();
    var lCaseToSearch = toSearch.toLowerCase();

    // Store only song name (e.g. "Climax by Usher")
    var songName = lCaseTitle.split(' by')[0]
    
    console.log(songName);

    // Check if song match song searched
    if (songName === lCaseToSearch) {
      // If yes, then use Id to access song
      getSong(songId)
      console.log(songId)
    } else {
      // If not display error
      console.log("not same")
    }
  })
  // For error checking 
  .catch(error => {
    console.error('Error:', error);
  });
}

// function to search song details
getSongDetails()


// Function to access song with Id
function getSong(songId) {
  // Fetch request of the song using Id requires token
  const requestUrl = 'https://api.genius.com/songs/'+ songId + '?access_token=' + geniusAPIKey;
  console.log(requestUrl)

  // Store found lyrics content of song from Url
  fetch(requestUrl, {
    method: 'GET',
    })
    // Return the response and covert to JSON
    .then(response => {
      console.log(response)
      return response.json();
    })

    // Function to access embedded song content from response.json
    .then(data => {
      console.log(data)

      // Store embedded content
      var songEmbed = data.response.song.embed_content;

      // Create DOMParser
      let parser = new DOMParser();
      // Parse embedded content in html format and store in var doc 
      let doc = parser.parseFromString(songEmbed, "text/html");
      // Select scriptTag from embedded content
      let scriptTag = doc.body.childNodes[2];
      // Displayed lyric in html format
      console.log(scriptTag.src)
      // Select src form scripTag 
      var src = scriptTag.src

      // Pass src as Url to getLyric function
      const requestUrl = src
      getLyrics(requestUrl)

      // Return html format of song embedded content 
      var htmlSongEmbed = doc.body
      console.log(htmlSongEmbed);
      return htmlSongEmbed;
    })
    
    // For error checking 
    .catch(error => {
        console.error('Error:', error);
    });
}

// Fetch request gets the song embed.js lyric, using song src
function getLyrics(requestUrl) {

  // Fetch function to extract lyrics from song src.embed.js 
  const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    // Return the response and covert to text
    .then(response => {
      return response.text();
    })
  
  // Function too display Lyrics
  async function displayLyrics() {
    // Lyric text
    const lyricAsText = await lyric;

    // Get only text after "JSON\.parse" and ")"
    const regex = /(JSON\.parse.+)./g;
    // Store new cut lyric text in lyricOnly
    const lyricOnly = regex.exec(lyricAsText)[0].split(0, -1);
    // Create new <script>
    const myScript = document.createElement('script');
    // Add lyrics to script
    myScript.innerHTML += 'document.querySelector("#text").innerHTML = (';
    myScript.innerHTML += lyricOnly;
    console.log(myScript);
    // Create and display in index.html
    document.body.appendChild(myScript);
    // Then remove the <inframe> element
    lyricsText.removeChild(lyricsText.children[1])
    console.log(lyricsText);
  }
  displayLyrics()
}

