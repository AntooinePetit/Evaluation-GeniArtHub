async function getDatas() {
  const req = await fetch("http://localhost:3000/api/products/");
  const res = await req.json();
  return res;
}

async function populateDatas() {
  const datas = await getDatas();
  const sectionProducts = document.querySelector(".products");
  datas.forEach((data) => {
    const { _id, shorttitle, titre, image } = data;
    const template = `
            <article>
                <img src="${image}" alt="${titre}">
                <a href="product.html?id=${_id}">Buy ${shorttitle} </a>
            </article>
    `;
    sectionProducts.insertAdjacentHTML('beforeend', template)
  });
}

populateDatas();