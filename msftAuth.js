/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var AuthenticationContext = require('adal-node').AuthenticationContext;
var constants = require('./msftConstants.js');
var resource = 'https://graph.microsoft.com/';

/**
 * Generate a fully formed uri to use for authentication based on the supplied resource argument
 * @return {string} a fully formed uri with which authentication can be completed.
 */
function getAuthUrl(url) {
    // Is it in Dev or Prod Mode?
    var adalConfiguration;
    if (url.match(/c9users.io/)) {
        // dev
        adalConfiguration = constants.adalConfigurationDev;

    }
    else {
        // prod
        adalConfiguration = constants.adalConfigurationProd;
    }
    var authUrl = adalConfiguration.authority + '/oauth2/authorize' +
        '?client_id=' + adalConfiguration.clientID +
        '&response_type=code' +
        '&redirect_uri=' + adalConfiguration.redirectUri;
    return authUrl;
}

/**
 * Gets a token for a given resource.
 * @param {string} code An authorization code returned from a client.
 * @param {string} res A URI that identifies the resource for which the token is valid.
 * @param {AcquireTokenCallback} callback The callback function.
 */
function getTokenFromCode(url, code, callback) {
    var adalConfiguration;
    if (url.match(/c9users.io/)) {
        // dev
        adalConfiguration = constants.adalConfigurationDev;

    }
    else {
        // prod
        adalConfiguration = constants.adalConfigurationProd;
    }
    
    var authContext = new AuthenticationContext(adalConfiguration.authority);
    authContext.acquireTokenWithAuthorizationCode(
        code,
        adalConfiguration.redirectUri,
        resource,
        adalConfiguration.clientID,
        adalConfiguration.clientSecret,
        function(error, token) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, token);
            }
        }
    );
}

function getTokenFromRefreshToken(url, refreshToken, callback) {
    var adalConfiguration;
    if (url.match(/c9users.io/)) {
        // dev
        adalConfiguration = constants.adalConfigurationDev;

    }
    else {
        // prod
        adalConfiguration = constants.adalConfigurationProd;
    }
    
    var authContext = new AuthenticationContext(adalConfiguration.authority);
    authContext.acquireTokenWithRefreshToken(
        refreshToken,
        adalConfiguration.clientID,
        adalConfiguration.clientSecret,
        resource,
        function(refreshErr, refreshResponse) {
            if (refreshErr) {
                callback(refreshErr, null);
            }
            else {
                callback(null, refreshResponse);
            }
        }
    );
}

exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getTokenFromRefreshToken = getTokenFromRefreshToken;