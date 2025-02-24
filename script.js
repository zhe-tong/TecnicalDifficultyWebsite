const SHEET_URL = process.env.SHEET_URL || "fallback-url-if-needed";let cachedData = null;

document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".header-menu li");
    const contentSections = document.querySelectorAll(".content-selection");
    menuItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            contentSections.forEach(section => {
                section.style.opacity = "0"; 
                section.style.visibility = "hidden"; 
                section.style.display = "none";
            });
            menuItems.forEach(menu => menu.classList.remove("active"));
            item.classList.add("active");
            setTimeout(() => {
                contentSections[index].style.display = "grid";
                contentSections[index].style.opacity = "1";  
                contentSections[index].style.visibility = "visible";  
            }, 300);
        });
    });
    fetchData();
    setInterval(fetchData, 60000);
});

function fetchData() {
    if (cachedData) {
        renderData(cachedData);
        return;
    }
    fetch(SHEET_URL)
        .then(response => response.json())
        .then(data => {
            cachedData = data;
            renderData(data);
        })
        .catch(error => console.error("Error fetching data:", error));
}

function renderData(data) {
    Object.keys(data).forEach(key => {
        data[key].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    fillContent(document.getElementById("local-jam"), data.localJam);
    fillContent(document.getElementById("international-jam"), data.internationalJam);
    fillContent(document.getElementById("hangouts"), data.hangouts);


    if (document.getElementById("members-container")) {
        fillMembers(document.getElementById("members-container"), data.members);
    }
}

function formatDate(isoString) {
    return isoString.split("T")[0];
}

function fillContent(container, items) {
    if (!container) return;
    if (!items || items.error) {
        container.innerHTML = `<p>Error loading data: ${items ? items.error : "No data found"}</p>`;
        return;
    }
    const fragment = document.createDocumentFragment();
    container.innerHTML = "";
    items.forEach(item => {
        const caseDiv = document.createElement("div");
        caseDiv.classList.add("case");
        caseDiv.onclick = () => openModal(item.image, formatDate(item.date), item.description, item.footage, item.title);
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title;
        img.classList.add("case-image");

        const titleDiv = document.createElement("div");
        titleDiv.classList.add("case-title");
        titleDiv.innerHTML = `<p>${item.title}</p>`;

        caseDiv.appendChild(img);
        caseDiv.appendChild(titleDiv);
        fragment.appendChild(caseDiv);
    });
    container.appendChild(fragment);
}
function openModal(image, date, desc, link, title) {
    document.getElementById("modal-img").src = image;
    document.getElementById("modal-date").innerText = date;
    document.getElementById("modal-desc").innerText = desc;
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-link").href = link;
    document.getElementById("modal").style.display = "block";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function fillMembers(container, items) {
    if (!container) return;
    if (!items || items.error) {
        container.innerHTML = `<p>Error loading members: ${items ? items.error : "No data found"}</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    container.innerHTML = "";

    items.forEach(item => {
        const memberDiv = document.createElement("div");
        memberDiv.classList.add("members-cards");

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("member-name");
        nameDiv.innerText = item.name;

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.classList.add("member-image");

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("member-box");

        const titleDiv = document.createElement("div");
        titleDiv.classList.add("member-box-title");
        titleDiv.innerText = item.breakingName ? item.breakingName : item.name; 


        const descDiv = document.createElement("div");
        descDiv.classList.add("member-box-desc");
        descDiv.innerText = item.description;

        const instaButton = document.createElement("button");
        instaButton.classList.add("member-box-instagram");
        instaButton.innerText = "Instagram";
        instaButton.onclick = () => window.open(item.instagram, "_blank");

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(descDiv);
        infoDiv.appendChild(instaButton);

        memberDiv.appendChild(nameDiv);
        memberDiv.appendChild(img);
        memberDiv.appendChild(infoDiv);

        fragment.appendChild(memberDiv);
    });

    container.appendChild(fragment);
}

