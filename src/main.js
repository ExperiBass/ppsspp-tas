const PPSSPP = require('./external/sdk')
const {inputs} = require('./common')
const config = require('../package.json')
const ppsspp = new PPSSPP()

async function main() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)
    } catch(e) {
        console.error(e)
    } finally {
		ppsspp.disconnect();
	}
}
main()