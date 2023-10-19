const epub = require('epub-gen');
const config = {
  chapterAuthor: '一个作者',
  bookName: 'long',
  cover: ''
}
// const config = require('./config.js');
const json = require(`./${config.bookName}.json`);
const SIZE = 1000;



run();

function run() {
  let start = 0;
  const len = json.length;
  while(1) {
    let end = SIZE + start; 
    end = Math.min(len, end);
    const data = json.slice(start, end);
    console.log(data[0].html);
    genEpub(data, config.bookName + '^' + start + '-' + end);

    start = end;
    if (start >= len) break;
  }
}


function genEpub(contentArr, fileName) {
  const content = contentArr.map(item => {
    console.log('title:', item.title);
    return {
      title:  item.title,
      data: '<div>' +  item.html + '</div>',
      author: config.chapterAuthor
    };
  })

  const option = {
    title: config.bookName, // *Required, title of the book.
    author: "zp", // *Required, name of the author.
    publisher: "🐌", // optional
    cover: config.cover, // Url or File path, both ok.
    content
  };

  new epub(option, "./" + fileName + ".epub");
}