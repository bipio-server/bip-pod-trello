/**
 *
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

var https = require('https'),
  querystring = require('querystring');
  
function CreateBoard(podConfig) {
  this.name = 'create_board';
  this.description = 'Create A Board',
  this.description_long = 'Creates a New Trello Board',
  this.trigger = false;
  this.singleton = false;
  this.auto = false;
  this.podConfig = podConfig;
}

CreateBoard.prototype = {};

CreateBoard.prototype.getSchema = function() {
  return {
    "config": {
      "properties" : {
        "id_organization" : {
          "type" :  "string",
          "description" : "Organization ID"
        },
        "prefs_permissionLevel" : {
          "type" :  "string",
          "description" : "Permission Level",
          oneOf : [
            {
              "$ref" : "#/config/definitions/prefs_permissionLevel"
            }
          ]
        },
        "prefs_comments" : {
          "type" :  "string",
          "description" : "Comment Preferences",
          oneOf : [
            {
              "$ref" : "#/config/definitions/prefs_comments"
            }
          ]
        },
        "prefs_invitations" : {
          "type" :  "string",
          "description" : "Invitations Preferences",
          oneOf : [
            {
              "$ref" : "#/config/definitions/prefs_invitations"
            }
          ]
        },
        "prefs_selfJoin" : {
          "type" :  "boolean",
          "description" : "Self Join"
        },
      },
      "definitions" : {
        "prefs_permissionLevel" : {
          "description" : "Permission Level",
          "enum" : [ "private" , "org", "public" ],
          "enum_label" : ["Private", "Organization", "Public"],
          "default" : "private"
        },
        "prefs_comments" : {
          "description" : "Comment Preferences",
          "enum" : [ "members" , "observers", "org", "public", "disabled" ],
          "enum_label" : ["Members", "Observers", "Organization", "Public", "Disabled"],
          "default" : "members"
        },
        "prefs_invitations" : {
          "description" : "Invitation Preferences",
          "enum" : [ "members" , "admins" ],
          "enum_label" : ["Members", "Admins"],
          "default" : "members"
        }
      }
    },
    "imports": {
      "properties" : {
        "name" : {
          "type" :  "string",
          "description" : "Name"
        },
        "description" : {
          "type" :  "string",
          "description" : "Description"
        },
        
      }      
    },
    "exports": {
      "properties" : {
        "outstring" : {
          "type" : "string",
          "description" : "String goes out"
        }
      }
    }
  }
}

CreateBoard.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var host = 'api.trello.com',
    config = this.pod.getConfig();
    
  if (imports.name) {    
    var query = {
      token : sysImports.auth.oauth.token,
      key : config.oauth.consumerKey
    },
    options = {
      host: host,
      port: 443,
      path: '/1/boards?' +  querystring.stringify(query) + '&' + querystring.stringify(imports),
      method: 'POST'
    }
    
    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      var data = "";
      res.on('data', function(d) {
        data += d;
      });
      res.on("end", function() {
        if(res.statusCode !== 200) {
          next(data);
        } else {
          next(false, JSON.parse(data));
        }
      });
    });    
    
    req.end();
  }
}

// -----------------------------------------------------------------------------
module.exports = CreateBoard;