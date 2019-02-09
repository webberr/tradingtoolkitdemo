import * as GTT from 'gdax-trading-toolkit';

const logger = GTT.utils.ConsoleLoggerFactory();
const products: string[] = ['BTC-USD', 'ETH-USD', 'LTC-USD'];
const tallies: any = {};
products.forEach((product: string) => {
    tallies[product] = {};
});

let count = 0;

GTT.Factories.GDAX.FeedFactory(logger, products).then((feed: GDAXFeed) => {
    feed.on('data', (msg: OrderbookMessage) => {
        count++;
        if (!(msg as any).productId) {
            tallies.other += 1;
        } else {
            const tally = tallies[msg.productId];
            if (!tally[msg.type]) {
                tally[msg.type] = 0;
            }
            tally[msg.type] += 1;
        }
        if (count % 1000 === 0) {
            printTallies();
        }
    });
}).catch((err: Error) => {
    logger.log('error', err.message);
    process.exit(1);
});

function printTallies() {
    console.log(`${count} messages received`);
    for (let p in tallies) {
        let types: string[] = Object.keys(tallies[p]).sort();
        let tally: string = types.map(t => `${t}: ${tallies[p][t]}`).join('\t');
        console.log(`${p}: ${tally}`);
    }
}
Ru