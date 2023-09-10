const { addKeyword, EVENTS } = require('@bot-whatsapp/bot')

// import flow
const flowHelp = require('./menu/flowHelp')
const flowContact = require('./menu/flowContact')
const flowGames = require('./menu/flowGames')

// import state global
const globalState = require('../state/globalState');

const flowMain = addKeyword(EVENTS.WELCOME)
    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
    .addAnswer(
        [
            'Saya membagikan perintah berikut yang dapat Anda lakukan',
            '👉 *(1)* *Juegos* Daftar Game',
            '👉 *(2)* *Ayuda*  Dapatkan Bantuan',
            '👉 *(3)* *Contacto* Hubungi Pengembang',
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
            globalState.update(ctx.from, { name: ctx.pushName ?? ctx.from })

            if (![1, 2, 3].includes(parseInt(ctx.body.toLowerCase().trim()))) {
                await flowDynamic(['Opcion no valida, por favor seleccione una opcion valida.'])
                await fallBack()
                return
            }
        },
        [flowGames, flowHelp, flowContact]
    )


module.exports = flowMain
