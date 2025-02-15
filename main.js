function generateSubtitles() {
  const subtitles = [
    "48h Game Jam 2024",
    "Thème : No one can see you",
    "Contraintes :  trichromie, passages secrets"
  ];

  const subtitleContainer = document.getElementById("script");
  subtitles.forEach((subtitle, index) => {
    setTimeout(() => {
      subtitleContainer.innerHTML = subtitle;
    }, 5000 * index);
  });
}

generateSubtitles();