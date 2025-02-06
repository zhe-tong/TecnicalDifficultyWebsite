const SHEET_URL = "https://script.google.com/macros/s/AKfycbw-fe_cEN0xxczSZWY3QVtu9yMajxXUjhHMivDvmpTGpyT94jSwg6p0J3roqSKEMa_q/exec"; // 替换为你的 URL
let cachedData = null; // 用于缓存数据，减少重复请求，提高加载速度

document.addEventListener("DOMContentLoaded", () => {
    // **获取 logo 和 sidebar**
    // const logo = document.getElementById("logo");
    // const sidebar = document.getElementById("sidebar");

    // **点击 logo 切换 sidebar 显示/隐藏**
    // logo.addEventListener("click", () => {
    //     sidebar.classList.toggle("show");
    // });

    // **点击 sidebar 外部区域时，隐藏 sidebar**
    // document.addEventListener("click", (event) => {
    //     if (!sidebar.contains(event.target) && !logo.contains(event.target)) {
    //         sidebar.classList.remove("show");
    //     }
    // });

    // **获取菜单项和内容区域**
    const menuItems = document.querySelectorAll(".header-menu li");
    const contentSections = document.querySelectorAll(".content-selection");

    // **点击菜单项，切换不同内容**
    menuItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            menuItems.forEach(menu => menu.classList.remove("active")); // 先移除所有菜单项的高亮状态
            contentSections.forEach(section => section.style.display = "none"); // 隐藏所有内容

            item.classList.add("active"); // 设置当前点击的菜单项为活跃状态
            contentSections[index].style.display = "block"; // 显示对应的内容
        });
    });

    fetchData(); // **初始化加载数据**

    setInterval(fetchData, 60000); // **每 60 秒刷新一次数据**
});

// **从 Google Sheets 获取数据**
function fetchData() {
    if (cachedData) {
        renderData(cachedData); // 如果已有缓存数据，则直接使用，避免重复请求
        return;
    }

    fetch(SHEET_URL)
        .then(response => response.json()) // 解析 JSON 数据
        .then(data => {
            cachedData = data; // 将数据缓存，减少 API 调用次数
            renderData(data); // 渲染数据
        })
        .catch(error => console.error("Error fetching data:", error)); // 处理错误
}

// **渲染数据**
function renderData(data) {
    // **按日期降序排列，确保最新数据在前**
    Object.keys(data).forEach(key => {
        data[key].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    // **填充不同的内容区**
    fillContent(document.getElementById("local-jam"), data.localJam);
    fillContent(document.getElementById("international-jam"), data.internationalJam);
    fillContent(document.getElementById("hangouts"), data.hangouts);
}

// **优化 fillContent，填充页面内容**
function fillContent(container, items) {
    if (!items || items.error) {
        container.innerHTML = `<p>Error loading data: ${items ? items.error : "No data found"}</p>`;
        return;
    }

    const fragment = document.createDocumentFragment(); // **使用 fragment 优化 DOM 操作，减少重绘**
    container.innerHTML = ""; // **清空旧内容**

    items.forEach(item => {
        // **创建外层卡片 div**
        const caseDiv = document.createElement("div");
        caseDiv.classList.add("case");

        // **创建图片容器**
        const pictureDiv = document.createElement("div");
        pictureDiv.classList.add("case-picture");
        const img = document.createElement("img");
        img.src = item.image; // 设置图片来源
        img.alt = item.title; // 设置图片的 alt 文字
        pictureDiv.appendChild(img); // 添加图片到容器

        // **创建内容容器**
        const containerDiv = document.createElement("div");
        containerDiv.classList.add("case-container");

        // **创建标题**
        const titleDiv = document.createElement("div");
        titleDiv.classList.add("case-title");
        titleDiv.innerHTML = `<p>${item.title}</p>`;

        // **创建日期**
        const dateDiv = document.createElement("div");
        dateDiv.classList.add("case-date");
        dateDiv.innerHTML = `<p>${item.date}</p>`;

        // **创建描述信息**
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("case-content");
        contentDiv.innerHTML = `<p>${item.description}</p>`;

        // **创建 Footage 按钮**
        const footageDiv = document.createElement("div");
        footageDiv.classList.add("case-footage");

        // **如果存在视频链接，则创建按钮**
        if (item.footage) {
            const button = document.createElement("button");
            button.textContent = "Footage";
            button.onclick = () => window.open(item.footage, "_blank"); // 点击按钮后打开新页面
            footageDiv.appendChild(button);
        }

        // **将所有元素组合**
        containerDiv.appendChild(titleDiv);
        containerDiv.appendChild(dateDiv);
        containerDiv.appendChild(contentDiv);
        containerDiv.appendChild(footageDiv);
        caseDiv.appendChild(pictureDiv);
        caseDiv.appendChild(containerDiv);

        // **使用 fragment，避免多次 DOM 更新**
        fragment.appendChild(caseDiv);
    });

    container.appendChild(fragment); // **一次性将所有元素添加到 DOM，提高性能**
}
