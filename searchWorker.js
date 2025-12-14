self.onmessage = async (e) => {
    let {query} = e.data;
    if (!query) return;
    query = new RegExp(`(?:^ | )${(query.split('').join(' *'))}(?: |$)`, 'g');

    const results = [];
    const CHUNK_SIZE = 1;


    const yated = '◡';
    const tnua = '-';


    function convertToWeights(word) {
        let vowels = word.replace(/[\u05C1\u05C2]/g, ''); // remove right and left shin
        vowels = vowels. replace(/וּ([א-ת]|$)/g, 'וS$1'); // replace shuruk
        vowels = vowels.replace(/[א-ת]/g, "@");
        vowels = vowels.replace(/^@\u05BC/, "@"); // remove starting dagesh for not handling starting dagesh with shva. starting dagesh will be handled after
        vowels = vowels.replace(/(?:@\u05BC?\u05B0\u05BC?)+$/, ''); // shva or two in the end of a word
        vowels = vowels.replace(/@\u05B0\u05BC|@\u05BC\u05B0/g, yated); //shva with dagesh

        // Starting adding-u or shva. adding-u is found by the original word
        let weights = '';
        if (word.match(/^וּ.ְ/)) {
            weights = tnua;
            vowels = vowels.slice(4);
        } else if (word.match(/^וּ/)) {
            weights = yated;
            vowels = vowels.slice(2);
        } else {
            if (vowels.match(/^.\u05B0/)) {
                weights = yated;
                vowels = vowels.slice(2);
            }
        }

        vowels = vowels.replace(/[@\u05BC]/g, ''); // remove letters place holders and dagesh
        vowels = vowels.replace(/\u05B0\u05B0/g, yated); // two shva in the middle
        vowels = vowels.replace(/\u05B0/g, ''); // other shvas
        vowels = vowels.replace(/[\u05B1-\u05B3]/g, yated); // chataf

        const notYatedReg = new RegExp(`[^${yated}]`, 'g');
        vowels = vowels.replace(notYatedReg, '-'); // all vowels

        return weights + vowels;
    }

    function convertVerseToWeights(verse) {
        return verse.split(' ').map(convertToWeights).join(' ');
    }

    function compare(verse) {
        const weights = convertVerseToWeights(verse);
        return weights.matchAll(query).map(match => {
            const firstWordIndex = weights.slice(0, match.index).split(' ').length;
            const lastWordIndex = firstWordIndex + match[0].trim().split(' ').length;
            return verse.split(' ').slice(firstWordIndex, lastWordIndex).join(' ');
        });
    }

    async function* iterVerse() {
        for (let i = 0; i < 39; i++) {
            const res = await fetch(`data/book${i}.json`);
            const data = await res.json();
            for (const title of Object.keys(data)) { // one key
                const book = data[title];
                for (let c = 0; c < book.length; c++) {
                    const chapter = book[c];
                    for (let v = 0; v < chapter.length; v++) {
                        yield {
                            verse: chapter[v],
                            ref: `${title} ${c + 1} ${v + 1}`
                        };
                    }
                }
            }
        }
    }

    for await (const {verse, ref} of iterVerse()) {
        compare(verse).forEach(result => {
            results.push({
                ref,
                text: result,
            });
            if (results.length % CHUNK_SIZE === 0) {
                self.postMessage({ partialResults: [...results] });
            }
        })
    }

    if (results.length === 0) {
        self.postMessage({ results: [] });
    } else {
        self.postMessage({ results });
    }

};