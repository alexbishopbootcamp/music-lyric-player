// receive search

const requestUrl = 'https://genius.com/songs/1063/embed.js';

const lyric = fetch(requestUrl, {
    method: 'GET',
    })
    .then(response => {
      return response.text();
    })

const lyricText = await lyric;
const regex = /(JSON\.parse.+)./g;
const match = regex.exec(lyricText)[0].split(0, -1);
const myScript = document.createElement('script');
myScript.innerHTML += 'document.querySelector("p").innerHTML = (';
myScript.innerHTML += match;
console.log(myScript);
document.body.appendChild(myScript);