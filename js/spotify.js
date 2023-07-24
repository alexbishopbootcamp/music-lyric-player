// Consts and globals
const spotify_clientId = "22f3db4cf7b34903bf1542c51b5ed79c"; // Client ID for our Spotify app

// Code adapted from Spotify's documentation
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

function generateRandomString(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
}

function spotifyOAuth() {
  const redirectUri = document.location.origin;
  let codeVerifier = generateRandomString(128);

  generateCodeChallenge(codeVerifier).then((codeChallenge) => {
    let state = generateRandomString(16);
    let scope = "";

    localStorage.setItem("spotify_code_verifier", codeVerifier);

    let args = new URLSearchParams({
      response_type: "code",
      client_id: spotify_clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    window.location = "https://accounts.spotify.com/authorize?" + args;
  });
}

async function spotifyCatchOAuthReturn() {
  // Use a promise to neatly package error codes and provide a true/false return
  return new Promise(async (resolve, reject) => {
    // get code and state url params
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    // Remove URL params from view
    window.history.replaceState({}, document.title, "/");

    // Bail if error encountered
    if (error) {
      reject(error);
    }
    if (code && state) {
      // Use presence of code and state to tell if we've come from spotify oauth
      // Get code verifier from local storage
      let codeVerifier = localStorage.getItem("spotify_code_verifier");

      const redirectUri = document.location.origin;

      let body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: spotify_clientId,
        code_verifier: codeVerifier,
      });

      // Get Access Token
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP status " + response.status);
          }
          return response.json();
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      storeTokens(response);
    }
    resolve();
  });
}

async function spotifyRefreshToken() {
  let body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: localStorage.getItem("spotify_refresh_token"),
    client_id: spotify_clientId,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error:", error);
    });

    storeTokens(response);
}

// Search Spotify for tracks and return them as JSON
async function spotifySearchTracks(query) {
  // Refresh token if needed
  if (spotifyTokenIsExpired()) {
    await spotifyRefreshToken();
  }

  // turn query string into URL paramater
  const urlQuery = encodeURIComponent(query);
  const fetchUrl = `https://api.spotify.com/v1/search?q=${urlQuery}&type=track`;

  const response = fetch(fetchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("spotify_access_token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // return data from response
  return response;
}

// Check if our locally stored access token is expired
function spotifyTokenIsExpired() {
  const valid_until = localStorage.getItem("spotify_valid_until");
  const now = new Date().getTime() / 1000;
  if (now > valid_until) {
    return true;
  } else {
    return false;
  }
}

// Extract tokens from a resopnse and store them in local storage
function storeTokens(response){
  // Populate local storage with tokens
  localStorage.setItem("spotify_access_token", response.access_token);
  // Expiry time of the access token in seconds
  const valid_until = new Date().getTime() / 1000 + response.expires_in;
  localStorage.setItem("spotify_valid_until", valid_until);
  localStorage.setItem("spotify_refresh_token", response.refresh_token);
}


// TODO: Find a way to check if the refresh token is expired. Using prescence of refresh token for now
// There is likely a way to check via API call for this
async function spotifyIsAuthorized() {
  return Boolean(localStorage.getItem("spotify_refresh_token"));
}

// Clear local storage for testing purposes
function spotifyClearAuth() {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_valid_until");
  localStorage.removeItem("spotify_refresh_token");
}
