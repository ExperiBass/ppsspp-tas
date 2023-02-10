const PPSSPP = require('./external/sdk')
const { inputs } = require('./common')
const { writeFileSync} = require('fs')
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
const inputQueue = require('../inputs.json')
// fucking love `nap`
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

async function playInputs() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // go through queue
        // TODO: wait for timer to start (where in memory?)
        for (const input of inputQueue) {
            console.log(`Sending "${input.event}" with args ${JSON.stringify(input.args)} and waiting for ${input.waitBefore}ms`)
            await sleep(input.waitBefore)
            const hitx = await ppsspp.send({ event: input.event, ...input.args })
            console.log(hitx)
        }
    } catch (e) {
        console.error(e)
    } finally {
        ppsspp.disconnect()
    }
}
//playInputs()

let recordedInputs = []
async function recordInputs() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // listen
        let lastPressTimestamp = 0
        ppsspp.listen('input.buttons', (ev) => {
            const buttons = {}
            for (const [k, v] of Object.entries(ev.changed)) {
                buttons[k] = v
            }
            const thisPressTimestamp = Date.now()
            if (lastPressTimestamp === 0) {
                lastPressTimestamp = thisPressTimestamp // just so the first value isnt a stuoid big number
            }
            const input = {event: 'input.buttons.send', args: {buttons}, waitBefore: (thisPressTimestamp - lastPressTimestamp)}
            recordedInputs.push(input)
            console.log(`Saved input:`)
            console.log(input)
            lastPressTimestamp = thisPressTimestamp

        })
    } catch (e) {
        console.error(e)
    }
}
//recordInputs()


async function dumpMem() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // listen
        const result = await ppsspp.send({ event: 'memory.read', address: 0x08000000, size: 32*1000000 }) // 64MB
        const memory = Buffer.from(result.base64, 'base64')
        writeFileSync('./memdump.hex', memory, 'hex')
    } catch (e) {
        console.error(e)
    } finally {
        ppsspp.disconnect()
    }
}
dumpMem()
process.on('SIGINT', () => {
    //writeFileSync('./inputs.json', JSON.stringify(recordedInputs, null, 2), 'utf-8')
    ppsspp.disconnect()
})