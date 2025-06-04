// Récupération des données globales de tous les produits
async function getDatas() {
  try {
    const req = await fetch("http://localhost:3000/api/products/");
    return await req.json();
  } catch (e) {
    console.error(e);
  }
}

// Affichage des données du produit
async function populateDatas() {
  try {
    const datas = await getDatas();
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
      const template = `<article>
            <img src="${image}" alt="${titre}">
            <h2>${titre}</h2>
            <p>${taille}</p>
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
        updateCart(idCart, input.value);
      });
    });
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
function updateCart(id, quantite) {
  const produitAModifier = panier.find((produit) => produit.idCart === id);
  const erreur = document.querySelector(`#erreur-quantite-${id}`);
  if (quantite < 0 || quantite > 100) {
    erreur.textContent = "Vous devez avoir entre 1 et 100 articles";
  } else {
    produitAModifier.quantite = quantite;
    localStorage.setItem("panier", JSON.stringify(panier));
    erreur.textContent = "";
  }
}

// Récupération du panier dans le local storage s'il existe, sinon création d'un panier vide
const panier = localStorage.getItem("panier")
  ? JSON.parse(localStorage.getItem("panier"))
  : [];

populateDatas();
