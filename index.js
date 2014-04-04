/**
 * 
 * The Bipio Trello Pod
 * 
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *  
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Pod = require('bip-pod'),
    Trello = new Pod({
        name : 'trello',
        description : 'Trello',
        description_long : 'Trello is the easiest way to organize anything with anyone.',
        authType : 'oauth',
        passportStrategy : require('passport-trello').Strategy,
        config : {
            "oauth": {
                "consumerKey" : "",
                "consumerSecret" : "",
                "scopes" : [
                    'read',
                    'write'
                ]
            }
        }
    });

// Include any actions
Trello.add(require('./create_board.js'));

// -----------------------------------------------------------------------------
module.exports = Trello;
