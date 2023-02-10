const PPSSPP = require('./external/sdk')
const {inputs} = require('./common')
const config = require('../package.json')
const ppsspp = new PPSSPP()

/*
    Inportant requests for TASing
    `input.buttons.send` - {"buttons": {"button_key": pressed (true|false)}}
    `input.buttons.press` - {"button": button_id, "duration": frames_to_press_for}
    `input.analog.send` - {"x": number (-1 to 1), "y": number (-1 to 1), "stick":"left"(default)|"right"}
*/

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