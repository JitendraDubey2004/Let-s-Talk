import fetch from 'node-fetch';

const key = 'AIzaSyCQk2YtTid-1eWPKfPZnoVy3JyyyXa6rVc';
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`;
const body = JSON.stringify({ email:'testuser12345@example.com', password:'Test12345', returnSecureToken:true });

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body,
});

const txt = await res.text();
console.log(res.status, txt);
