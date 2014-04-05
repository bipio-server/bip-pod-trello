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

function CreateCard(podConfig) {
  this.name = 'create_card';
  this.description = 'Create A Card',
  this.description_long = 'Adds a Card to an existing List',
  this.trigger = false;
  this.singleton = false;
  this.auto = false;
  this.podConfig = podConfig;
}

CreateCard.prototype = {};

CreateCard.prototype.getSchema = function() {
  return {
    "config": {
      "properties" : {
        "default_list_id" : {
          "type" :  "string",
          "description" : "Default List ID",
          oneOf : [
            {
              '$ref' : '/renderers/board_lists#{id}'
            }            
          ],
          label : {
            '$ref' : '/renderers/board_lists/{name}'
          }
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
        "due" : {
          "type" :  "date",
          "description" : "Due"
        },
        "idList" : {
          "type" :  "string",
          "description" : "List ID"
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
          "description" : "Card Closed"
        },
        "url" : {
          "type" : "boolean",
          "description" : "Card URL"
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

CreateCard.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  if (imports.name) {
    var opts = {
      name : imports.name,
      description : imports.description,
      due : imports.due,
      idList : imports.idList || channel.config.default_list_id
    }

    this.pod.trelloRequestParsed(
      'cards',
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
module.exports = CreateCard;
