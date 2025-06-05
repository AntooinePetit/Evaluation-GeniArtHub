// Récupération des données globales de tous les produits
async function getDatas() {
  try {
    const req = await fetch("http://localhost:3000/api/products/");
    return await req.json();
  } catch (e) {
    console.error(e);
  }
}

// On rend les datas accessible partout dans le document
let datas;

// Affichage des données du produit
async function populateDatas() {
  try {
    datas = await getDatas();
    if (panier.length === 0) {
      document.querySelector("#panier > div").insertAdjacentHTML(
        "afterbegin",
        `
      <article>
         <p>Votre panier est vide. Veuillez ajouter au moins un article à votre panier</p>
      </article>`
      );
      return;
    }
    panier.forEach((produit) => {
      const { idCart, id, taille, quantite } = produit;
      const produitRecherche = datas.find((prod) => prod._id === id);
      const { titre, image, declinaisons } = produitRecherche;
      const tailleChoisie = declinaisons[taille];
      const { prix } = tailleChoisie;
      const template = `<article id="${idCart}">
            <img src="${image}" alt="${titre}">
            <h2>${titre}</h2>
            <p>${tailleChoisie.taille}</p>
            <p>${prix}€</p>
            <div class="input-container">
               <label for="quantity-${idCart}">Quantité : </label>
               <input type="number" name="quantity-${idCart}" id="quantity-${idCart}"  placeholder="${quantite}" value="${quantite}" minlength="1">
            </div>
            <button id="delete-bird">Supprimer</button>
          </article>
          <p style="color:red;" id="erreur-quantite-${idCart}"></p>`;
      document
        .querySelector("#panier > div")
        .insertAdjacentHTML("afterbegin", template);
      const input = document.querySelector("input");
      input.addEventListener("change", (e) => {
        updateCart(idCart, input.value, input);
      });
    });
    calcTotals();
  } catch (e) {
    console.error(e);
    document.querySelector("#panier > div").insertAdjacentHTML(
      "afterbegin",
      `
      <article>
         <p>Votre panier est vide. Veuillez ajouter au moins un article à votre panier</p>
      </article>`
    );
  }
}

// Mise à jour du panier
function updateCart(id, quantite, input) {
  const produitAModifier = panier.find((produit) => produit.idCart === id);
  const erreur = document.querySelector(`#erreur-quantite-${id}`);
  if (quantite < 0 || quantite > 100) {
    erreur.textContent = "Vous devez avoir entre 1 et 100 articles";
    input.value = quantite > 100 ? 100 : 0
  } else if (quantite == 0) {
    supprimerArticle(id)
  } else {
    produitAModifier.quantite = quantite;
    localStorage.setItem("panier", JSON.stringify(panier));
    erreur.textContent = "";
  }
  calcTotals()
}

// Fonction de suppression d'élément
function supprimerArticle(id) {
  const articleASupprimer = document.querySelector(`#${id}`);
  const produitASupprimer = panier.find((produit) => produit.idCart === id);
  const modal = document.createElement("dialog");
  modal.id = "delete";
  modal.innerHTML = `
      <i class="fa-solid fa-xmark"></i>
      <p id="title-modale">Supprimer un article</p>
      <p>Êtes-vous sûr de vouloir supprimer cet article ?</p>
      <div>
         <button id="yes">Oui</button>
         <button id="no">Non</button>
      </div>`;
  document.body.insertAdjacentElement("afterbegin", modal);
  modal.showModal();

  // Ecouter si l'utilisateur confirme ou non vouloir supprimer l'article
  const boutonOui = document.querySelector('#yes')
  const boutonNon = document.querySelector('#no')

  boutonNon.addEventListener('click', (e) => {
    modal.close()
    modal.remove()
    document.querySelector(`#quantity-${id}`).value = document.querySelector(`#quantity-${id}`).value <= 0 ? 1 : document.querySelector(`#quantity-${id}`).value
    calcTotals
  })

  boutonOui.addEventListener('click', (e) => {
    const index = panier.indexOf(produitASupprimer)
    if(index != -1){
      panier.splice(index, 1)
    }
    modal.close()
    modal.remove()
    articleASupprimer.remove()
    localStorage.setItem("panier", JSON.stringify(panier));
    calcTotals
  })

}

// Calcul du total d'article et du total de prix
function calcTotals() {
  const totalArticles = document.querySelector("#total-article");
  let prixTotal = 0;
  let articleTotal = 0;
  panier.forEach((article) => {
    const { id, taille, quantite } = article;
    const infoArticle = datas.find((art) => art._id === id);
    const { declinaisons } = infoArticle;
    const prix = declinaisons[taille].prix;
    articleTotal += parseInt(quantite);
    prixTotal += parseInt(quantite) * prix;
  });
  if(panier == []){
    articleTotal = 0
    prixTotal = 0
  }
  totalArticles.textContent = `${articleTotal} articles pour un montant de ${prixTotal.toFixed(2)} €`;
}

// Récupération du panier dans le local storage s'il existe, sinon création d'un panier vide
const panier = localStorage.getItem("panier")
  ? JSON.parse(localStorage.getItem("panier"))
  : [];

populateDatas();
