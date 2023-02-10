const PPSSPP = require('./external/sdk')
const {inputs} = require('./common')
const config = require('../package.json')
const ppsspp = new PPSSPP()

/*
    # Notes
    - PPSSPP ignores extra args (probably better to just not send them anyways)
    # Important requests for TASing
    `input.buttons.send` - used for toggling button pressing - {"buttons": {"button_key": pressed (true|false)}}
    `input.buttons.press` - used for pressing and releasing a button - {"button": button_id, "duration": frames_to_press_for}
    `input.analog.send` - what else? defaults to left stick, but both X and Y are required. - {"x": number (-1 to 1), "y": number (-1 to 1), "stick":"left"(default)|"right"}
*/
const inputQueue = [
    // freeplay -> venom -> vk -> assegai
    {event: 'input.buttons.press', args: {button: 'cross', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'cross', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'cross', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'cross', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'cross', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
    {event: 'input.buttons.press', args: {button: 'down', duration: 2}, waitBefore: 10},
]
// fucking love `nap`
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

async function main() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // go through queue
        for (const input of inputQueue) {
            console.log(`Sending "${input.event}" with args ${JSON.stringify(input.args)} and waiting for ${input.waitBefore}ms`)
            await sleep(input.waitBefore)
            const hitx = await ppsspp.send({ event: input.event, ...input.args })
            console.log(hitx)
        }
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