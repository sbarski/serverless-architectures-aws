/**
 * Created by Peter Sbarski
 * Serverless Architectures on AWS
 * http://book.acloud.guru/
 * Last Updated: Feb 11, 2017
 * Modified by Maxim Makatchev on January 7, 2018
 */

'use strict';

var jwt = require('jsonwebtoken');
var request = require('request');

exports.handler = function(event, context, callback){
    if (!event.authToken) {
    	callback('Could not find authToken');
    	return;
    }

    var id_token = event.authToken.split(' ')[1];
    var access_token = event.accessToken;

    var secretBuffer = new Buffer(process.env.AUTH0_SECRET);
    jwt.verify(id_token, secretBuffer, function(err, decoded){
    	if(err){
    		console.log('Failed jwt verification: ', err, 'auth: ', event.authToken);
    		callback('Authorization Failed: ' + id_token + ", error: " + err + ", auth: " + event.authToken);
    	} else {

        var body = {
          'id_token': id_token,
          'access_token': access_token
        };

        var options = {
          url: 'https://'+ process.env.DOMAIN + '/userinfo',
          method: 'GET',
          json: true,
          body: body
        };

        request(options, function(error, response, body){
          console.log("Response0: " + JSON.stringify(response));
          if (!error && response.statusCode === 200) {
            console.log("Response1: " + JSON.stringify(response));
            callback(null, body);
          } else {
            callback(error);
          }
        });
    	}
    })
};

