const fetch = require('fetch').fetchUrl;
const cheerio = require('cheerio');
const epub = require('epub-gen');


const INDEX_URL = 'https://www.biduo.cc/biquge/37_37732/';
const QueuePromise = require('promise-queue-easy');
const fs = require('fs');


fetch(INDEX_URL, function(error, meta, body) {
  // console.log('meta:', meta);
  // console.log('\n');
  // console.log(body.toString());
  const $ = cheerio.load(body.toString());

  const arr = [];
  const h = $('.box_con #list dl dd').each(function(i, elem) {
    const uri = $(elem).find('a').attr('href');
    arr.push(uri);
  });

  batchForHtml(arr);
});

async function batchForHtml(arr) {
  const pall = arr.map(item => {
    const url = INDEX_URL + item;
    return function() {
      return fetchItem(url);
    }
  });

  const contentArr = [];
  const qp = new QueuePromise(pall, {
    callback: function() {
      console.log('===all done===');
      fs.writeFileSync('./data.json', JSON.stringify(contentArr));
      // genEpub(contentArr);
    },
    errorInterrupt: false
  });

  let index = 0;

  qp.on('success', res => {
    console.log('success', ++index);
    contentArr.push(res);
  });
  qp.run();
}


function fetchItem(url) {

  return new Promise(function(reslove, reject) {
    fetch(url, function(error, meta, body) {
      // console.log(body.toString());
      const $ = cheerio.load(body.toString());
  
      const html = $('#content').html();
      const title  = $('.bookname h1').text();
      reslove({
        html,
        title
      });
    });
  }); 
}


function genEpub(contentArr) {
  const content = contentArr.map(item => {
    return {
      title:  item.title,
      data: item.html,
      author: '蜗牛狂奔'
    };
  })

  const option = {
    title: "wushangshendi", // *Required, title of the book.
    author: "zp", // *Required, name of the author.
    publisher: "🐌", // optional
    cover: "https://segmentfault.com/img/remote/1460000020416586?w=887&h=410", // Url or File path, both ok.
    content
};

  new epub(option, "./wushang.epub");
}