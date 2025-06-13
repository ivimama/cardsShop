document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("items-container");

    try {
        const res = await fetch('/api/v1/all-items');
        const items = await res.json();

        items.forEach(item => {
            if ([...container.children].some(div => div.querySelector('h2').textContent === item.name)) {
                return; // Пропускаме този продукт, защото вече е добавен
            }
            const div = document.createElement('div');
            div.className = 'item';

            div.innerHTML = `
        <h2>${item.name}</h2>
        <p>${item.description}</p>
        <p>Price: $${item.price}</p>
        <img src="/${item.image}" alt="${item.name}" />
        <a href="/cards/${item._id}">View details</a>
      `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error('Грешка при зареждане на продукти:', err);
    }

    const cardsCol = document.querySelectorAll('.item');
    cardsCol.forEach(async (item) => {
        const name = item.querySelector('h2')?.textContent?.trim();
        const quantity = parseInt(0);
        const paragraphs = item.querySelectorAll('p');
        const description = paragraphs[0]?.textContent?.trim() || "a";
        const priceText = paragraphs[1]?.textContent?.trim();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const image = item.querySelector('img')?.getAttribute('src')?.trim();


        if (!name || !image) return;

        try {
            const checkRes = await fetch(`/api/v1/items?name=${encodeURIComponent(name)}`);
            const checkData = await checkRes.json();

            if (checkData.exists) {
                return;
            }


            await fetch('/api/v1/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, quantity, image, description, price }),
            });
        } catch (err) {
            console.error('Error while add el', name, err);
        }
    });


    const purchaseForm = document.getElementById("purchaseForm");

    if (purchaseForm) {
        purchaseForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const name = document.getElementById("nameInput").value;
            const cardName = document.querySelector('h1')?.textContent?.trim();
            const quantity = parseFloat(document.getElementById("quantity").value);

            try {
                const response = await fetch('/api/v1/items/buy', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: cardName, quantity }),
                });
                const data = await response.json();

                if (response.ok) {
                    alert(`Purchase successful: thank you ${name}, quantity: ${quantity}`);
                } else {
                    alert(`Not enough stock available`);
                }
            } catch (err) {
                console.error("Грешка при покупка:", err);
                alert(`${name}  ${quantity} no`);
            }
        });
    }

    const reviewForm = document.getElementById("reviewFrom");
    const reviewInput = document.getElementById("reviewInput");
    const reviewsContainer = document.querySelector(".reviewContainers");
    const cardName = document.querySelector('h1')?.textContent?.trim();
    const commentDivs = document.querySelectorAll('.review');

    if (cardName && reviewsContainer) {
        try {
            const existingRes = await fetch(`/comments/api/v1/comments/${encodeURIComponent(cardName)}`);
            const existingComments = await existingRes.json();

            if (existingComments.length === 0) {

                for (const div of commentDivs) {
                    const content = div.textContent.trim();
                    if (!content) continue;

                    try {
                        const res = await fetch('/comments/api/v1/comments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content, cardName })
                        });

                        const data = await res.json();
                        if (!res.ok) {
                            console.error(`Грешка при запис на коментар:`, data.error);
                        } else {
                            console.log(`Добавен коментар:`, data.comment);
                        }
                    } catch (err) {
                        console.error("Fetch error:", err);
                    }
                }
            }

            const firstCom = existingComments[0];

            existingComments.forEach(comment => {
                if (firstCom === comment) {

                }
                else {
                    const div = document.createElement("div");
                    div.className = "review";
                    div.textContent = comment.content;
                    reviewsContainer.appendChild(div);
                }


            });


        } catch (err) {
            console.error("Грешка при зареждане на коментари:", err);
        }
    }


    if (reviewForm) {
        reviewForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const reviewText = reviewInput.value.trim();
            if (!reviewText || !cardName) return;

            try {
                const res = await fetch('/comments/api/v1/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: reviewText, cardName }),
                });

                const data = await res.json();

                if (res.ok) {
                    const newDiv = document.createElement("div");
                    newDiv.className = "review";
                    newDiv.textContent = reviewText;
                    reviewsContainer.prepend(newDiv);
                    reviewForm.reset();
                } else {
                    console.error("Грешка при запазване:", data.error);
                    alert("Коментарът не беше запазен!");
                }
            } catch (err) {
                console.error("Fetch грешка:", err);
                alert("Сървърна грешка при запис на коментар.");
            }
        });

        reviewInput.addEventListener("keypress", function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                reviewForm.dispatchEvent(new Event("submit"));
            }
        });
    }
});