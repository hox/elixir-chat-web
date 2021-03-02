import React, { Component } from 'react';

type ChatBoxState = {
  messages: string[];
  socket?: WebSocket;
  textinput: string;
  connected: {
    pid: string;
    nickname: string;
  }[];
  nickname: string;
  pid: string;
};

export class ChatBox extends Component<{}, ChatBoxState> {
  constructor(props: any) {
    super(props);
    this.state = {
      messages: [],
      textinput: '',
      connected: [],
      nickname: '',
      pid: '',
    };
  }

  componentDidMount() {
    let socket = new WebSocket(
      localStorage.getItem('ws-url') || 'wss://ws.nw.wtf/ws/chat'
    );

    this.setState({ socket: socket });

    socket.addEventListener('open', () => {
      let temp = this.state.messages;
      temp.push('Connected to socket!');
      this.setState({
        messages: temp,
      });
    });

    socket.addEventListener('close', () => {
      let temp = this.state.messages;
      temp.push('Disconnected from socket!');
      this.setState({
        messages: temp,
      });
    });

    socket.addEventListener('error', () => {
      let temp = this.state.messages;
      temp.push('Disconnected from socket!');
      this.setState({
        messages: temp,
      });
    });

    socket.addEventListener('message', (ev) => {
      let json = JSON.parse(ev.data);
      if (json.op === 0) {
        this.setState({ pid: json.d.nickname });
        socket.send(JSON.stringify({ op: 1 }));
        setInterval(() => {
          socket.send(JSON.stringify({ op: 1 }));
        }, json.d.heartbeat_interval);
      }
      if (json.op === 4) {
        let temp = this.state.messages;
        temp.push(json.d.sender + ' : ' + json.d.message);
        this.setState({
          messages: temp,
        });
        var elem = document.getElementById('data');
        if (!elem) return;
        elem.scrollTop = elem.scrollHeight;
      }
      if (json.op === 5) {
        this.setState({
          connected: json.d.client_list,
        });
      }
      if (json.op === 7) {
        let conNew = this.state.connected;
        let pos = conNew.find((con: any) => con.pid === json.d.pid);
        if (!pos) return;
        pos.nickname = json.d.nickname;
        this.setState({
          connected: conNew,
        });
      }
    });
  }

  render() {
    return typeof window !== 'undefined' ? (
      <div>
        <div
          style={{
            height: 300,
            overflowY: 'scroll',
            border: 'solid black 3px',
            padding: '5px',
            width: '50%',
          }}
          id='data'
        >
          {this.state.messages.map((msg) => {
            return newMessage(msg);
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            let msg = this.state.textinput;
            if (msg == '') return;
            this.state.socket?.send(
              JSON.stringify({ op: 3, d: { message: msg } })
            );
            this.setState({ textinput: '' });
            return false;
          }}
        >
          <input
            id='chattext'
            type='text'
            value={this.state.textinput}
            onChange={(e) => {
              this.setState({ textinput: e.target.value });
            }}
            placeholder='Type something here!'
            style={{ width: '50%', marginTop: '5px', height: '40px' }}
          ></input>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            let nickname = this.state.nickname;
            if (nickname == '') return;
            this.state.socket?.send(
              JSON.stringify({ op: 6, d: { nickname: nickname } })
            );
            this.setState({ textinput: '' });
            return false;
          }}
        >
          <input
            id='nicknametext'
            type='text'
            value={this.state.nickname}
            onChange={(e) => {
              this.setState({ nickname: e.target.value });
            }}
            placeholder={
              this.state.connected.find((con) => con.pid == this.state.pid)
                ?.nickname
            }
          ></input>
          <input type='submit'></input>
        </form>
        <label>Websocket URL: </label>
        <select
          name='WS-URL'
          id='websocket-url'
          value={localStorage.getItem('ws-url') || 'wss://ws.nw.wtf/ws/chat'}
          onChange={(e) => {
            localStorage.setItem('ws-url', e.target.value);
          }}
        >
          <option value='wss://ws.nw.wtf/ws/chat'>Prod</option>
          <option value='ws://localhost:8080/ws/chat'>Dev</option>
        </select>
        <div>
          <p>Connected Clients</p>
          {this.state.connected.map((client) => {
            return newMessage(client.pid + ' : ' + client.nickname);
          })}
        </div>
      </div>
    ) : (
      <div>No</div>
    );
  }
}

function newMessage(yes: string): JSX.Element {
  return (
    <div>
      <span>{yes}</span>
      <br></br>
    </div>
  );
}
