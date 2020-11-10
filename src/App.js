import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loggedInUser: {}
    };
  }

  componentDidMount(){
    axios.get('/auth/user').then(res => {
      this.setState({ //if I lost state on the frontend like a refresh, my backend can bring the info back
        loggedInUser: res.data
      })
    }).catch(err => console.log(err))
  }

  //async login and async signup are the matching frontend functions so a user can signup and login to our site
  //add an axios request to this function
  //declare the await response to a variable
  async login() {
    const {email, password} = this.state
    let res = await axios.post('/auth/login', {email, password})
    this.setState({
      loggedInUser: res.data, //data is the object that always comes with the response
      email: "",
      password: ''
    })
  }

  async signup() {
    const {email, password} = this.state;
    let res = await axios.post('/auth/signup', {email, password})
    this.setState({
      loggedInUser: res.data,
      email: '',
      password: ''
    })
  }

  //This is really the user telling our app that we can close their sessions for now
  logout() {
    axios.post('/auth/logout');
    this.setState({
      loggedInUser: {}
    })
  }

  render() {
    let { loggedInUser, email, password } = this.state;
    return (
      <div className="form-container done">
        <div className="login-form">
          <h3>Auth w/ Bcrypt</h3>
          <div>
            <input
              value={email}
              onChange={e => this.setState({ email: e.target.value })}
              type="text"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              value={password}
              type="password"
              onChange={e => this.setState({ password: e.target.value })}
              placeholder="password"
            />
          </div>
          {loggedInUser.email ? (
            <button onClick={() => this.logout()}>Logout</button>
          ) : (
            <button onClick={() => this.login()}>Login</button>
          )}
          <button onClick={() => this.signup()}>Sign up</button>
        </div>

        <hr />

        <h4>Status: {loggedInUser.email ? 'Logged In' : 'Logged Out'}</h4>
        <h4>User Data:</h4>
        <p> {loggedInUser.email ? JSON.stringify(loggedInUser) : 'No User'} </p>
        <br />
      </div>
    );
  }
}

export default App;
