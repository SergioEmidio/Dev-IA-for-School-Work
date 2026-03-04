import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { xss } from 'express-xss-sanitizer';

export const securityMiddleware = (app) => {
  // 1. Headers de segurança (Protege contra injeção e esconde info do servidor)
  app.use(helmet());

  // 2. Prevenção de XSS (Limpa scripts maliciosos de inputs/prompts)
  app.use(xss());

  // 3. Prevenção de poluição de parâmetros (HPP)
  app.use(hpp());

  // 4. Rate Limiting (Proteção contra spam/ataques de força bruta)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
      success: false,
      message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // 5. Configuração de CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Acesso negado pelo CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    })
  );
};
