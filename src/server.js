import Koa from 'koa';
import socketIO from 'socket.io';
import bodyParser from 'koa-bodyparser';
import { createStore, combineReducers } from "redux";
import KoaRouter from 'koa-router';
import cors from 'koa2-cors';

const app = new Koa();
const controller = new KoaRouter();

var options = {
    origin: '*'
};

app.use(cors(options));

app.use(bodyParser());
app.use(controller.routes());
app.use(controller.allowedMethods());
const server = app.listen(4998);

console.log('Server started');

//web socket

const io = socketIO(server);
let socket;

io.on("connection", (thisSocket) => {
  console.log("connection");
  socket = thisSocket;
});

//redux
//TODO!:import module

const CREATE_EVENT = 'CREATE_EVENT';

let initialEvents = [];
let eventId = 1;

export function approvals(state = initialEvents, action) {
  switch (action.type) {
    case CREATE_EVENT:
      return [...state, {eventId: eventId++, ...action.payload }];
    default:
      return state;
  }
}

const store = createStore(
  combineReducers({approvals})
);

//console.log(store.getState());

//route endpoints
//TODO: promise-ify
controller.post('/event', (ctx, next) => {
    console.log(ctx.request.body)
    store.dispatch(ctx.request.body);
    ctx.response.status = 200;
    console.log(store.getState());

    socket.emit('ACTION_EVENT', {
        type: 'CREATED_EVENT',
        payload: ctx.request.body.payload
      })
  });
