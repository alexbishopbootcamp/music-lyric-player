// Load API key from secrets.json
var secrets = {};
var mainText = document.getElementById('text')

fetch('secrets.json')
  .then(response => response.json())
  .then(data => {
    secrets = data;
    console.log(secrets);
  }
);
secrets = 'B98dceKwMBqBfHmExWu8E3xQ4SB-m8b4OGKlxj4Xc4elRZ6oQUhE-HfjpXpDMxLp'

var token = 'access_token=' + secrets

console.log(secrets)
//B98dceKwMBqBfHmExWu8E3xQ4SB-m8b4OGKlxj4Xc4elRZ6oQUhE-HfjpXpDMxLp'

var toSearch = 'beat it'



const urlQuery = encodeURIComponent(toSearch);

console.log(urlQuery)

function getSongDetails() {
  const requestUrl = 'https://api.genius.com/search?q=' + urlQuery + '&' + token;;
  
  const sondId = fetch(requestUrl, {
    method: 'GET',
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    var song = data.response.hits[0].result
    var songId = song.id.toString()
    var title = song.full_title
    var lCaseTitle = title.toLowerCase()
    var splitlCaseTitle = lCaseTitle.split(' by')[0]
    var lCasetoSearch = toSearch.toLowerCase()
    console.log(splitlCaseTitle);

    if (splitlCaseTitle === lCasetoSearch) {
      getSong(songId)
      console.log(songId)
    } else {
      console.log("not same")
    }
  })
}
getSongDetails()





function getSong(songId) {
  // fetch request gets a list of all the repos for the node.js organization
var id = songId
console.log(id)
const requestUrl = 'https://api.genius.com/songs/'+ songId + '?' + token;
console.log(requestUrl)
const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      console.log(secrets)
      console.log(response)
      return response.json();
    })

    .then(data => {
      console.log(data)

      var song = data.response.song.embed_content;

      let parser = new DOMParser();
      let doc = parser.parseFromString(song, "text/html");

      let scriptTag = doc.body.childNodes[2];
      console.log(scriptTag.src);

      var src = scriptTag.src

      console.log(mainText)

      console.log(mainText)
      const requestUrl = src;

      getLyrics(requestUrl)
      return song;

    })
    .catch(error => {
        console.error('Error:', error);
    });

    // return data from response
    console.log(lyric)
    return lyric;
}


function getLyrics(requestUrl) {
  console.log(requestUrl)
  const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      return response.text();
    })
  async function displayLyrics() {
    const lyricText = await lyric;
    //console.log(lyricText)
    const regex = /(JSON\.parse.+)./g;
    const match = regex.exec(lyricText)[0].split(0, -1);
    const myScript = document.createElement('script');
    myScript.innerHTML += 'document.querySelector("#text").innerHTML = (';
    myScript.innerHTML += match;
    console.log(myScript);
    document.body.appendChild(myScript);
    mainText.removeChild(mainText.children[1])
    console.log(mainText);
  }
  displayLyrics()
}

