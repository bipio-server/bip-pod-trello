/**
 *
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
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

function CreateList(podConfig) {
  this.name = 'create_list';
  this.description = 'Create A List',
  this.description_long = 'Adds a List to an existing Board',
  this.trigger = false;
  this.singleton = false;
  this.auto = false;
  this.podConfig = podConfig;
}

CreateList.prototype = {};

CreateList.prototype.getSchema = function() {
  return {
    "config": {
      "properties" : {
        "default_board_id" : {
          "type" :  "string",
          "description" : "Default Board ID",
          oneOf : [
            {
              '$ref' : '/renderers/member_boards#{id}'
            }            
          ],
          label : {
            '$ref' : '/renderers/member_boards/{name}'
          }
        }
      }      
    },
    "imports": {
      "properties" : {
        "name" : {
          "type" :  "string",
          "description" : "List Name"
        },
        "idBoard" : {
          "type" :  "string",
          "description" : "Board ID"
        }
      }
    },
    "exports": {
      "properties" : {
        "id" : {
          "type" : "string",
          "description" : "ID"
        },
        "name" : {
          "type" : "string",
          "description" : "Name"
        },
        "closed" : {
          "type" : "boolean",
          "description" : "List Closed"
        },
        "idBoard" : {
          "type" : "string",
          "description" : "Board ID"
        },
        "pos" : {
          "type" : "integer",
          "description" : "Position"
        }
      }
    }    
  }
}

CreateList.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  if (imports.name) {
    var opts = {
      name : imports.name,
      idBoard : imports.idBoard || channel.config.default_board_id
    }
    this.pod.trelloRequestParsed(
      'lists',
      opts ,
      sysImports,
      function(err, data) {
        next(err, data);
      },
      'POST'
    );
  }
}

// -----------------------------------------------------------------------------
module.exports = CreateList;