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
          "description" : "Self Join",
          "default" : false
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
        }
      }
    },
    "exports": {
      "properties" : {
        "id" : {
          "type" : "string",
          "description" : "Board ID"
        }
      }
    }
  }
}

CreateBoard.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  if (imports.name) {
    this.pod.trelloRequestParsed(
      'boards',
      imports ,
      sysImports,
      function(err, data) {
        next(err, data);
      },
      'POST'
    );
  }
}

// -----------------------------------------------------------------------------
module.exports = CreateBoard;