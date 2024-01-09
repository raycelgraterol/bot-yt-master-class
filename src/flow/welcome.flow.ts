import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { run, runDetermine, runPromt, runOneTimeQuery, runArticleConent } from 'src/services/openai';
import chatbotFlow from './chatbot.flow';
import { getAllArticles, getArticle } from 'src/services/cleanpower/general-api'

/**
 * Un flujo conversacion que es por defecto cunado no se contgiene palabras claves en otros flujos
 */
export default BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAction(async (ctx, {state, gotoFlow, flowDynamic}) => {
        try{

            const dataBase = await getAllArticles()
            const ai = await runOneTimeQuery(dataBase.join('\n'), ctx.body)

            console.log(`[QUE QUIERES COMPRAR:`, ai.toLowerCase())

            if(ai.toLowerCase().includes('unknown')){
                return 
            }

            const name = ctx?.pushName ?? ''

            console.log(ai);
            const regex = /(ID: )?(\d+x\d+)/g;
            const resultado = regex.exec(ai);
            const articleId = resultado ? resultado[2] : null;
            if (articleId) {
                const articleContent = await getArticle(articleId);
                
                const articleSummary = await runArticleConent(name, articleContent)

                await flowDynamic(articleSummary)            
            }else{
                await flowDynamic("No tengo un articulo relacionado con su pregunta, Escriba de otra manera para intentar consulta nuevamente.")
            }                       
            
        }catch(err){
            console.log(`[ERROR]:`,err)
            return
        }
    })

    // .addAction(async (ctx, { flowDynamic, state }) => {
    //     try{
    //         const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
    //         const name = ctx?.pushName ?? ''
    //         const dataBase = await getAllArticles()

    //         console.log(`[HISTORY]:`,newHistory)
    
    //         newHistory.push({
    //             role: 'user',
    //             content: ctx.body
    //         })

    //         const largeResponse = await run(name, dataBase.join('\n'), newHistory)

    //         await flowDynamic(largeResponse)

    //         // const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
    //         // for (const chunk of chunks) {
    //         //     await flowDynamic(chunk)
    //         // }

    //         newHistory.push({
    //             role: 'assistant',
    //             content: largeResponse
    //         })
        
    //         await state.update({history: newHistory})
    
    //     }catch(err){
    //         console.log(`[ERROR]:`,err)
    //     }
    // })


