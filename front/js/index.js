// Récupération des données globales de tous les produits
async function getDatas() {
  try {
    const req = await fetch("http://localhost:3000/api/products/");
    return await req.json();
  } catch (e) {
    console.error(e);
  }
}

// Affichage des données sur la page
async function populateDatas() {
  const datas = await getDatas();
  const sectionProducts = document.querySelector(".products");
  try {
    datas.forEach((data) => {
      const { _id, shorttitle, titre, image } = data;
      const template = `
              <article>
                  <img src="${image}" alt="${titre}">
                  <a href="product.html?id=${_id}">Buy ${shorttitle} </a>
              </article>
      `;
      sectionProducts.insertAdjacentHTML("beforeend", template);
    });
  } catch (e) {
    console.error(e);
    sectionProducts.innerHTML =
      '<p class="error">Erreur ! Aucun article trouvé !</p>';
  }
}

populateDatas();
