// Consts and globals
const spotify_clientId = '22f3db4cf7b34903bf1542c51b5ed79c'; // Client ID for our Spotify app

// Code adapted from Spotify's documentation
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

function generateRandomString(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}

async function spotifyOAuth(){
  // const data = generateRandomString(128);
  // const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  const redirectUri = document.location.origin;
  
  let codeVerifier = generateRandomString(128);
  
  generateCodeChallenge(codeVerifier).then(codeChallenge => {
    let state = generateRandomString(16);
    let scope = '';
  
    localStorage.setItem('code_verifier', codeVerifier);
  
    let args = new URLSearchParams({
      response_type: 'code',
      client_id: spotify_clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    });
  
    window.location = 'https://accounts.spotify.com/authorize?' + args;
    // console.log(redirectUri);
  });  
}

window.addEventListener('load', () => {
  // get code and state url params
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  if(error){
    alert(error);
  } else if(code && state){
    console.log(code);
    console.log(state);
    // We have just come back from Spotify auth
    // Get code verifier from local storage
    let codeVerifier = localStorage.getItem('code_verifier');
    console.log(codeVerifier);

    const redirectUri = document.location.origin;

    let body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: spotify_clientId,
      code_verifier: codeVerifier
    });

    // Get Access Token
    const response = fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      localStorage.setItem('spotify_access_token', data.access_token);
      // Expiry time of the access token in seconds
      const valid_until = new Date().getTime()/1000 + (data.expires_in);
      localStorage.setItem('spotify_valid_until', valid_until);
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    })
    .catch(error => {
      console.error('Error:', error);
    });

    window.history.replaceState({}, document.title, "/");
  }
});

async function spotifyRefreshToken(){
  console.log('Old Token')
  console.log(localStorage.getItem('spotify_access_token'));
  let body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: localStorage.getItem('spotify_refresh_token'),
    client_id: spotify_clientId,
  });

  const response = fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    localStorage.setItem('spotify_access_token', data.access_token);
    // Expiry time of the access token in seconds
    const valid_until = new Date().getTime()/1000 + (data.expires_in);
    localStorage.setItem('spotify_valid_until', valid_until);
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

async function spotifySearchTracks(query){
  // turn query string into URL paramater
  const urlQuery = encodeURIComponent(query);
  const fetchUrl = `https://api.spotify.com/v1/search?q=${urlQuery}&type=track`;

  const response = fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
    });

    // return data from response
    return response;
}

function spotifyCheckTokenExpired(){
  const valid_until = localStorage.getItem('spotify_valid_until');
  const now = new Date().getTime()/1000;
  if(now > valid_until){
    return true;
  } else {
    return false;
  }
}

async function listTracks(query){
  const tracks = await spotifySearchTracks(query);
  console.log(tracks)
  for(let track of tracks.tracks.items){
    const trackDiv = document.createElement('div');
    trackDiv.textContent = track.name;
    trackDiv.style.border = '1px solid black';
    trackDiv.style.padding = '2px';
    trackDiv.style.margin = '2px';
    trackDiv.addEventListener('click', () => {
      loadUri(track.uri);
    });
    document.body.appendChild(trackDiv);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('button').addEventListener('click', () => {
    listTracks(document.querySelector('input').value);
  });
});