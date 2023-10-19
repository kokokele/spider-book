// 基于 https://m.lwxs.com/shu/63167/
// https://www.dgzcgs.com/book/99623/
const fs = require('fs');
const fetch = require('fetch').fetchUrl;
const cheerio = require('cheerio');
const QueuePromise = require('promise-queue-easy');
const { log } = require('console');

const config = require('./config')


// const config = {
//   // domain: 'https://m.lwxs.com/'
//   domain: 'https://www.dgzcgs.com',
//   concurrency: 20,
//   bookName: 'long',
// }

const INDEX_URL = config.indexURL;

fetch(INDEX_URL, function(error, meta, body) {
  log(body.toString());
  const $ = cheerio.load(body.toString());

  const arr = [];
  const h = $('.chapterlist li').each(function(i, elem) {
    let url = $(elem).find('a').attr('href');
    if(url)  {
      arr.push(config.domain + url);
    }
  });
  log(arr)
  batchForHtml(arr);
});

async function batchForHtml(arr) {
  const concurrency = config.concurrency;
  const len = arr.length;
  const listLen = Math.ceil(len /  concurrency);
  // console.log('listLen:', listLen, len, concurrency);
  const queuePromiseList = [];
  for(let i = 0; i < concurrency; i++) {
    const start = i * listLen;
    const end = Math.min(start + listLen - 1, len - 1);
    const tempArr = arr.slice(start, end + 1);

    // log('index:', i,  'start:', start, 'end:', end, 'total:', len);
    queuePromiseList.push(startQueue(tempArr));
  }
  Promise.all(queuePromiseList).then(res => {
    console.log('all done!!!');
    let list = [];
    res.forEach(item => {
      list = list.concat(item);
    });
    fs.writeFileSync(`./${config.bookName}.json`, JSON.stringify(list));

    // 开始制作 -> 变为手动触发 gen.js
    // require('./gen.js');
  });
}

function startQueue(arr) {
  return new Promise((resolve, reject) => {
    const pall = arr.map(url => {
      return function() {
        return fetchItem(url);
      }
    });
  
    const contentArr = [];
    const qp = new QueuePromise(pall, {
      callback: function() {
        console.log('===all done===');
        resolve(contentArr);
      },
      errorInterrupt: false
    });
  
    let index = 0;
  
    qp.on('success', res => {
      // console.log('success', ++index, res.title);
      contentArr.push(res);
    });
    qp.run();
  });
}

function fetchItem(url) {
  console.log(url)

  return new Promise(function(reslove, reject) {
    fetch(url, function(error, meta, body) {
      const $ = cheerio.load(body.toString());
      
      const html = $('#content').html();
      const title  = $('.chaptertitle').text();
      // console.log('title:', title, 'content:', html);
      reslove({
        html,
        title
      });
    });
  }); 
}