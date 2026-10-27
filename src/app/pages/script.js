document.addEventListener("DOMContentLoaded", async () => {
  let media_Setting;
  let media;
  const page_Media = {
    title: document.getElementById("media-title"),
    listening: document.getElementById("listening"),
    art: document.getElementById("media-art"),
    artist: document.getElementById("media-artist"),
    time: document.getElementById("media-time"),
    background: document.getElementById("background-art"),
  };
  if (window.curiosityAPI) {
    async function getInfo() {
      try {
        media_Setting = await window.curiosityAPI.getSetting("media");
        media = await window.curiosityAPI.getMedia();
        if (page_Media && media_Setting && media) {
          if (page_Media.listening)
            page_Media.listening = media_Setting.listening;
          if (page_Media.title) page_Media.title.innerHTML = media.title;
          if (page_Media.artist) page_Media.artist.innerHTML = media.artist;
          if (page_Media.art) page_Media.art.src = media.art;
          if (page_Media.background) page_Media.background.src = media.art;
          if (page_Media.time)
            page_Media.time.innerHTML = `${media.position}/${media.duration}`;
        }
      } catch (err) {
        return console.log(err);
      }
    }
    getInfo();

    setInterval(() => {
      getInfo();
    }, 1000);
  }
});
