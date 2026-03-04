import { Router } from 'express';
// Se você já tiver o controller, importe-o aqui. Exemplo:
// import { sendMessage } from '../Controllers/chat.controller.js';

const router = Router();

// Rota padrão do chat
router.post('/', (req, res) => {
  res.json({ success: true, message: "Rota de chat conectada com sucesso!" });
});

// ESTA LINHA É A QUE FALTA PARA O SERVER.JS FUNCIONAR:
export default router;
