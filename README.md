# spider-book
爬取线上书籍变成epub格式，方便阅读；
目前支持 https://www.biduo.cc/ 网站的书籍

## how
1. 配置config.js
2. 执行 node index.js 将线上地址保存到{bookName}.json中
2. 根据自定义设置大小生成epub（第一次全量生成，卡的不要不要的, 所以做了1000章拆分）
