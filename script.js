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
            // 先隐藏所有内容
            contentSections.forEach(section => {
                section.style.opacity = "0"; 
                section.style.visibility = "hidden"; 
                section.style.display = "none";  // 重要！设置为 none
            });
    
            // 移除所有菜单的 active 状态
            menuItems.forEach(menu => menu.classList.remove("active"));
    
            // 激活当前菜单项
            item.classList.add("active");
    
            // 显示选中的 section
            setTimeout(() => {
                contentSections[index].style.display = "grid";  // 让它重新显示
                contentSections[index].style.opacity = "1";  
                contentSections[index].style.visibility = "visible";  
            }, 300); // 300ms 过渡动画
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

function formatDate(isoString) {
    return isoString.split("T")[0]; // 直接截取前半部分
}

function fillContent(container, items) {
    if (!items || items.error) {
        container.innerHTML = `<p>Error loading data: ${items ? items.error : "No data found"}</p>`;
        return;
    }

    const fragment = document.createDocumentFragment(); // 使用 fragment 优化 DOM 操作
    container.innerHTML = ""; // 清空旧内容

    items.forEach(item => {
        // **创建 case 容器**
        const caseDiv = document.createElement("div");
        caseDiv.classList.add("case");
        caseDiv.onclick = () => openModal(item.image, formatDate(item.date), item.description, item.footage, item.title);

        // **创建图片**
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title;
        img.classList.add("case-image"); // 添加 class 控制样式

        // **创建标题**
        const titleDiv = document.createElement("div");
        titleDiv.classList.add("case-title");
        titleDiv.innerHTML = `<p>${item.title}</p>`;

        // **组合结构**
        caseDiv.appendChild(img);
        caseDiv.appendChild(titleDiv);
        fragment.appendChild(caseDiv);
    });

    container.appendChild(fragment); // 一次性插入，提高性能
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
