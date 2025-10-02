const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Configurar Redis para sessões
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.connect().catch(console.error);

// Configurar sessões com Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));
app.use(compression());

// Rate limiting otimizado para múltiplos usuários
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Aumentado para múltiplos usuários
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS otimizado
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Armazenar usuários conectados
const connectedUsers = new Map();

// Socket.IO para tempo real
io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);
  
  // Adicionar usuário à lista de conectados
  socket.on('user-join', (userData) => {
    connectedUsers.set(socket.id, {
      id: userData.id,
      name: userData.name,
      socketId: socket.id,
      connectedAt: new Date()
    });
    
    // Notificar outros usuários
    socket.broadcast.emit('user-connected', {
      id: userData.id,
      name: userData.name,
      connectedAt: new Date()
    });
    
    // Enviar lista de usuários conectados
    io.emit('users-list', Array.from(connectedUsers.values()));
  });
  
  // Mensagens em tempo real
  socket.on('send-message', (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const message = {
        id: require('uuid').v4(),
        userId: user.id,
        userName: user.name,
        content: messageData.content,
        timestamp: new Date(),
        type: messageData.type || 'text'
      };
      
      // Broadcast para todos os usuários
      io.emit('new-message', message);
    }
  });
  
  // Atualizações em tempo real
  socket.on('data-update', (updateData) => {
    socket.broadcast.emit('data-changed', updateData);
  });
  
  // Notificações
  socket.on('send-notification', (notification) => {
    if (notification.targetUserId) {
      // Notificação para usuário específico
      const targetUser = Array.from(connectedUsers.values())
        .find(user => user.id === notification.targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('notification', notification);
      }
    } else {
      // Notificação para todos
      io.emit('notification', notification);
    }
  });
  
  // Desconexão
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      
      // Notificar outros usuários
      socket.broadcast.emit('user-disconnected', {
        id: user.id,
        name: user.name,
        disconnectedAt: new Date()
      });
      
      // Atualizar lista de usuários
      io.emit('users-list', Array.from(connectedUsers.values()));
    }
    
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});

// Disponibilizar io para as rotas
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Rotas de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor VPS funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', require('./routes/api'));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor graciosamente...');
  process.exit(0);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket habilitado para tempo real`);
});
