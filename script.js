let elements = [];
let eloRatings = {};
let duelPairs = [];
let maxDuels = 38; // Limiter à un nombre de duels (par exemple 38)
let duelCount = 0;

// Fonction pour démarrer les duels
function startDuels() {
  const input = document.querySelector("[data-competitors-list]").value;
  elements = input.split("\n").filter(el => el.trim() !== "");
  eloRatings = {};
  elements.forEach(element => eloRatings[element] = 1000); // ELO initial pour tous les éléments

  if (elements.length < 2) {
    alert("Veuillez entrer au moins deux éléments !");
    return;
  }

  generateDuelPairs();

  document.querySelector("[data-duel-section]").classList.remove("u-hidden");
  document.querySelector("[data-ranking-section]").classList.add("u-hidden");
  document.querySelector("[data-btn-start-duels]").classList.add("u-hidden");

  showNextDuel();
}

// Générer des paires de duels avec la méthode Swiss
function generateDuelPairs() {
  // Mélanger les éléments pour une répartition aléatoire
  elements = elements.sort(() => 0.5 - Math.random());

  // Pairage en mode Swiss - comparer les éléments ayant des scores proches
  for (let i = 0; i < elements.length - 1; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      duelPairs.push([elements[i], elements[j]]);
    }
  }

  // Mélanger les paires pour plus de variété
  duelPairs = duelPairs.sort(() => 0.5 - Math.random());
}

// Fonction pour afficher le prochain duel
function showNextDuel() {
  if (duelCount >= maxDuels || duelPairs.length === 0) {
    // Tous les duels sont faits ou la limite atteinte, afficher les classements
    showRankings();
    return;
  }

  const [element1, element2] = duelPairs.shift(); // Prendre une paire de duel
  document.querySelector("[data-option='1']").innerText = element1;
  document.querySelector("[data-option='2']").innerText = element2;

  duelCount++;
}

// Fonction pour calculer les nouveaux scores ELO après chaque duel
function updateElo(winner, loser) {
  const k = 32;
  const ratingWinner = eloRatings[winner];
  const ratingLoser = eloRatings[loser];

  const expectedWinner = 1 / (1 + Math.pow(10, (ratingLoser - ratingWinner) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (ratingWinner - ratingLoser) / 400));

  eloRatings[winner] = ratingWinner + k * (1 - expectedWinner);
  eloRatings[loser] = ratingLoser + k * (0 - expectedLoser);
}

// Gestion des clics sur les boutons de duel
document.querySelector("[data-option='1']").addEventListener("click", () => {
  const element1 = document.querySelector("[data-option='1']").innerText;
  const element2 = document.querySelector("[data-option='2']").innerText;
  updateElo(element1, element2);
  showNextDuel();
});

document.querySelector("[data-option='2']").addEventListener("click", () => {
  const element1 = document.querySelector("[data-option='1']").innerText;
  const element2 = document.querySelector("[data-option='2']").innerText;
  updateElo(element2, element1);
  showNextDuel();
});

// Lancer les duels
document.querySelector("[data-btn-start-duels]").addEventListener("click", () => {
  duelCount = 0;
  duelPairs = []; // Réinitialiser les paires de duels
  startDuels();
});

// Fonction pour afficher les classements finaux
function showRankings() {
  document.querySelector("[data-duel-section]").classList.add("u-hidden");
  document.querySelector("[data-ranking-section]").classList.remove("u-hidden");
  document.querySelector("[data-btn-start-duels]").classList.remove("u-hidden");

  const rankings = Object.entries(eloRatings).sort((a, b) => b[1] - a[1]);
  const rankingList = document.querySelector("[data-results]");
  rankingList.innerHTML = "";
  rankings.forEach(([element, rating]) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `${element} <span class="elo">(ELO: ${Math.round(rating)})</span>`;
    rankingList.appendChild(listItem);
  });
}
