// Gestion des données et création de la page

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
            <button id="delete-${idCart}">Supprimer</button>
          </article>
          <p style="color:red;" id="erreur-quantite-${idCart}" class="erreur-quantite"></p>`;
      document
        .querySelector("#panier > div")
        .insertAdjacentHTML("afterbegin", template);
      const input = document.querySelector("input");
      input.addEventListener("change", (e) => {
        updateCart(idCart, input.value, input);
      });

      // Ecouteur d'évènement du bouton 'Supprimer'
      const boutonDelete = document.querySelector(`#delete-${idCart}`);
      boutonDelete.addEventListener("click", (e) => {
        supprimerArticle(idCart);
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



// Gestion dynamique du panier et de l'affichage

// Mise à jour du panier
function updateCart(id, quantite, input) {
  const produitAModifier = panier.find((produit) => produit.idCart === id);
  const erreur = document.querySelector(`#erreur-quantite-${id}`);
  if (quantite < 0 || quantite > 100) {
    erreur.textContent = "Vous devez avoir entre 1 et 100 articles";
    input.value = quantite > 100 ? 100 : 0;
  } else if (quantite == 0) {
    supprimerArticle(id);
  } else {
    produitAModifier.quantite = quantite;
    localStorage.setItem("panier", JSON.stringify(panier));
    erreur.textContent = "";
  }
  calcTotals();
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
  const boutonOui = document.querySelector("#yes");
  const boutonNon = document.querySelector("#no");

  boutonNon.addEventListener("click", (e) => {
    modal.close();
    modal.remove();
    document.querySelector(`#quantity-${id}`).value =
      document.querySelector(`#quantity-${id}`).value <= 0
        ? 1
        : document.querySelector(`#quantity-${id}`).value;
    calcTotals();
  });

  boutonOui.addEventListener("click", (e) => {
    const index = panier.indexOf(produitASupprimer);
    if (index != -1) {
      panier.splice(index, 1);
    }
    modal.close();
    modal.remove();
    articleASupprimer.remove();
    localStorage.setItem("panier", JSON.stringify(panier));
    calcTotals();
  });
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
  if (panier == []) {
    articleTotal = 0;
    prixTotal = 0;
  }
  totalArticles.textContent = `${articleTotal} articles pour un montant de ${prixTotal.toFixed(
    2
  )} €`;
}



// Gestion de l'envoie de commande et de l'affichage après confirmation

// Fonction d'envoi de commande
async function envoiCommande(order) {
  try {
    const req = await fetch("http://localhost:3000/api/products/order", {
      method: "POST",
      headers: {
        "Content-type": "application/JSON",
      },
      body: JSON.stringify(order),
    });
    const res = await req.json();
    affichageNumeroCommande(res.orderId)
  } catch (e) {
    console.error(e);
  }
}

// Fonction d'affichage du numéro de commande
function affichageNumeroCommande(numeroDeCommande) {
  const modal = document.createElement("dialog");
  document.body.insertAdjacentElement('afterbegin', modal)
  modal.innerHTML = `
  <i class="fa-solid fa-xmark"></i>
   <p id="title-modale">Félicitations</p>
   <p>La commande a été passée avec succès</p>
   <p id="command-number">Votre numéro de commande est : ${numeroDeCommande}</p>
  `;
  modal.showModal()
  setTimeout(() => {
    modal.close()
    modal.remove()
    clearPage()
  }, 6000)
}

// Fonction pour remettre la page à 0 et vider le panier
function clearPage() {
  formulaire.reset()
  const articles = document.querySelectorAll('article')
  articles.forEach((article) => {
    article.remove()
  })
  localStorage.clear()
  panier = []
  calcTotals()
}



// Déclaration des variables/constantes à portée globale

// Récupération du panier dans le local storage s'il existe, sinon création d'un panier vide
let panier = localStorage.getItem("panier")
  ? JSON.parse(localStorage.getItem("panier"))
  : [];

// On rend les datas accessible partout dans le document
let datas;



populateDatas();



// Gestion du formulaire
const formulaire = document.querySelector("form");
formulaire.addEventListener("submit", (e) => {
  e.preventDefault();
  const regexFirstName = /^[a-zA-ZÀ-ÿ- ]{2,}$/; // Toutes les majuscules et minuscule, toutes les lettres avec accents, espaces et tirets. Minimum 2 caractères
  const regexLastName = /^[a-zA-ZÀ-ÿ- ]{2,}$/; // Toutes les majuscules et minuscule, toutes les lettres avec accents, espaces et tirets. Minimum 2 caractères
  const regexAddress = /^[a-zA-Z0-9à-ÿÀ-ÿ' -]{10,}$/; // Toutes les majuscules et minuscules, toutes les lettres avec accents, tous les chiffres, les espaces, tirets et apostrophes. Minimum 10 caractères
  const regexCity = /^[a-zA-Zà-ÿÀ-ÿ -]{3,}$/; // Toutes les majuscules et minuscule, toutes les lettres avec accents, espaces et tirets. Minimum 3 caractères
  const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/; // Toutes les majuscules et minuscules, tous les chiffres, les points, les tirets et les underscores. Un arobase obligatoire. Toutes les majuscules et minuscules, tous les chiffres, les points et les tirets. Un point obligatoire. Toutes les majuscules et minuscules, entre 2 et 10 caractères.
  let isCorrect = true;
  if (!regexFirstName.test(document.querySelector("#first-name").value)) {
    isCorrect = false;
    document.querySelector("#error-first-name").textContent =
      "Erreur ! Veuillez entrer une valeur valide";
  } else {
    document.querySelector("#error-first-name").textContent = "";
  }
  if (!regexLastName.test(document.querySelector("#last-name").value)) {
    isCorrect = false;
    document.querySelector("#error-last-name").textContent =
      "Erreur ! Veuillez entrer une valeur valide";
  } else {
    document.querySelector("#error-last-name").textContent = "";
  }
  if (!regexAddress.test(document.querySelector("#address").value)) {
    isCorrect = false;
    document.querySelector("#error-address").textContent =
      "Erreur ! Veuillez entrer une valeur valide";
  } else {
    document.querySelector("#error-address").textContent = "";
  }
  if (!regexCity.test(document.querySelector("#city").value)) {
    isCorrect = false;
    document.querySelector("#error-city").textContent =
      "Erreur ! Veuillez entrer une valeur valide";
  } else {
    document.querySelector("#error-city").textContent = "";
  }
  if (!regexEmail.test(document.querySelector("#mail").value)) {
    isCorrect = false;
    document.querySelector("#error-mail").textContent =
      "Erreur ! Veuillez entrer une valeur valide";
  } else {
    document.querySelector("#error-mail").textContent = "";
  }
  if (!isCorrect) {
    return;
  }
  const contact = {
    firstName: document.querySelector("#first-name").value,
    lastName: document.querySelector("#last-name").value,
    address: document.querySelector("#address").value,
    city: document.querySelector("#city").value,
    email: document.querySelector("#mail").value,
  };
  const products = [];
  panier.forEach((produit) => {
    products.push(produit.id);
  });
  const order = {
    contact,
    products,
  };
  envoiCommande(order);
});
