const MakeServer = require('./server');
const request = require('supertest');
const { expect } = require('chai');

const Auth = {
  list(ctx) {
    ctx.body = { msg: 'get /auth/login/:id to get login state' };
  },

  fetch(ctx, id) {
    if (id === '1') {
      ctx.body = { result: true };
    } else {
      ctx.body = { result: false };
    }
  },

  create(ctx) {
    ctx.body = { msg: 'this is replaced by login' };
  },

  login(ctx) {
    ctx.body = { action: 'login' };
  },

  logout(ctx) {
    ctx.body = { action: 'logout' };
  },
};

describe('test restful api urls merged by implicit & explicit configs', () => {
  let agent;
  let server;

  before(() => {
    const options = {
      controller: Auth,
      path: '/auth/login',
      urls: [{
        path: '/auth/login',
        handlers: {
          POST: 'login',
        },
      },
      {
        path: '/auth/logout',
        handlers: {
          GET: 'logout',
        },
      }],
    };

    server = MakeServer(options);
    agent = request.agent(server);
  });

  it('should login', async () => {
    const res = await agent.post('/auth/login');
    expect(res.body.action).to.eq('login');
  });

  it('should logout', async () => {
    const res = await agent.get('/auth/logout');
    expect(res.body.action).to.eq('logout');
  });

  it('should call list', async () => {
    const res = await agent.get('/auth/login');
    expect(res.body.msg).contain('/auth/login/');
  });

  it('should call fetch', async () => {
    let res = await agent.get('/auth/login/2');
    expect(res.body.result).to.be.false;
    res = await agent.get('/auth/login/1');
    expect(res.body.result).to.be.true;
  });

  after(() => {
    server.close();
  });
});
