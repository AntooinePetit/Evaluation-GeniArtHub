async function getDatas(id) {
  try {
    const req = await fetch(`http://localhost:3000/api/products/${id}`);
    return await req.json();
  } catch (e) {
    console.error(e);
  }
}

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
    const select = document.querySelector('#format')
    let i = 0
    declinaisons.forEach((declinaison) => {
      select.insertAdjacentHTML('beforeend', `<option value="${i}"> ${declinaison.taille} </option>`)
      i++
    })
    select.addEventListener('change', (e) => {
      document.querySelector('.showprice').textContent = `${declinaisons[select.value].prix}€`
    })
  } catch (e) {
    console.error(e);
    sectionProducts.innerHTML =
      '<p class="error">Erreur ! Aucun article trouvé !</p>';
  }
}

populateDatas();
