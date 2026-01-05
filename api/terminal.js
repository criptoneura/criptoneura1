export default async function handler(req, res) {
    const { tipo } = req.query; 
    
    if (tipo === 'oro') {
        const response = await fetch(`https://api.finage.co.uk/last/forex/XAUUSD?apikey=${process.env.FINAGE_API_KEY}`);
        const data = await response.json();
        return res.json(data);
    }

    if (tipo === 'mercado') {
        const symbols = "BTC,ETH,USDT,XRP,BNB,SOL,USDC,TRX,DOGE,ADA,BCH,WBTC,XLM,LINK,LTC,AVAX,PAXG,XAG";
        const response = await fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbols}&tsyms=USD&api_key=${process.env.CRYPTO_API_KEY}`);
        const data = await response.json();
        return res.json(data);
    }
}
