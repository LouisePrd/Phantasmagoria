document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("button");
  let clicked = false;
  const audio = new Audio("/assets/Ouverture.mp3");

  function generateSubtitles() {
    launchMusic();
    const subtitles = [
      "GAMEJAM 2025",
      "48H POUR CREER UN JEU VIDEO",
      "THEME : NO ONE CAN SEE YOU",
      "CONTRAINTES :  TRICHROMIE, PASSAGES SECRETS",
      "BIEVENUE DANS LE JEU",
      "PHANTASMAGORIA",
      "",
    ];

    const subtitleContainer = document.getElementById("script");
    subtitles.forEach((subtitle, index) => {
      setTimeout(() => {
        subtitleContainer.innerHTML = subtitle;
      }, 2700 * index);
    });

    const totalTime = subtitles.length * 2300;

    setTimeout(() => {
      button.style.display = "block";
    }, totalTime);
  }

  function launchMusic() {
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
  }

  button.addEventListener("click", () => {
    let message = "Dernière chance pour alt + F4";
    if (!clicked) {
      button.innerHTML = message;
      clicked = true;
    } else {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (audio.volume > 0.1) {
            audio.volume = Math.max(0, audio.volume - 0.1);
          } else {
            audio.volume = 0;
            audio.pause();
          }
        }, 250 * i);
      }
      setTimeout(() => {
        window.location.href = "/pages/game.html";
      }, 2000);
    }
  });

  generateSubtitles();
});
