// Récupération des données spécifique du produit
async function getDatas(id) {
  try {
    const req = await fetch(`http://localhost:3000/api/products/${id}`);
    return await req.json();
  } catch (e) {
    console.error(e);
  }
}

// Affichage des données du produit
async function populateDatas() {
  try {
    const params = new URLSearchParams(document.location.search);
    const productId = params.get("id");
    const datas = await getDatas(productId);
    const detailOeuvre = document.querySelector(".detailoeuvre");
    const { _id, titre, description, image, declinaisons } = datas;
    const shortdescription = description.split("\n");
    document.title = `${titre} - GeniArtHub`;
    const template = `<article>
            <figure>
                <img src="${image}" alt="${titre}">
            </figure>
            <div>
                <h1>${titre}</h1>
                <p>${shortdescription[0]} </p>
                <div class="price">
                    <p>Acheter pour</p>
                    <span class="showprice">${declinaisons[0].prix}€</span>
                </div>
                <div class="declinaison">
                    <input type="number" name="quantity" id="quantity" placeholder="1" value="1" minlength="1">
                    <select name="format" id="format">
                    </select>
                </div>
                <a class="button-buy" href="#">Buy bird</a>
            </div>
        </article>

        <aside>
            <h2>Description de l’oeuvre : ${titre} </h2>
            <p> ${description} </p>
        </aside>`;
    detailOeuvre.insertAdjacentHTML("beforeend", template);

    // Affichage dynamique des prix en fonction de la taille sélectionné
    const select = document.querySelector("#format");
    let i = 0;
    declinaisons.forEach((declinaison) => {
      select.insertAdjacentHTML(
        "beforeend",
        `<option value="${i}"> ${declinaison.taille} </option>`
      );
      i++;
    });
    select.addEventListener("change", (e) => {
      document.querySelector(".showprice").textContent = `${
        declinaisons[select.value].prix
      }€`;
    });

    // Envoie du produit au clic sur le lien
    const boutonEnvoyer = document.querySelector(".button-buy");
    const champQuantite = document.querySelector("#quantity");
    boutonEnvoyer.addEventListener("click", (e) => {
      e.preventDefault();
      addProductToCart(_id, select.value, champQuantite.value);
    });
  } catch (e) {
    console.error(e);
    document.querySelector(".detailoeuvre").innerHTML =
      '<p class="error">Erreur ! Aucun article trouvé !</p>';
  }
}

// Envoie des produits dans le panier
function addProductToCart(productId, declinaison, quantite) {
  const idPanier = `${productId}-${declinaison}`;
  // Si le panier est vide on ajoute le nouvel article et on arrête la fonction sinon double ajout
  if (panier.length == 0) {
    const nouveauProduit = {
      idCart: idPanier,
      id: productId,
      taille: declinaison,
      quantite,
    };
    panier.push(nouveauProduit);
    console.log("Ajout d'un nouvel élément");
    return;
  }
  panier.forEach((produit) => {
    // Si le produit est déjà présent dans le panier, mise à jour de la quantité
    if (idPanier == produit.idCart) {
      produit.quantite = parseInt(produit.quantite) + parseInt(quantite);
      console.log("Ajouté à un élément existant");
      // Sinon on ajoute le produit au panier
    } else {
      const nouveauProduit = {
        idCart: idPanier,
        id: productId,
        taille: declinaison,
        quantite,
      };
      panier.push(nouveauProduit);
      console.log("Ajout d'un nouvel élément");
    }
  });
  console.log(panier);
}

// Récupération du panier dans le local storage s'il existe, sinon création d'un panier vide
let panier = localStorage.getItem("panier")
  ? localStorage.getItem("panier")
  : [];

populateDatas();