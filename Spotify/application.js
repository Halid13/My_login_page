const APIController = (function () {
    const clientId = '4470a952629b4af59391c896af29f4aa';
    const clientSecret = '26b5b5ae38c24db18bcd127f3ad29590';
    let accessToken;
  
    const _getToken = async () => {
      if (accessToken) {
        return accessToken;
      }

      const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
        },
        body: 'grant_type=client_credentials',
      });
  
      const data = await result.json();
      accessToken = data.access_token;
      return accessToken;
    };
  
    const _getGenres = async (token) => {
      const result = await fetch('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      });
  
      const data = await result.json();
      return data.categories.items;
    };
  
    const _getPlaylistByGenre = async (token, genreId) => {
      const limit = 10;
  
      const result = await fetch(
        `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
        {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
        }
      );
  
      const data = await result.json();
      return data.playlists.items;
    };
  
    const _getTracks = async (token, tracksEndPoint) => {
      const limit = 10;
  
      const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      });
  
      const data = await result.json();
      return data.items;
    };
  
    const _getTrack = async (token, trackEndPoint) => {
      const result = await fetch(`${trackEndPoint}`, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
      });
  
      const data = await result.json();
      return data;
    };
  
    return {
      async getToken() {
        return await _getToken();
      },
      async getGenres(token) {
        return await _getGenres(token);
      },
      async getPlaylistByGenre(token, genreId) {
        return await _getPlaylistByGenre(token, genreId);
      },
      async getTracks(token, tracksEndPoint) {
        return await _getTracks(token, tracksEndPoint);
      },
      async getTrack(token, trackEndPoint) {
        return await _getTrack(token, trackEndPoint);
      },
    };
  })();
  
  const UIController = (function () {
    const DOMElements = {
      selectGenre: '#select_genre',
      selectPlaylist: '#select_playlist',
      buttonSubmit: '#btn_submit',
      divSongDetail: '#song-detail',
      hfToken: '#hidden_token',
      divSonglist: '.song-list',
    };
  
    return {
      inputField() {
        return {
          genre: document.querySelector(DOMElements.selectGenre),
          playlist: document.querySelector(DOMElements.selectPlaylist),
          tracks: document.querySelector(DOMElements.divSonglist),
          submit: document.querySelector(DOMElements.buttonSubmit),
          songDetail: document.querySelector(DOMElements.divSongDetail),
        };
      },
  
      createGenre(text, value) {
        const html = `<option value="${value}">${text}</option>`;
        document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
      },
  
      createPlaylist(text, value) {
        const html = `<option value="${value}">${text}</option>`;
        document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
      },
  
      createTrack(id, name) {
        const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
        document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
      },
  
      createTrackDetail(img, title, artist) {
        const detailDiv = document.querySelector(DOMElements.divSongDetail);
        detailDiv.innerHTML = '';
  
        const html = `
          <div class="row col-sm-12 px-0">
            <img src="${img}" alt="">        
          </div>
          <div class="row col-sm-12 px-0">
            <label for="Genre" class="form-label col-sm-12">${title}:</label>
          </div>
          <div class="row col-sm-12 px-0">
            <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
          </div> 
        `;
  
        detailDiv.insertAdjacentHTML('beforeend', html);
      },
  
      resetTrackDetail() {
        this.inputField().songDetail.innerHTML = '';
      },
  
      resetTracks() {
        this.inputField().tracks.innerHTML = '';
        this.resetTrackDetail();
      },
  
      resetPlaylist() {
        this.inputField().playlist.innerHTML = '';
        this.resetTracks();
      },
  
      storeToken(value) {
        document.querySelector(DOMElements.hfToken).value = value;
      },
  
      getStoredToken() {
        return {
          token: document.querySelector(DOMElements.hfToken).value,
        };
      },
    };
  })();
  
  const APPController = (function (UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();
  
    const loadGenres = async () => {
      const token = await APICtrl.getToken();
      UICtrl.storeToken(token);
      const genres = await APICtrl.getGenres(token);
      genres.forEach((element) => UICtrl.createGenre(element.name, element.id));
    };
  
    DOMInputs.genre.addEventListener('change', async () => {
      UICtrl.resetPlaylist();
      const token = UICtrl.getStoredToken().token;
      const genreSelect = UICtrl.inputField().genre;
      const genreId = genreSelect.options[genreSelect.selectedIndex].value;
      const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
      playlist.forEach((p) => UICtrl.createPlaylist(p.name, p.tracks.href));
    });
  
    DOMInputs.submit.addEventListener('click', async (e) => {
      e.preventDefault();
      UICtrl.resetTracks();
      const token = UICtrl.getStoredToken().token;
      const playlistSelect = UICtrl.inputField().playlist;
      const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
      const tracks = await APICtrl.getTracks(token, tracksEndPoint);
      tracks.forEach((el) => UICtrl.createTrack(el.track.href, el.track.name));
    });
  
    DOMInputs.tracks.addEventListener('click', async (e) => {
      e.preventDefault();
      UICtrl.resetTrackDetail();
      const token = UICtrl.getStoredToken().token;
      const trackEndpoint = e.target.id;
      const track = await APICtrl.getTrack(token, trackEndpoint);
      UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });
  
    return {
      init() {
        console.log('App is starting');
        loadGenres();
      },
    };
  })(UIController, APIController);
  
  APPController.init();
  