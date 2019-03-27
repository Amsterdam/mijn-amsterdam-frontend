import 'react-app-polyfill/ie9';
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'styles/main.scss';

ReactDOM.render(<App />, document.getElementById('root'));
