export const errorMiddleware = (err, req, res, next) => {
  // 1. Log detalhado para o desenvolvedor (no terminal)
  console.error('🔥 ERROR LOG:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  // 2. Define o status code (padrão 500 se não especificado)
  const statusCode = err.status || 500;

  // 3. Define a mensagem que o usuário verá
  // Se for 500 e estivermos em produção, escondemos o erro real para não assustar/expor o sistema
  let displayMessage = err.message;
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    displayMessage = 'Algo deu errado em nossos servidores. Por favor, tente novamente mais tarde.';
  }

  // 4. Resposta padronizada para o cliente
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: displayMessage,
    // Inclui o stack apenas se NÃO estiver em produção (ajuda no debug via Postman/Insomnia)
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
