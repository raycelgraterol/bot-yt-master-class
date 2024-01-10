import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { run, runDetermine, runPromt, runOneTimeQuery, runArticleConent } from 'src/services/openai';
import chatbotFlow from './chatbot.flow';
import { getAllArticles, getArticle } from 'src/services/cleanpower/general-api'

// Declare a global variable
let globalVariable = [];

/**
 * Un flujo conversacion que es por defecto cunado no se contgiene palabras claves en otros flujos
 */
export default BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAction(async (ctx, { state, gotoFlow, flowDynamic, endFlow }) => {
        try {

            const dataBase = await getAllArticles();
            const chunkSize = 100;


            globalVariable = [];
            const processedArticles = [];

            for (let i = 0; i < dataBase.length; i += chunkSize) {
                const chunk = dataBase.slice(i, i + chunkSize);

                // Aquí puedes realizar el procesamiento que necesites para cada chunk de artículos
                const processedChunk = await runOneTimeQuery(chunk.join('\n'), ctx.body);

                if (processedChunk != "unknown") {
                    // Agregar el resultado procesado al arreglo final
                    const regex = /(ID: )?(\d+x\d+)/g;
                    const resultado = regex.exec(processedChunk);
                    const articleId = resultado ? resultado[2] : null;
                    processedArticles.push(articleId);
                }
            }

            if (processedArticles.length == 0) {
                await flowDynamic("No tengo un articulo relacionado con su pregunta, Escriba de otra manera para intentar consulta nuevamente.")

            } else if (processedArticles.length == 1) {

                const currentArticle = await getArticle(processedArticles[0]);

                const nameClient = ctx?.pushName ?? '';

                await showArticle(nameClient, currentArticle, flowDynamic, endFlow);

            } else {
                console.log(`[QUE QUIERES VERIFICAR ARTICULOS:`, processedArticles.join('\n'))
                // Assign the processedArticles array to the global variable with id and text
                await flowDynamic("Seleccione alguna de las siguientes opciones")

                processedArticles.sort((a, b) => a.id - b.id);
                processedArticles.forEach(async (code, index) => {
                    let currentArticle = await getArticle(code);
                    globalVariable.push({ id: index + 1, _id: code, Titulo: currentArticle.Titulo, Descripcion: currentArticle.Descripcion })
                    await flowDynamic(`Opcion ${index + 1}: ${currentArticle.Titulo}`)
                });

            }


        } catch (err) {
            console.log(`[ERROR]:`, err)
            return
        }
    })
    .addAnswer(` `, { capture: true },
        async (ctx, { gotoFlow, fallBack, endFlow, flowDynamic }) => {

            const nameClient = ctx?.pushName ?? '';

            const currentItem = globalVariable.find(x => x.id == ctx.body);

            if (currentItem) {

                await showArticle(nameClient, currentItem, flowDynamic, endFlow);

            } else {
                await fallBack("Selecciona solo una de las opciones disponibles.")
            }

        });


async function showArticle(nameClient: string, currentItem: any, flowDynamic: (message?: string) => void, endFlow: (message?: string) => void) {
    const articleSummary = await runArticleConent(nameClient, currentItem.Descripcion);

    const chunks = articleSummary.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic(chunk)
    }
    globalVariable = [];
    await endFlow;
}

