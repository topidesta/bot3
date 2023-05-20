const { addKeyword, goT } = require('@bot-whatsapp/bot')

const flowAkinator = require('../games/flowAkinator')
const flowHangman = require('../games/flowHangman')

const flowGames = addKeyword(['juegos', 'uno', '1'])
    .addAnswer(
        [
            'Daftar Game:',
            ' *(1)* - *Akinator*',
            ' *(2)* - *Hangman* (Ahorcado)',
            ' *(0)* - *Kembali ke menu utama*',
            'Harap Pilih Salah satu Opsi:'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
            if (![1, 2, 0].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                await flowDynamic(['Opsi tidak valid, harap pilih opsi yang valid.'])
                await fallBack()
                return
            }

            if (ctx.body.toLowerCase().trim() === '0') {
                const flowMain = require('../flowMain')
                await gotoFlow(flowMain)
                return
            }

        },
        [flowAkinator, flowHangman]

    )

module.exports = flowGames