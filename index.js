const cheerio = require('cheerio');
const axios = require('axios');

const LATEST_HEADS_URL = 'https://minecraft-heads.com/custom-heads';

const fetchHeadInfo = async(headUrl) => {
    const {data} = await axios.get(`https://minecraft-heads.com${headUrl}`)
    const $ = cheerio.load(data);

    const id = Number(headUrl.split('/')[3].split('-')[0]);
    const name = $('#main > div > div.ym-col3 > div.ym-cbox.ym-clearfix > div > h2').text().trim()
    const category = $('#main > div > div.ym-col3 > div.ym-cbox.ym-clearfix > div > a:nth-child(9)').text().trim();
    const tags = [];
    $('.ym-contain-fl a').toArray().map(e => {
        if ($(e).attr('href') != undefined && $(e).attr('href').startsWith('/custom-heads/tags/var/')) {
            tags.push($(e).text().trim().replace(',', ''))
        }
    })

    const texture = `https://textures.minecraft.net/texture/${$('#UUID-Skin').text().trim()}`;

    return {
        id,
        name,
        category,
        tags,
        texture
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
    // const headUrlRequest = await Promise.all([fetchHeads(0), fetchHeads(80)]);
    // const headUrls = [].concat(...headUrlRequest);

    // const headInfo = await Promise.all(headUrls.map(fetchHeadInfo));
    
    const toInsert = [
        {
            "id": 46673,
            "name": "Loki",
            "category": "Humans",
            "tags": [
                "Hair (black)",
                "Male",
                "Marvel Comics",
                "Other Headgear"
            ],
            "texture": "https://textures.minecraft.net/texture/2c673c81985e149158f6b063e6be090aef54151f0f3afd7a8322303ab99280e9"
        },
        {
            "id": 46672,
            "name": "Stuffed Bell Pepper",
            "category": "Food & Drinks",
            "tags": [
                "Meal"
            ],
            "texture": "https://textures.minecraft.net/texture/b6c98b410123b0944422303798fc2db8cea0feeb09d0da40f5361b59498f3e8b"
        }
    ]

    const postHeads = await axios.post('https://rose.tweetzy.ca/minecraft/skulls', {
        data: toInsert
    })

    console.log(postHeads.data);
})();