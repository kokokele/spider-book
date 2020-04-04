const fs = require('fs');

const fetch = require('fetch').fetchUrl;
const cheerio = require('cheerio');
const config  = require('./config.js');
const QueuePromise = require('promise-queue-easy');

// const INDEX_URL = 'https://www.biduo.cc/biquge/37_37732/';
const INDEX_URL = config.indexURL;

fetch(INDEX_URL, function(error, meta, body) {
  const $ = cheerio.load(body.toString());

  if(!config.bookName) config.bookName = $('.box_con #info h1').text();
  if(!config.author) {
    const author = $('.box_con #info p').first().text();

    config.author = author.split('：')[1];
  }
  console.log('bookName:', $('.box_con #info h1').text(), config.author);

  const arr = [];
  const h = $('.box_con #list dl dd').each(function(i, elem) {
    let url = $(elem).find('a').attr('href');
    arr.push(config.domain + url);
  });
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

    console.log('index:', i,  'start:', start, 'end:', end, 'total:', len);
    queuePromiseList.push(startQueue(tempArr));
  }
  Promise.all(queuePromiseList).then(res => {
    console.log('all done!!!');
    let list = [];
    res.forEach(item => {
      list = list.concat(item);
    });
    fs.writeFileSync(`./${config.bookName}.json`, JSON.stringify(list));

    // 开始制作epub
    require('./gen.js');
  })
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
      console.log('success', ++index, res.title);
      contentArr.push(res);
    });
    qp.run();
  });
  
}

function fetchItem(url) {
  console.log(url)

  return new Promise(function(reslove, reject) {
    fetch(url, function(error, meta, body) {
      // console.log(body.toString());
      const $ = cheerio.load(body.toString());
  
      const html = $('#content').html();
      const title  = $('.bookname h1').text();
      // console.log('title:', title);
      reslove({
        html,
        title
      });
    });
  }); 
}