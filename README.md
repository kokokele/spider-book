# spider-book
爬取线上书籍变成epub格式，方便阅读；
目前支持 笔趣阁 https://www.biduo.cc/ 网站的书籍

## how
1. 配置config.js
2. 执行 `sudo node index.js` 将线上地址保存到{bookName}.json中 
> 创建文件需要管理权限；并且如果全量生成，看书会卡的不要不要的, 所以做了1000章拆分
