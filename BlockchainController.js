/**
 * Endpoint class that the client application will be able to access the blockchain dataset
 */
class BlockchainController {

    //Constructor with an instance of express.js app and blockchain class
    constructor(app, blockchainObj) {
        this.app = app;
        this.blockchain = blockchainObj;
        // Call of endpoint methods in the constructor to initialize route
        this.getBlockByHeight();
        this.requestOwnership();
        this.submitStar();
        this.getBlockByHash();
        this.getStarsByOwner();
        this.validateBlockchain()
    }

    // Endpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get("/block/height/:height", async (req, res) => {
            if(req.params.height) {
                const height = parseInt(req.params.height);
                let block = await this.blockchain.getBlockByHeight(height);
                if(block){
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }
            
        });
    }

    // Endpoint for the ownership of wallet (POST Endpoint)
    requestOwnership() {
        this.app.post("/requestValidation", async (req, res) => {
            if(req.body.address) {
                const address = req.body.address;
                const message = await this.blockchain.requestMessageOwnershipVerification(address);
                if(message){
                    return res.status(200).json(message);
                } else {
                    return res.status(500).send("An error happened!");
                }
            } else {
                return res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    // Endpoint to submit star and to initailize `requestOwnership` to have the message (POST endpoint)
    submitStar() {
        this.app.post("/submitstar", async (req, res) => {
            if(req.body.address && req.body.message && req.body.signature && req.body.star) {
                const address = req.body.address;
                const message = req.body.message;
                const signature = req.body.signature;
                const star = req.body.star;
                try {
                    let block = await this.blockchain.submitStar(address, message, signature, star);
                    if(block){
                        return res.status(200).json(block);
                    } else {
                        return res.status(500).send("An error happened!");
                    }
                } catch (error) {
                    return res.status(500).send(error);
                }
            } else {
                return res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    //Endpoint to get the block by using a hash (GET endpoint)
    getBlockByHash() {
        this.app.get("/block/hash/:hash", async (req, res) => {
            if(req.params.hash) {
                const hash = req.params.hash;
                let block = await this.blockchain.getBlockByHash(hash);
                if(block){
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }
        });
    }

    // This endpoint to request the list of owners
    getStarsByOwner() {
        this.app.get("/blocks/:address", async (req, res) => {
            if(req.params.address) {
                const address = req.params.address;
                try {
                    let stars = await this.blockchain.getStarsByWalletAddress(address);
                    if(stars){
                        return res.status(200).json(stars);
                    } else {
                        return res.status(404).send("Block Not Found!");
                    }
                } catch (error) {
                    return res.status(500).send("An error happened!");
                }
            } else {
                return res.status(500).send("Block Not Found! Review the Parameters!");
            }
            
        });
    }

    // Finally, to validate the blockchain
    validateBlockchain() {
        this.app.get('/validateBlockchain', async (req, res) => {
            try {
                await this.blockchain.validateChain()
                return res.status(200).send('Blockchain is valid')
            } catch (e) {
                if (Object.hasOwnProperty('errorLog')) {
                    return res.status(500).send(e.errorLog)
                }
                return res.status(500).send('Blockchain is compromised')
            }
        })
    }
}

module.exports = (app, blockchainObj) => { return new BlockchainController(app, blockchainObj);}