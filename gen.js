const epub = require('epub-gen');

const json = require('./data.json');

const START = 2000;
const END = json.length;

const data = json.slice(START, END);
genEpub(data, 'ws' + START + '-' + END);


function genEpub(contentArr, fileName) {
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

  new epub(option, "./" + fileName + ".epub");
}