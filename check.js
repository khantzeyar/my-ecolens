const fs = require("fs");
const path = require("path");

// 检查 app 目录
const appDir = path.join(process.cwd(), "app");
const srcAppDir = path.join(process.cwd(), "src", "app");

console.log("检查目录存在情况:");
console.log("app/ 存在吗？", fs.existsSync(appDir));
console.log("src/app/ 存在吗？", fs.existsSync(srcAppDir));

// 检查 page.tsx 文件
const appPage = path.join(appDir, "page.tsx");
const srcAppPage = path.join(srcAppDir, "page.tsx");

console.log("app/page.tsx 存在吗？", fs.existsSync(appPage));
console.log("src/app/page.tsx 存在吗？", fs.existsSync(srcAppPage));
