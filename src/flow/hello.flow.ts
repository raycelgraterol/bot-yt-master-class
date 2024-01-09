import BotWhatsapp from '@bot-whatsapp/bot';

/**
 * Un flujo conversacion que responder a las palabras claves "hola", "buenas", ...
 */
export default BotWhatsapp.addKeyword(['hola', 'buenas'])
    .addAnswer(`¡Bienvenido a Clean Power! 😊
    
    En Clean Power, creemos que la energía solar es el futuro y estamos comprometidos a ayudar a nuestros clientes a alcanzar sus objetivos de energía renovable. ¡Gracias por confiar en nosotros! 🌞🌍
    `)

