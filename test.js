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

function displayLyrics(requestUrl) {
    console.log(requestUrl)
    const lyric = fetch(requestUrl, {
      method: 'GET',
      })
      .then(response => {
        return response.text();
      })
    async function f1() {
      const lyricText = await lyric;
      console.log(lyricText)
      const regex = /(JSON\.parse.+<iframe)./g;
      let match = regex.exec(lyricText)[0].split(0, -1).toString();
      let replace = match.replace("<iframe", "))");
      const myScript = document.createElement('script');
      myScript.innerHTML += 'document.querySelector("#text").innerHTML = (';
      myScript.innerHTML += replace;
      console.log(myScript.innerHTML);
      document.body.appendChild(myScript);
    }
    f1()
  }

  //genius.com/songs/200930/embed.js

  //<script id="src" crossorigin src='//genius.com/songs/200930/embed.js'></script>



//mainText.innerHTML = getApi();

function getApi1() {
    const requestUrl = 'https://genius.com/songs/378195/embed.js';
    const lyric = fetch(requestUrl, {
        method: 'GET',
        })
        .then(response => {
            console.log(secrets)
          console.log(response)
    
          var data = response;
          console.log(data)
          return response;
        })
    
        .then((response) => response.text())
      .then((text) => {
        //const objectURL = URL.createObjectURL(text);
        //image.src = objectURL;
        console.log(text)
      });
}
    
getApi1();

//function getApi11() {
    const requestUrl = 'https://genius.com/songs/378195/embed.js';
    const lyrics = fetch(requestUrl, {
      method: 'GET',
      })
      .then(lyric1 => {
        return lyric1.text();
      })
      .then(lyric => {
        const lyricText = lyric;
        console.log(lyricText);
  const regex = /(JSON\.parse.+)./g;
  const match = regex.exec(lyricText)[0].split(0, -1);
  const myScript = document.createElement('script');
  myScript.innerHTML += '';
  myScript.innerHTML += match;
  console.log(myScript);
  document.body.appendChild(myScript);
        return myScript.innerHTML;
      })
  
  
      //return lyric
  //}
  
    
    
