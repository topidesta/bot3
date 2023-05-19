const { addKeyword } = require('@bot-whatsapp/bot')
const { Aki } = require('aki-api-v2');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// import state global
const globalState = require('../../state/globalState');


const regionName = {
    'es_animals': 'Español - Animales',
    'es': 'Español - Personas',
    'en_animals': 'Ingles  - Animales',
    'en_objects': 'Ingles  - Objetos',
    'en': 'Ingles  - Personas'
}

const flowAkinatorPlay = addKeyword(['1', 'Jugar'])
    .addAnswer(
        ['Iniciando Juego...'],
        { capture: false },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {

            const region = globalState.get(ctx.from).AkinatorLanguage

            if (globalState.get(ctx.from).AkinatorCurrentStep === 0) {
                try {
                    globalState.update(ctx.from, {
                        AkinatorInstance: new Aki({ region })
                    })
                    await globalState.get(ctx.from).AkinatorInstance.start();
                }
                catch (e) {
                    await flowDynamic(['Ha ocurrido un error, reintentando.']);
                    await fallBack();
                    return;
                }
            }
            await flowDynamic([
                {
                    media: 'https://es.akinator.com/bundles/elokencesite/images/akinator.png',
                    body: "Hola, soy *Akinator* \nPiense en un personaje real o ficticio.Voy a intentar adivinar quién es"
                }
            ]);

            await flowDynamic([
                globalState.get(ctx.from).AkinatorInstance.question,
                globalState.get(ctx.from).AkinatorInstance.answers.map((answer, index) => {
                    return `*(${index + 1})* - ${answer}`
                }).join('\n'),
            ])

        }
    )
    .addAnswer(
        'Digite la respuesta: ',
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {

            const userOtion = parseInt(ctx.body.toLowerCase().trim())
            const option = Number(userOtion);

            if (!option || option < 1 || option > 5) {
                await flowDynamic(['Opcion no valida, por favor seleccione una opcion valida.'])
                await fallBack()
                return
            }

            await globalState.get(ctx.from).AkinatorInstance.step(option - 1).catch(async (error) => {
                flowDynamic('❌ *Hubo un error al procesar la siguiente solicitud. Juego cancelado.*')
                await gotoFlow(flowAkinator)
            });

            if (globalState.get(ctx.from).AkinatorInstance.progress >= 80 || globalState.get(ctx.from).AkinatorInstance.currentStep >= 80) {
                await globalState.get(ctx.from).AkinatorInstance.win().catch(async (error) => {
                    if (globalState.get(ctx.from).AkinatorInstance.currentStep < 80) {
                        await globalState.get(ctx.from).AkinatorInstance.step(option);
                    } else {
                        await flowDynamic('❌*Se ha producido un error de Akinator.*')
                        await gotoFlow(flowAkinator)
                    }
                });
                ;

                const winMessage = `¡Akinator ha adivinado tu personaje!\n*Nombre*: ${globalState.get(ctx.from).AkinatorInstance.answers[0].name}\n*Descripción*: ${globalState.get(ctx.from).AkinatorInstance.answers[0].description}\n*Intento*: ${globalState.get(ctx.from).AkinatorInstance.currentStep}`

                await flowDynamic([
                    {
                        media: globalState.get(ctx.from).AkinatorInstance.answers[0].absolute_picture_path,
                        body: winMessage
                    }
                ]);

                await gotoFlow(flowAkinator)
                return

            } else {
                await flowDynamic([
                    globalState.get(ctx.from).AkinatorInstance.question,
                    globalState.get(ctx.from).AkinatorInstance.answers.map((answer, index) => {
                        return `*(${index + 1})* - ${answer}`
                    }).join('\n'),
                ])

                await fallBack()
            }
        })

const flowAkinatornLanguaje = addKeyword(['2', 'Idioma'])
    .addAnswer(
        [
            'Listado de idiomas y categorias',
            
            ' *(1)* - Español - Animales',
            ' *(2)* - Español - Personas',            
            ' *(3)* - Ingles  - Animales',            
            ' *(4)* - Ingles  - Objetos',
            ' *(5)* - Ingles  - Personas',
            ' *(0)* - Volver a menú anterior.'],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
            switch (ctx.body.toLowerCase().trim()) {
                case '1': globalState.update(ctx.from, { AkinatorLanguage: 'es_animals' }); break;
                case '2': globalState.update(ctx.from, { AkinatorLanguage: 'es' }); break;
                case '3': globalState.update(ctx.from, { AkinatorLanguage: 'en_animals' }); break;
                case '4': globalState.update(ctx.from, { AkinatorLanguage: 'en_objects' }); break;
                case '5': globalState.update(ctx.from, { AkinatorLanguage: 'en' }); break;
                case '0': await gotoFlow(flowAkinator); break;
                default:
                    await flowDynamic(['Opcion no valida, por favor seleccione una opcion valida.'])
                    await fallBack();
                    return false;
            }
        
            await flowDynamic([`Usted ha Cambiado idioma a : *${regionName[globalState.get(ctx.from).AkinatorLanguage]}* con exito.`])
            await gotoFlow(flowAkinator);
        }
    )



const flowAkinator = addKeyword(['akinator', '1'])
    .addAnswer(
        [
            'Ha selecionado *Akinator*',
            '_Akinator es un juego de adivinanzas en línea donde un genio virtual intenta adivinar en qué personaje estás pensando haciendo preguntas._',
            'Te presento los siguientes comandos.',
            ' *(1)* - *Jugar* Iniciar el juego',
            ' *(2)* - *Idioma* Configura idioma y Categoria',
            ' *(3)* - *Configuración* Consulta tu configuracion actual ',
            ' *(0)* - *Regresa al menú anterior* \n',
            'Por favor seleccione una opcion:\n',
            '*Nota:* Por defecto el idioma es *Español* y adivina *personas*.'
        ],
        { capture: true },
        async (ctx, { fallBack, flowDynamic, gotoFlow }) => {

            globalState.update(ctx.from, {
                AkinatorLanguage: globalState.get(ctx.from).AkinatorLanguage ?? 'es',
                AkinatorProgress: 0,
                AkinatorCurrentStep: 0,

            })

            if (['0', 'menu', 'menú'].includes(ctx.body.toLowerCase().trim())) {
                const flowGames = require('../menu/flowGames');
                await gotoFlow(flowGames);
                return
            }

            if (['3', 'configuración', 'configuracion'].includes(ctx.body.toLowerCase().trim())) {
                await flowDynamic([`Tu configuracion actual es: \n📍*Idioma:* ${regionName[globalState.get(ctx.from).AkinatorLanguage]}`])
                await fallBack()
                return
            }
        },
        [flowAkinatorPlay,flowAkinatornLanguaje]
    )

module.exports = flowAkinator