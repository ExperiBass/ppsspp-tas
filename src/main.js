const PPSSPP = require('./external/sdk')
const {inputs} = require('./common')
const config = require('../package.json')
const ppsspp = new PPSSPP()

/*
    Inportant requests for TASing
    `input.buttons.send` - used for toggling button pressing - {"buttons": {"button_key": pressed (true|false)}}
    `input.buttons.press` - used for pressing and releasing a button - {"button": button_id, "duration": frames_to_press_for}
    `input.analog.send` - what else? defaults to left stick, but both X and Y are required. - {"x": number (-1 to 1), "y": number (-1 to 1), "stick":"left"(default)|"right"}
*/


async function main() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // HIT X (for one frame)
        const PRESS = {button: 'cross', duration: 2}
        const hitx = await ppsspp.send({ event: 'input.buttons.press', ...PRESS })
        console.log(hitx)
    } catch(e) {
        console.error(e)
    } finally {
		ppsspp.disconnect()
	}
}
main()

process.on('SIGINT', () => {
    ppsspp.disconnect()
})