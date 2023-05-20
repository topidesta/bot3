const { addKeyword } = require('@bot-whatsapp/bot')

const flowHelp = addKeyword(['ayuda', '2'])
    .addAnswer('Anda telah memilih bantuan')
    .addAnswer(
        ['Dalam pengembangan...'],
        { capture: false },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
            const flowMain = require('../flowMain')
            await gotoFlow(flowMain)
            return
        }
    )


module.exports = flowHelp