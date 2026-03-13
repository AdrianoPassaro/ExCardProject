document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("cardGrid");
    const addBtn = document.getElementById("addCardBtn");

    const cardTemplate = {
        name: "Pikachu",
        rarity: "Ultra Rare",
        expansion: "Ascended Heroes",
        imageUrl: "https://storage.googleapis.com/images.pricecharting.com/o7oe255flanpc7fa/1600.jpg",
        condition: "Near Mint"
    };

    let collection = [];

    /* crea una carta HTML */

    function createCardElement(card,index){

        const cardDiv=document.createElement("div");
        cardDiv.classList.add("card");

        cardDiv.innerHTML=`
<img src="${card.imageUrl}">
<div class="card-overlay">
<button class="delete-btn">X</button>
</div>

<div class="card-info">
<strong>${card.name}</strong><br>
${card.rarity}<br>
${card.expansion}<br>
${card.condition}
</div>
`;

        const deleteBtn=cardDiv.querySelector(".delete-btn");

        deleteBtn.addEventListener("click",()=>{
            collection.splice(index,1);
            renderCollection();
        });

        return cardDiv;
    }

    /* renderizza tutta la collezione */

    function renderCollection(){

        grid.innerHTML="";

        collection.forEach((card,index)=>{
            const cardElement=createCardElement(card,index);
            grid.appendChild(cardElement);
        });

    }

    /* aggiunta carta */

    addBtn.addEventListener("click",()=>{

        collection.push({...cardTemplate});

        renderCollection();

    });

    /* carta iniziale */

    collection.push({...cardTemplate});

    renderCollection();

});