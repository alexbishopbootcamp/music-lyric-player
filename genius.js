// Load API key from secrets.json
var secrets = {};
var mainText = document.getElementById('text')
var mainText = document.getElementById('text')


fetch('secrets.json')
  .then(response => response.json())
  .then(data => {
    secrets = data;
    console.log(secrets);
  }
);

secrets = 'aGYq4jMa_2pNIMUhl6nXBIg7os8XHnPkIa8Hw36CU968w8kJUUBH4hcJE6ZJx3Le'
function getApi() {
  // fetch request gets a list of all the repos for the node.js organization

const requestUrl = 'https://api.genius.com/songs/378195?access_token='+secrets;
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

      //var link = document.createElement('div');

      //link.innerHTML = song

      //console.log(song)
      console.log(mainText)

      //mainText.appendChild(link);
      
      //mainText.innerHTML = hhh "n/" +  song 

      console.log(mainText)
      return song;

    })
    .catch(error => {
        console.error('Error:', error);
    });

    // return data from response
    console.log(lyric)
    return lyric;
}
var gg = getApi();
getApi()

console.log(gg)


const requestUrl = 'https://genius.com/songs/2948513/embed.js';

const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      return response.text();
    })

async function f1() {
  const lyricText = await lyric;
//console.log(lyricText)
const regex = /(JSON\.parse.+)./g;
const match = regex.exec(lyricText)[0].split(0, -1);
const myScript = document.createElement('script');
myScript.innerHTML += 'document.querySelector("#text").innerHTML = (';
myScript.innerHTML += match;
console.log(myScript);
document.body.appendChild(myScript);
}

f1()
