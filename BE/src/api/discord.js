const express = require('express');
const https = require('https');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const btoa = require('btoa');
const { catchAsync } = require('../utils');

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.get('/login', (req, res) => {
  // res.redirect("http://localhost:3000/auth/aaa@gmail.com/aaa/aaa/6000/avatar");
  res.redirect("https://discord.com/api/oauth2/authorize?client_id=909109926578749480&redirect_uri=http%3A%2F%2F18.117.248.183%2Fapi%2Fdiscord%2Fcallback&response_type=code&scope=identify%20email");
});

router.get('/callback', catchAsync(async (req, res) => {
    try{
      if (!req.query.code) throw new Error('NoCodeProvided');
    } catch (err) {      
      console.log(err);		
      res.redirect(`http://18.117.248.183/auth/error`);
    }
    const { code } = req.query;
    try {
			const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
					code,
					grant_type: 'authorization_code',
					redirect_uri: 'http://18.117.248.183/api/discord/callback',
					scope: 'identify',
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await oauthResult.json();
			console.log("----- OAuth Data -----\n",oauthData);
      const userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });
      const userInfo = await userResult.json();
      console.log("----- User Data -----\n",userInfo);

      //-----------------------------------------------------------------
      //----- TODO : some action to store the user info to the user table
      //-----------------------------------------------------------------
      res.redirect(`http://18.117.248.183:3000/auth/${userInfo.email}/${userInfo.id}/${userInfo.username}/${userInfo.discriminator}/${userInfo.avatar}`);
		} catch (error) { 
      console.log(error);		
      res.redirect('http://18.117.248.183:3000/auth/error');
		}
  }));

module.exports = router;