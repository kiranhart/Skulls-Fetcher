const cheerio = require('cheerio');
const axios = require('axios');

const LATEST_HEADS_URL = 'https://minecraft-heads.com/custom-heads';

const fetchHeadInfo = async(headUrl) => {
    const {data} = await axios.get(`https://minecraft-heads.com${headUrl}`)
    const $ = cheerio.load(data);

    const id = Number(headUrl.split('/')[3].split('-')[0]);
    const name = $('#main > div > div.ym-col3 > div.ym-cbox.ym-clearfix > div > h2').text().trim()
    
    let category = null;

    const categoryTry1 = $('#main > div > div.ym-col3 > div.ym-cbox.ym-clearfix > div > a:nth-child(10)').text().trim();
    const categoryTry2 = $('#main > div > div.ym-col3 > div.ym-cbox.ym-clearfix > div > a:nth-child(9)').text().trim();

    const possibleCategories = ['Alphabet', 'Animals', 'Blocks', 'Decoration', 'Food & Drinks', 'Humans', 'Humanoid', 'Miscellaneous', 'Monsters', 'Plants'];

    if (possibleCategories.includes(categoryTry1)) {
        category = categoryTry1;
    } else if (possibleCategories.includes(categoryTry2)) {
        category = categoryTry2;
    }

    const tags = [];
    $('.ym-contain-fl a').toArray().map(e => {
        if ($(e).attr('href') != undefined && $(e).attr('href').startsWith('/custom-heads/tags/var/')) {
            tags.push($(e).text().trim().replace(',', ''))
        }
    })

    const texture = `https://textures.minecraft.net/texture/${$('#UUID-Skin').text().trim()}`;
    const image = `https://minecraft-heads.com${$('#main > div > div.ym-col3 > div.ym-cbox.ym-clearfix > div > img').attr('src')}`;

    return {
        id,
        name,
        category,
        tags,
        texture,
        image
    };
}

const fetchHeads = async(start) => {
    const {data} = await axios.get(`${LATEST_HEADS_URL}?start=${start}`);
    const $ = cheerio.load(data);

    const heads = [];
    $('.itemList a').toArray().map(e => {
        heads.push($(e).attr('href'))
    });

    return heads;
}

(async() => {
    const headUrlRequest = await Promise.all([
        fetchHeads(0), 
        fetchHeads(80),
        fetchHeads(160)
    ]);

    const headUrls = [].concat(...headUrlRequest);
    const headInfo = await Promise.all(headUrls.map(fetchHeadInfo));

    try {
        const prod = 'https://rose.tweetzy.ca/minecraft/skulls';
        const local = 'http://localhost:2020/minecraft/skulls';
        
        const postHeads = await axios.post(prod, {
            data: headInfo,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });


        console.log(postHeads.data);

    } catch(error) {
        console.log(error);
    }

})();