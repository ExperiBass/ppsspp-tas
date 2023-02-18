const PPSSPP = require('./external/sdk')
const { inputs } = require('./common')
const { writeFileSync, readFileSync } = require('fs')
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
// ^ wipeout pure menu to rapier VK lap @60fps (terrible)


// fucking love `nap`
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

async function play() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        const played = await ppsspp.send({ event: 'replay.execute', version: 1, base64: readFileSync('./replay.txt', 'base64') })
        console.log(played)
        console.log(await ppsspp.send({event: 'replay.status'}))
    } catch (e) {
        console.error(e)
    } finally {
        ppsspp.disconnect()
    }
}
play()

let recordedInputs = []
async function record() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // listen
        await ppsspp.send({ event: 'replay.begin' })
        await sleep(5*1000)
        const replay = await ppsspp.send({ event: 'replay.flush' })
        console.log(replay)
        console.log(Buffer.from(replay.base64, 'base64'))
        await writeFileSync('./replay.txt', Buffer.from(replay.base64, 'base64'))
    } catch (e) {
        console.error(e)
    } finally {
        ppsspp.disconnect()
    }
}
//record()

async function dumpMem() {
    try {
        await ppsspp.autoConnect()
        const handshake = await ppsspp.send({ event: 'version', name: config.name, version: config.version })
        console.log('Connected to', handshake.name, 'version', handshake.version)

        // listen
        // TODO: https://github.com/hrydgard/ppsspp/blob/master/Core/Debugger/WebSocket/MemoryInfoSubscriber.cpp
        const result = await ppsspp.send({ event: 'memory.read', address: 0x08000000, size: 32*1000000 }) // 64MB
        const memory = Buffer.from(result.base64, 'base64')
        writeFileSync('./memdump.hex', memory, 'hex')
    } catch (e) {
        console.error(e)
    } finally {
        ppsspp.disconnect()
    }
}
//dumpMem()
process.on('SIGINT', () => {
    //writeFileSync('./inputs.json', JSON.stringify(recordedInputs, null, 2), 'utf-8')
    ppsspp.disconnect()
})