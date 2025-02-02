const SHEET_URL = "https://script.google.com/macros/s/AKfycbzTMuqicwe_RBcRKnIPH6YFDb4CtlMyFr9G1MdtNA9iRE-6X3Y2CLZ3mjZ9tb3wIbj2/exec";

document.addEventListener("DOMContentLoaded", () => {
    // 获取 logo 和 sidebar
    const logo = document.getElementById("logo");
    const sidebar = document.getElementById("sidebar");

    // 点击 logo 切换 sidebar 显示/隐藏
    logo.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    // 获取菜单项和内容区域
    const menuItems = document.querySelectorAll(".header-menu li");
    const contentSections = document.querySelectorAll(".content-selection");

    menuItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            menuItems.forEach(menu => menu.classList.remove("active"));
            contentSections.forEach(section => section.style.display = "none");

            item.classList.add("active");
            contentSections[index].style.display = "block";
        });
    });

    // **从 Google Sheets 获取数据**
    const contentContainer = document.getElementById("local-jam");

    fetch(SHEET_URL)
        .then(response => response.json())
        .then(data => {
            contentContainer.innerHTML = ""; // 清空旧内容

            data.sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期排序

            data.forEach(item => {
                // **创建 card**
                const caseDiv = document.createElement("div");
                caseDiv.classList.add("case");

                // **图片**
                const pictureDiv = document.createElement("div");
                pictureDiv.classList.add("case-picture");
                const img = document.createElement("img");
                img.src = item.image;
                img.alt = item.title;
                pictureDiv.appendChild(img);

                // **内容**
                const containerDiv = document.createElement("div");
                containerDiv.classList.add("case-container");

                // **标题**
                const titleDiv = document.createElement("div");
                titleDiv.classList.add("case-title");
                titleDiv.innerHTML = `<p>${item.title}</p>`;

                // **日期**
                const dateDiv = document.createElement("div");
                dateDiv.classList.add("case-date");
                dateDiv.innerHTML = `<p>${item.date}</p>`;

                // **描述**
                const contentDiv = document.createElement("div");
                contentDiv.classList.add("case-content");
                contentDiv.innerHTML = `<p>${item.description}</p>`;

                // **Footage 按钮**
                const footageDiv = document.createElement("div");
                footageDiv.classList.add("case-footage");

                if (item.footage) {
                    const button = document.createElement("button");
                    button.textContent = "Footage";
                    button.onclick = () => window.open(item.footage, "_blank");
                    footageDiv.appendChild(button);
                }

                // **组合结构**
                containerDiv.appendChild(titleDiv);
                containerDiv.appendChild(dateDiv);
                containerDiv.appendChild(contentDiv);
                containerDiv.appendChild(footageDiv);
                caseDiv.appendChild(pictureDiv);
                caseDiv.appendChild(containerDiv);

                // **添加到页面**
                contentContainer.appendChild(caseDiv);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});
