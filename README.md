# BigCorp

`BigCorp` is a Ðapp for managing shareholders and electing the president of the (not entirely real) company Big Corp.

This project was developed for a workshop on developing Ðapps on Ethereum held during the Blockchain Summer School 2017 at the University of Copenhagen.

It is based on the Truffle framework with webpack.

### Running BigCorp

First install [`node.js`](https://nodejs.org/en/), [`testrpc`](https://github.com/ethereumjs/testrpc), [`truffle`](http://truffleframework.com) and [`MetaMask`](https://metamask.io).

Run the command `testrpc` in your terminal. In a new tab, checkout this repository with `git clone [URL]`, and `cd` into it.

Run `truffle compile`, then `truffle test` (verify that all tests pass), then `truffle migrate`. Now, to start a host serving the front-end, execute `npm run dev`.

In MetaMask in Chrome, change the network to "Localhost 8545" and add some of the accounts generated by testrpc (it prints their public/private keys when you start it). Then select the account corresponding to account 0.

Finally, load the front-end by navigating to `http://localhost:8080/` in Chrome.